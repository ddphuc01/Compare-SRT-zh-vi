import { GoogleGenAI, Type } from '@google/genai';
import type { SubtitleEntry } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const CHUNK_SIZE = 100; // Process 100 subtitles per API call

interface RefinedSubtitle {
    index: number;
    refinedText: string;
}

const getPrompt = (chunk: any[]): string => {
    return `You are an expert Vietnamese translator specializing in subtitling for films and series.
Your task is to meticulously refine a Vietnamese translation of a Chinese subtitle file.
You will be provided with the original Chinese text and an initial Vietnamese translation.
Your objective is to produce a final Vietnamese translation that is natural, contextually perfect, and preserves the original's tone and nuance.

**CRITICAL INSTRUCTIONS:**
1.  **NO OMISSION & COMPLETE TRANSLATION:** The 'refinedText' MUST be a complete and faithful translation of the original Chinese text. Do not omit any words, concepts, or nuances. If the initial Vietnamese translation is missing information, you MUST add it back in to ensure full accuracy.
2.  **NO CHINESE CHARACTERS:** The 'refinedText' field MUST be entirely in Vietnamese. It is absolutely forbidden to include any original Chinese characters in the final output.
3.  **ACCURACY FIRST:** The original Chinese text is the ultimate source of truth for meaning. The initial translation is only a reference.
4.  **IMPROVE, DON'T JUST COPY:** You must correct all errors in meaning, grammar, and tone from the initial translation.
5.  **NATURAL DIALOGUE:** The final translation should sound like natural, spoken Vietnamese WITHOUT sacrificing the original meaning.

Process the following subtitle data. For each item, provide a refined Vietnamese translation in the 'refinedText' field.
Your response MUST be a valid JSON array of objects. Each object must contain the original "index" (integer) and the "refinedText" (string).
Do not include any explanations, markdown, or any text outside of the JSON array itself.

Subtitle data:
${JSON.stringify(chunk, null, 2)}
`;
}

export const refineSubtitles = async (
    originalSrt: SubtitleEntry[],
    translatedSrt: SubtitleEntry[],
    onProgress: (progress: number) => void
): Promise<SubtitleEntry[]> => {
    let rawText = ''; // To log the raw AI output for a failing chunk
    try {
        const combinedSubtitles = originalSrt.map(originalEntry => {
            const translatedEntry = translatedSrt.find(t => t.index === originalEntry.index);
            return {
                index: originalEntry.index,
                original: originalEntry.text,
                translation: translatedEntry ? translatedEntry.text : '',
            };
        }).filter(item => item.original && item.translation);

        if (combinedSubtitles.length === 0) {
            throw new Error("Không tìm thấy phụ đề khớp nhau để xử lý. Vui lòng kiểm tra xem các tệp có tương ứng với nhau không.");
        }

        const chunks = [];
        for (let i = 0; i < combinedSubtitles.length; i += CHUNK_SIZE) {
            chunks.push(combinedSubtitles.slice(i, i + CHUNK_SIZE));
        }

        const allRefinedData: RefinedSubtitle[] = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const prompt = getPrompt(chunk);
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                index: {
                                    type: Type.INTEGER,
                                    description: "The original subtitle index number."
                                },
                                refinedText: {
                                    type: Type.STRING,
                                    description: "The improved Vietnamese translation, containing no Chinese characters and no omitted information."
                                },
                            },
                            required: ["index", "refinedText"],
                        },
                    },
                },
            });

            rawText = response.text.trim();
            if (!rawText) {
                throw new Error("AI đã trả về một phản hồi trống. Điều này có thể do bộ lọc nội dung hoặc sự cố với mô hình.");
            }

            const jsonStartIndex = rawText.indexOf('[');
            const jsonEndIndex = rawText.lastIndexOf(']');
            let jsonString = '';

            if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
                jsonString = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
            } else {
                jsonString = rawText;
            }

            const refinedData: RefinedSubtitle[] = JSON.parse(jsonString);
            allRefinedData.push(...refinedData);
            
            // Report progress after each chunk
            const progress = ((i + 1) / chunks.length) * 100;
            onProgress(progress);
        }

        const newSrtEntries: SubtitleEntry[] = originalSrt.map(originalEntry => {
            const refined = allRefinedData.find(r => r.index === originalEntry.index);
            const initialTranslation = translatedSrt.find(t => t.index === originalEntry.index)?.text;
            
            return {
                ...originalEntry,
                text: refined ? refined.refinedText : (initialTranslation || '...'),
            };
        });

        return newSrtEntries;

    } catch (error: unknown) {
        console.error("Error during AI subtitle refinement:", error);

        if (error instanceof SyntaxError && error.message.includes('JSON')) {
             console.error("Received malformed content from AI:", rawText);
             throw new Error("AI đã trả về định dạng không hợp lệ. Phản hồi không phải là JSON hợp lệ. Vui lòng thử lại hoặc kiểm tra console để xem đầu ra thô từ AI.");
        }

        let errorMessage = "Đã xảy ra lỗi không mong muốn khi giao tiếp với AI.";
        if (error instanceof Error) {
             errorMessage = error.message;
        }

        if (errorMessage.toLowerCase().includes('api key')) {
            errorMessage = "Khóa API AI không hợp lệ hoặc bị thiếu. Vui lòng đảm bảo rằng nó được định cấu hình chính xác.";
        } else if (errorMessage.toLowerCase().includes('quota')) {
            errorMessage = "Bạn đã vượt quá hạn ngạch sử dụng API của mình. Vui lòng kiểm tra trạng thái tài khoản của bạn.";
        } else if (errorMessage.toLowerCase().includes('timed out') || errorMessage.toLowerCase().includes('timeout')) {
            errorMessage = "Yêu cầu đến AI đã hết thời gian chờ. Tệp phụ đề của bạn có thể quá lớn hoặc kết nối mạng không ổn định."
        }


        throw new Error(`Tinh chỉnh AI thất bại: ${errorMessage}`);
    }
};