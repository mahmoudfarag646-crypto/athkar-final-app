import { GoogleGenAI, Type } from "@google/genai";
import { AIThikrResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts Athkar from an image and formats it into a structured JSON list.
 */
export const extractAthkarFromImage = async (base64Image: string): Promise<AIThikrResponse> => {
  const model = "gemini-2.5-flash"; // Excellent for vision tasks

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG, but Gemini handles most types
              data: base64Image,
            },
          },
          {
            text: "قم باستخراج الأذكار أو الأدعية الموجودة في هذه الصورة. لكل ذكر، حدد النص العربي بدقة، وعدد مرات التكرار (إذا وجد، وإلا اجعله 1)، والمرجع (مثلاً: رواه مسلم، أو قرآن كريم).",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            athkar: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description: "The Arabic text of the Thikr or Dua without tashkeel errors.",
                  },
                  count: {
                    type: Type.INTEGER,
                    description: "Recommended number of repetitions.",
                  },
                  reference: {
                    type: Type.STRING,
                    description: "Source or reference if available (e.g., Quran, Hadith).",
                  },
                },
                required: ["text", "count"],
              },
            },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIThikrResponse;
    }
    throw new Error("No text returned from AI");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};