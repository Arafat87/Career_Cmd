import { getDefaultModel } from "./db";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Custom fetch that disables response decompression to fix Z_DATA_ERROR (zlib crash)
const noDecompressFetch: typeof fetch = async (url, init) => {
  const headers = new Headers(init?.headers);
  headers.set("Accept-Encoding", "identity");
  return fetch(url, { ...init, headers });
};

export async function callAIWithMessages(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  modelOverride?: {
    provider: string;
    model_name: string;
    api_key: string;
    base_url: string;
    temperature: number;
    max_tokens: number;
  }
): Promise<string> {
  const model = modelOverride || (getDefaultModel() as any);

  if (!model) {
    throw new Error("No default model configured. Please configure a model in Settings.");
  }

  const provider = model.provider;
  const modelName = model.model_name;
  const apiKey = model.api_key;
  const baseUrl = model.base_url;
  const temperature = model.temperature;
  const maxTokens = model.max_tokens;

  switch (provider) {
    case "openai": {
      const client = new OpenAI({
        apiKey,
        baseURL: baseUrl || undefined,
        fetch: noDecompressFetch,
      });
      const response = await client.chat.completions.create({
        model: modelName,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt } as any,
          ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ],
      });
      return response.choices[0]?.message?.content || "";
    }

    case "anthropic": {
      const client = new Anthropic({ apiKey, fetch: noDecompressFetch });
      const response = await client.messages.create({
        model: modelName,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      });
      const content = response.content[0];
      return content.type === "text" ? content.text : "";
    }

    case "google": {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });
      // Google SDK: build conversation history
      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const lastMessage = messages[messages.length - 1];
      const chat = genModel.startChat({
        history,
        systemInstruction: systemPrompt,
      });
      const result = await chat.sendMessage(lastMessage.content);
      return result.response.text();
    }

    case "groq": {
      const client = new OpenAI({
        apiKey,
        baseURL: baseUrl || "https://api.groq.com/openai/v1",
        fetch: noDecompressFetch,
      });
      const response = await client.chat.completions.create({
        model: modelName,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt } as any,
          ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ],
      });
      return response.choices[0]?.message?.content || "";
    }

    case "openrouter": {
      const client = new OpenAI({
        apiKey,
        baseURL: baseUrl || "https://openrouter.ai/api/v1",
        fetch: noDecompressFetch,
        defaultHeaders: {
          "HTTP-Referer": "https://careercmd.app",
          "X-Title": "Career Cmd",
        },
      });
      const response = await client.chat.completions.create({
        model: modelName,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt } as any,
          ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ],
      });
      return response.choices[0]?.message?.content || "";
    }

    case "ollama": {
      const client = new OpenAI({
        apiKey: apiKey || "ollama",
        baseURL: baseUrl || "http://localhost:11434/v1",
        fetch: noDecompressFetch,
      });
      const response = await client.chat.completions.create({
        model: modelName,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt } as any,
          ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ],
      });
      return response.choices[0]?.message?.content || "";
    }

    case "custom": {
      const client = new OpenAI({
        apiKey: apiKey || "no-key",
        baseURL: baseUrl,
        fetch: noDecompressFetch,
      });
      const response = await client.chat.completions.create({
        model: modelName,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt } as any,
          ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ],
      });
      return response.choices[0]?.message?.content || "";
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// AI call with native web search support
export async function callAIWithWebSearch(
  prompt: string,
  systemPrompt: string,
  modelOverride?: {
    provider: string;
    model_name: string;
    api_key: string;
    base_url: string;
    temperature: number;
    max_tokens: number;
  }
): Promise<string> {
  const model = modelOverride || (getDefaultModel() as any);
  if (!model) throw new Error("No default model configured.");

  const { provider, model_name: modelName, api_key: apiKey, base_url: baseUrl, temperature, max_tokens: maxTokens } = model;

  switch (provider) {
    case "openai": {
      const client = new OpenAI({ apiKey, baseURL: baseUrl || undefined, fetch: noDecompressFetch });
      const response = await client.responses.create({
        model: modelName,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        tools: [{ type: "web_search" }],
      });
      return response.output_text || "";
    }

    case "anthropic": {
      const client = new Anthropic({ apiKey, fetch: noDecompressFetch });
      const response = await client.messages.create({
        model: modelName,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      });
      const textBlocks = response.content.filter((b: any) => b.type === "text");
      return textBlocks.map((b: any) => b.text).join("");
    }

    case "google": {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      });
      const result = await genModel.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + prompt }] }],
        tools: [{ googleSearch: {} }] as any,
      } as any);
      return result.response.text();
    }

    default:
      // Providers without web search: fall back to regular call
      return callAIWithMessages([{ role: "user", content: prompt }], systemPrompt, modelOverride);
  }
}
