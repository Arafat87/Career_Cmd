import { NextResponse } from "next/server";
import {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  getMessages,
  createMessage,
  getConversationContext,
  getDefaultModel,
  getModelConfigs,
} from "@/lib/db";
import { callAIWithMessages } from "@/lib/ai";
import { getUserId } from "@/lib/auth-guard";
import { PERSONALITY_PREFIX, PERSONALITY_SUFFIX } from "@/lib/ai-personality";

function buildContextPrompt(context: any): string {
  const lines: string[] = [PERSONALITY_PREFIX];

  if (context.jobTitles?.length > 0) {
    lines.push("\nTARGET ROLES:");
    for (const jt of context.jobTitles) {
      const salary = jt.salary_min || jt.salary_max ? `$${jt.salary_min?.toLocaleString()}-$${jt.salary_max?.toLocaleString()}` : "Not specified";
      lines.push(`- ${jt.title} at ${jt.company || "N/A"} (${jt.location || "N/A"}) - ${salary} [${jt.category}]`);
    }
  }

  if (context.projects?.length > 0) {
    lines.push("\nPROJECTS:");
    for (const p of context.projects) {
      lines.push(`- ${p.name} [${p.status}] - ${p.technologies || "N/A"} (${p.category})`);
      if (p.description) lines.push(`  ${p.description}`);
    }
  }

  if (context.techStack?.length > 0) {
    lines.push("\nTECH STACK:");
    for (const t of context.techStack) {
      lines.push(`- ${t.name} (${t.category}) - Goal: ${t.proficiency_goal || "N/A"}`);
    }
  }

  if (context.certifications?.length > 0) {
    lines.push("\nCERTIFICATIONS:");
    for (const c of context.certifications) {
      lines.push(`- ${c.name} (${c.category})${c.expiration_date ? ` - Expires: ${c.expiration_date}` : ""}`);
    }
  }

  lines.push("\nUse this context to provide personalized advice. Reference specific roles, projects, and skills from the user's profile when relevant.");
  lines.push(PERSONALITY_SUFFIX);

  return lines.join("\n");
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      const messages = getMessages(parseInt(conversationId));
      return NextResponse.json(messages);
    }

    const conversations = getConversations(userId);
    return NextResponse.json(conversations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const { action, payload } = await request.json();

    switch (action) {
      case "create_conversation": {
        const context = getConversationContext(userId);
        const contextSnapshot = JSON.stringify(context);
        const model = getDefaultModel() as any;
        const modelUsed = model ? `${model.provider}/${model.model_name}` : "";

        const conversation = createConversation({
          title: payload?.title || "New Chat",
          model_used: payload?.model_id ? "" : modelUsed,
          context_snapshot: contextSnapshot,
        }, userId) as any;

        // Auto-generate greeting message
        const jobCount = context.jobTitles?.length || 0;
        const projectCount = context.projects?.length || 0;
        const skillCount = context.techStack?.length || 0;
        const certCount = context.certifications?.length || 0;

        const greetingContent = `CAREER CMD // AI ASSISTANT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Welcome, Operator. I am your AI assistant.

I can help you with:
  ◇ Career strategy and job search advice
  ◇ Resume and cover letter optimization
  ◇ Technical skill gap analysis
  ◇ Project planning and ideation
  ◇ Interview preparation

Context loaded: ${jobCount} job target${jobCount !== 1 ? "s" : ""}, ${projectCount} project${projectCount !== 1 ? "s" : ""}, ${skillCount} skill${skillCount !== 1 ? "s" : ""}, ${certCount} certification${certCount !== 1 ? "s" : ""}
Type a message to begin.`;

        createMessage({
          conversation_id: conversation.id,
          role: "assistant",
          content: greetingContent,
          attachments: "[]",
          message_type: "text",
          model_used: "",
        });

        return NextResponse.json(conversation);
      }

      case "send_message": {
        const { conversationId, content, attachments } = payload;
        const conversation = getConversation(conversationId, userId) as any;
        if (!conversation) {
          return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        // Store user message
        const userMessage = createMessage({
          conversation_id: conversationId,
          role: "user",
          content,
          attachments: JSON.stringify(attachments || []),
          message_type: payload.message_type || "text",
          model_used: "",
        }) as any;

        // Build context-aware system prompt
        const context = JSON.parse(conversation.context_snapshot || "{}");
        const systemPrompt = buildContextPrompt(context);

        // Get recent message history (last 20)
        const allMessages = getMessages(conversationId) as any[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recentMessages = allMessages.slice(-20).map((m: any) => ({
          role: m.role,
          content: m.content,
        }));

        // Determine model to use
        let modelOverride = undefined;
        if (conversation.model_used) {
          // Conversation has a specific model override
          const configs = getModelConfigs() as any[];
          const [provider, ...modelParts] = conversation.model_used.split("/");
          const modelName = modelParts.join("/");
          const config = configs.find((c: any) => c.provider === provider && c.model_name === modelName);
          if (config) {
            modelOverride = {
              provider: config.provider,
              model_name: config.model_name,
              api_key: config.api_key,
              base_url: config.base_url,
              temperature: config.temperature,
              max_tokens: config.max_tokens,
            };
          }
        }

        // Call AI
        const aiResponse = await callAIWithMessages(recentMessages, systemPrompt, modelOverride);

        // Store assistant message
        const model = getDefaultModel() as any;
        const modelUsed = conversation.model_used || (model ? `${model.provider}/${model.model_name}` : "");

        const assistantMessage = createMessage({
          conversation_id: conversationId,
          role: "assistant",
          content: aiResponse,
          attachments: "[]",
          message_type: "text",
          model_used: modelUsed,
        }) as any;

        // Auto-generate title from first user message
        if (allMessages.filter((m: any) => m.role === "user").length === 1) {
          const title = content.length > 50 ? content.substring(0, 50) + "..." : content;
          updateConversation(conversationId, { title }, userId);
        }

        return NextResponse.json({ userMessage, assistantMessage });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error.message || "Chat request failed" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { id, title, model_used } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });
    }

    updateConversation(id, { title, model_used }, userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });
    }

    deleteConversation(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
