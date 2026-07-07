import { McpServer, McpTool, McpToolResult } from "./types";
import { logToolHistory } from "@/lib/db";

const servers: Map<string, McpServer> = new Map();
const tools: Map<string, McpTool> = new Map();

export function registerServer(server: McpServer) {
  servers.set(server.name, server);
  for (const tool of server.tools) {
    tools.set(tool.name, tool);
  }
}

export function listServers(): McpServer[] {
  return Array.from(servers.values());
}

export function listTools(serverName?: string): McpTool[] {
  if (serverName) {
    return servers.get(serverName)?.tools ?? [];
  }
  return Array.from(tools.values());
}

export function getTool(name: string): McpTool | undefined {
  return tools.get(name);
}

export async function callTool(
  toolName: string,
  params: Record<string, unknown>,
  userId?: string
): Promise<McpToolResult> {
  const tool = tools.get(toolName);
  if (!tool) {
    return { success: false, data: null, error: `Tool "${toolName}" not found`, toolName, duration: 0 };
  }

  const start = Date.now();
  try {
    const result = await tool.handler(params);
    const duration = Date.now() - start;
    const finalResult = { ...result, duration, toolName };

    // Log to history (fire and forget)
    try {
      logToolHistory({
        tool_name: toolName,
        server_name: tool.serverName,
        input_json: JSON.stringify(params),
        output_json: JSON.stringify(finalResult.data).substring(0, 5000),
        success: finalResult.success ? 1 : 0,
        duration_ms: duration,
        user_id: userId || "default",
      });
    } catch {}

    return finalResult;
  } catch (e: any) {
    const duration = Date.now() - start;
    const result: McpToolResult = {
      success: false,
      data: null,
      error: e.message || "Tool execution failed",
      toolName,
      duration,
    };
    try {
      logToolHistory({
        tool_name: toolName,
        server_name: tool.serverName,
        input_json: JSON.stringify(params),
        output_json: JSON.stringify({ error: e.message }),
        success: 0,
        duration_ms: duration,
        user_id: userId || "default",
      });
    } catch {}
    return result;
  }
}
