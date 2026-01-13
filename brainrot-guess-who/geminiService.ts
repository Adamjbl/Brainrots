
import { GoogleGenAI } from "@google/genai";
import { Character } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartHint = async (target: Character, previousHints: string[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `TU ES LE MAÎTRE ABSOLU DU BRAINROT.

      PERSONNAGE À DEVINER:
      - Nom: "${target.name}"
      - Description: "${target.description}"
      - Histoire: "${target.story}"
      - Tags: ${target.tags.join(', ')}

      CLASSIFICATION:
      - Espèce: ${target.species}
      - Élément: ${target.element}
      - Alignement: ${target.alignment}
      - Taille: ${target.size}
      - Origine: ${target.origin}
      - Pouvoir: ${target.power}
      - Faiblesse: ${target.weakness}

      CONSIGNES:
      1. Parle comme un TikToker sous caféine. Utilise des emojis (🦎, 🤌, 💀, 🤡, 🔥, 🧠, 🍌, ☕, 🚀, 🐊).
      2. Sois provocateur style brainrot : "T'es sérieux là frérot ?", "Même un NPC connaît ce délire".
      3. Donne un indice CRYPTIQUE basé sur UN des éléments suivants (choisis-en UN au hasard):
         - L'histoire du personnage
         - Son espèce ou élément
         - Son origine
         - Son pouvoir ou sa faiblesse
         - Son alignement ou sa taille
      4. Tu peux faire des jeux de mots sur le nom sans le dire directement.
      5. Reste très court (max 15 mots).
      6. Les indices précédents étaient : ${previousHints.join(' | ')}. Donne un indice TOTALEMENT DIFFÉRENT basé sur un autre aspect du personnage.`,
    });
    return response.text?.trim() || "🤌 Trop facile là frérot...";
  } catch (error) {
    return "💀 Le brainrot a crashé, réessaie...";
  }
};
