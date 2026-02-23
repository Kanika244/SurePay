import { API_BASE_URL } from "./config";

export interface OCRResponse {
    success: boolean;
    data: {
        extractedIdNumber: string | null;
        extractedName: string | null;
    };
}

export const extractOcrData = async (file: File): Promise<OCRResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/poc/extract-ocr`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OCR extraction failed: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("OCR Service Error:", error);
        throw error;
    }
};
