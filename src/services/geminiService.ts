import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getDQSuggestions(tableName: string, errorDetails: any) {
  const prompt = `Como experto en Data Quality y Gobierno de Datos en GCP, analiza los siguientes errores de calidad en la tabla '${tableName}':
  
  Errores detectados: ${JSON.stringify(errorDetails)}
  
  Por favor, proporciona:
  1. Un resumen breve de la causa raíz más probable.
  2. Tres acciones sugeridas para mejorar la calidad (ej: cambio en esquema, limpieza en origen, nueva regla Dataplex).
  3. Clasificación de criticidad.
  
  Responde en un formato JSON estructurado.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rootCause: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          criticality: { 
            type: Type.STRING,
            description: "Baja, Media, Alta o Crítica"
          }
        },
        required: ["rootCause", "suggestions", "criticality"]
      }
    }
  });

  return JSON.parse(response.text);
}
