
import { GoogleGenAI, Type } from "@google/genai";
import { TranslatedSegment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_PROMPT = `You are an elite linguistic engine and world-class Arabic educator.

TASK:
1. Extract and analyze ALL content from the provided input.
2. For EVERY Arabic word: ALWAYS include full Tashkeel (vowel marks).
3. CATEGORIZATION: Break the text into granular segments. 
   - Types: 'TITLE', 'HEADING', 'WORD', 'DEFINITION', 'EXAMPLE', 'TEXT', 'EXERCISE', 'NUMBER'.

4. MULTILINGUAL TRANSLATION:
   - Provide an accurate, high-quality translation in BOTH English and Filipino (Tagalog).
   - The Filipino translation should be natural and appropriate for an educational context.

5. NUMBER PRONUNCIATION (Purple Themed logic):
   IF you encounter a numerical value (digits like 5, 20, 1985):
   - Categorize it as 'NUMBER'.
   - In the "arabic" field, provide the FULL written-out word form of the number in Arabic with perfect Tashkeel.
   - In the "english" and "filipino" fields, provide the numeral and a brief guide on pronunciation/reading.

6. BILINGUAL TEACHING SCRIPTS (Green Themed logic):
   For EVERY 'DEFINITION' and 'EXAMPLE':
   - Generate "teachingScript" (Detailed English pedagogical explanation).
   - Generate "teachingScriptArabic" (Detailed Arabic pedagogical explanation with full Tashkeel).
   - Generate "teachingScriptFilipino" (Detailed Filipino/Tagalog pedagogical explanation).
   - Make these beautiful, accessible, and detailed using analogies for an average person.

7. EXERCISE SOLUTIONS (Yellow Themed logic):
   IF you encounter 'EXERCISE' content or questions:
   - Categorize the question as 'EXERCISE'.
   - Generate a field "exerciseAnswers" which is an ARRAY of objects.
   - For EVERY question, provide AT LEAST 3 distinct, correct answers.
   - Each answer object MUST have "arabic" (with full Tashkeel), "english" (translation), and "filipino" (Tagalog translation).

8. FORMAT: Return a JSON array of objects with keys "arabic", "english", "filipino", "type", "teachingScript", "teachingScriptArabic", "teachingScriptFilipino", and "exerciseAnswers".
9. NO MARKDOWN: Do not use asterisks or formatting symbols in the strings.`;

/**
 * Converts a File object to a base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Common configuration for the Gemini model.
 */
const generationConfig = {
  temperature: 0.2,
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        arabic: { type: Type.STRING, description: "Arabic text with full Tashkeel." },
        english: { type: Type.STRING, description: "Accurate English translation." },
        filipino: { type: Type.STRING, description: "Accurate Filipino (Tagalog) translation." },
        type: { 
          type: Type.STRING, 
          enum: ['TITLE', 'HEADING', 'DEFINITION', 'EXAMPLE', 'WORD', 'TEXT', 'EXERCISE', 'NUMBER'],
          description: "The category for visual distinction." 
        },
        teachingScript: { type: Type.STRING },
        teachingScriptArabic: { type: Type.STRING },
        teachingScriptFilipino: { type: Type.STRING },
        exerciseAnswers: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              arabic: { type: Type.STRING },
              english: { type: Type.STRING },
              filipino: { type: Type.STRING }
            },
            required: ["arabic", "english", "filipino"]
          }
        }
      },
      required: ["arabic", "english", "filipino", "type"]
    }
  }
};

/**
 * Extracts and translates Arabic text from a PDF file.
 */
export const extractAndTranslateArabicPdf = async (file: File): Promise<TranslatedSegment[]> => {
  const base64Data = await fileToBase64(file);

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data
            }
          }
        ]
      }
    ],
    config: generationConfig
  });

  const text = response.text;
  if (!text) throw new Error("No response text received.");

  try {
    return JSON.parse(text) as TranslatedSegment[];
  } catch (e) {
    throw new Error("The AI response could not be parsed. Please try again.");
  }
};

/**
 * Processes raw Arabic text (e.g., from clipboard).
 */
export const processArabicText = async (rawText: string): Promise<TranslatedSegment[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          { text: `PROCESS THE FOLLOWING INPUT TEXT:\n\n${rawText}` }
        ]
      }
    ],
    config: generationConfig
  });

  const text = response.text;
  if (!text) throw new Error("No response text received.");

  try {
    return JSON.parse(text) as TranslatedSegment[];
  } catch (e) {
    throw new Error("The AI response could not be parsed. Please try again.");
  }
};
