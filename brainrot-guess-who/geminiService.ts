
import { GoogleGenAI } from "@google/genai";
import { Character } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartHint = async (target: Character, previousHints: string[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `TU ES LE MAÎTRE ABSOLU DU BRAINROT.
      Le joueur essaie de deviner : "${target.name}".
      Description : "${target.description}".
      Ses traits : ${target.tags.join(', ')}.

      CONSIGNES:
      1. Parle comme un TikToker sous caféine. Utilise des emojis (🦎, 🤌, 💀, 🤡, 🔥, 🧠, 🍌, ☕).
      2. Sois provocateur style brainrot : "T'es sérieux là frérot ?", "Même un NPC connaît ce délire".
      3. Donne un indice CRYPTIQUE basé sur le nom ou les traits sans dire le nom exact.
      4. Tu peux faire des jeux de mots sur le nom (ex: si c'est "Bombardiro" tu peux dire "ça boom boom").
      5. Reste très court (max 15 mots).
      6. Les indices précédents étaient : ${previousHints.join(' | ')}. Donne un indice DIFFÉRENT.`,
    });
    return response.text?.trim() || "🤌 Trop facile là frérot...";
  } catch (error) {
    return "💀 Le brainrot a crashé, réessaie...";
  }
};
