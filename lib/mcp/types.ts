export interface McpToolParam {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required?: boolean;
  enum?: string[];
  default?: string | number | boolean;
}

export interface McpToolResult {
  success: boolean;
  data: unknown;
  error?: string;
  toolName: string;
  duration: number;
}

export interface McpTool {
  name: string;
  description: string;
  serverName: string;
  params: McpToolParam[];
  handler: (params: Record<string, unknown>) => Promise<McpToolResult>;
}

export interface McpServer {
  name: string;
  description: string;
  icon: string;
  color: string;
  tools: McpTool[];
}
