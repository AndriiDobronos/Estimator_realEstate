
import { GoogleGenAI, Type } from "@google/genai";
import type { PropertyDetails, EstimationResult } from "../types";

const GEMINI_MODEL = 'gemini-2.5-flash';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    estimated_price_uah: {
      type: Type.NUMBER,
      description: 'Розрахункова вартість об\'єкта в українських гривнях (UAH).',
    },
    price_range_uah: {
      type: Type.STRING,
      description: 'Діапазон можливих цін, наприклад "1450000 - 1550000".',
    },
    justification: {
      type: Type.STRING,
      description: 'Коротке обґрунтування ціни на основі ринкових даних та наданих характеристик.',
    },
  },
  required: ['estimated_price_uah', 'price_range_uah', 'justification'],
};


function buildPrompt(details: PropertyDetails): string {
  return `
    Ти — досвідчений експерт з нерухомості в Україні. Твоє завдання — оцінити ринкову вартість нерухомості на основі наданих даних.

    Для оцінки використовуй актуальні дані з провідних українських сайтів нерухомості, таких як DIM.RIA та ЛУН. Проаналізуй ринок для вказаного міста/регіону.

    **Дані про об'єкт:**
    - Тип: ${details.type}
    - Місцезнаходження (місто, район): ${details.location}
    - Площа: ${details.area} кв.м.
    - Кількість кімнат: ${details.rooms}
    - Стан: ${details.condition}
    - Додатковий опис: ${details.description || 'Немає'}

    **Вимоги до відповіді:**
    Надай відповідь у форматі JSON, що відповідає наданій схемі.
    Відповідь повинна містити орієнтовну вартість в гривнях (UAH), діапазон цін та коротке обґрунтування цієї ціни, враховуючи поточну ситуацію на ринку нерухомості України для даного типу об'єкта та регіону.
  `;
}


export const estimatePropertyPrice = async (details: PropertyDetails): Promise<EstimationResult> => {
  const prompt = buildPrompt(details);

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const text = response.text.trim();
    const result = JSON.parse(text);
    return result as EstimationResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("Не вдалося обробити відповідь від сервісу. Спробуйте уточнити ваш запит.");
    }
    throw new Error("Не вдалося отримати оцінку. Будь ласка, спробуйте ще раз пізніше.");
  }
};
