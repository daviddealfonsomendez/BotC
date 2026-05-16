import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.MY_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ 
  apiKey: apiKey as string 
});

export async function askGrimoireAssistant(question: string, gameState: any, language: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Grimoire Librarian, an expert in Blood on the Clocktower rules and characters.
      A user is asking: "${question}"
      
      The current game context is: ${JSON.stringify(gameState)}
      The user preferred language is: ${language === 'es' ? 'Spanish' : 'English'}.
      
      Use your knowledge and the provided search tool to find accurate information from the Blood on the Clocktower wiki (wiki.bloodontheclocktower.com).
      If the question is in Spanish, search in English but answer in Spanish.
      Provide a clear, helpful, and concise answer.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return language === 'es' 
      ? "Los espíritus están en silencio... (Asegúrate de que tu clave de API de Gemini esté configurada)"
      : "The spirits are silent... (Make sure your Gemini API Key is configured)";
  }
}
