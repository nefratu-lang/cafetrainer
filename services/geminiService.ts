import { GoogleGenAI, Chat, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

export const initGemini = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing. Please check your Vercel Environment Variables.");
  }
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const startChat = async (history: Content[] = []) => {
  if (!ai) {
    try {
      initGemini();
    } catch (e) {
      console.error(e);
      throw e; // Re-throw to be caught by UI
    }
  }
  if (!ai) throw new Error("Gemini AI not initialized");

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2, // Deterministic for educational consistency
      topP: 0.95,
      maxOutputTokens: 1000,
    },
    history: history
  });

  return chatSession;
};

export const sendMessage = async (message: string) => {
  if (!chatSession) {
    await startChat();
  }
  if (!chatSession) throw new Error("Chat session not available");

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};
