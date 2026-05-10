import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY as string 
});

export async function getStorytellerAdvice(gameState: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert Blood on the Clocktower Storyteller. 
      The current game state (players, roles, status) is:
      ${JSON.stringify(gameState)}
      
      Provide a brief (1-2 sentence) piece of advice for the Storyteller. 
      Focus on balance, interesting interactions, or social dynamics based on the roles in play.
      Keep it cryptic, fun, and helpful for the Storyteller to run a great game.`,
    });
    
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "The spirits are silent... (Make sure your Gemini API Key is configured)";
  }
}
