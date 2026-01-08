import { GoogleGenAI, Type } from "@google/genai";
import { Wheel, Segment } from "../types";

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateWheelConfig = async (prompt: string): Promise<Partial<Wheel>> => {
  if (!process.env.API_KEY) {
    throw new Error("Missing API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a spin wheel configuration for: ${prompt}.`,
    config: {
      systemInstruction: `You are a creative assistant for a Spin Wheel app. 
      Generate a list of segments based on the user's topic. 
      Assign vibrant, contrasting hex colors to each segment. 
      Limit to between 4 and 12 segments.
      Weights should generally be equal (1) unless the topic implies probability.
      If the segments refer to specific things like websites, products, or places, try to include a relevant 'url' for each segment (e.g., a wikipedia link, a google search link, or a dummy example link).`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                color: { type: Type.STRING },
                weight: { type: Type.NUMBER },
                url: { type: Type.STRING },
              },
              required: ["label", "color", "weight"],
            },
          },
        },
        required: ["title", "segments"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  const data = JSON.parse(text);

  return {
    title: data.title,
    segments: data.segments.map((s: any) => ({
      ...s,
      id: generateId(),
    })),
  };
};