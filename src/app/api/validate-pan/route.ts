import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const OCR_SPACE_API_KEY = process.env.NEXT_PUBLIC_OCR_SPACE_KEY; // Replace with your actual API key

/**
 * Extracts text from the provided image buffer using OCR Space API.
 * @param imageBuffer - Buffer of the image file.
 * @returns Extracted text from the image.
 */
async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    const base64Image = imageBuffer.toString('base64');

    const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
            'apikey': OCR_SPACE_API_KEY || '',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            base64image: `data:image/png;base64,${base64Image}`
        })
    });

    const data = await response.json();
    return data.ParsedResults?.[0]?.ParsedText || '';
}

/**
 * Finds potential PAN candidates in the extracted text.
 * @param text - Text extracted from the image.
 * @returns Array of PAN candidates.
 */
function findPanCandidates(text: string): string[] {
    const regex = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
    const matches = text.match(regex);
    return matches || [];
}

/**
 * Validates the PAN based on its structure and specific rules.
 * @param pan - The PAN string to validate.
 * @returns Boolean indicating whether the PAN is valid.
 */
function validatePan(pan: string): boolean {
    // Validate the general PAN structure
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!regex.test(pan)) return false;

    // Check the fourth character for the type of assessee
    const typeChar = pan[3];
    const validTypes = 'CPHFATBLJG';
    if (!validTypes.includes(typeChar)) return false;

    // Check the fifth character for the first letter of the surname
    const surnameInitial = pan[4];
    const surnameRegex = /^[A-Z]$/;
    if (!surnameRegex.test(surnameInitial)) return false;

    return true;
}

/**
 * Main function to validate the PAN card from an image.
 * @param imageBuffer - Buffer of the uploaded image file.
 * @returns Boolean indicating whether a valid PAN number was found.
 */
export async function validatePanCard(imageBuffer: Buffer): Promise<boolean> {
    const text = await extractTextFromImage(imageBuffer);

    console.log("Extracted Text:", text);  // Log the extracted text

    const panCandidates = findPanCandidates(text);

    console.log("PAN Candidates:", panCandidates);  // Log the found PAN candidates

    for (const pan of panCandidates) {
        if (validatePan(pan)) {
            console.log("Valid PAN Found:", pan);  // Log the valid PAN
            return true; // Valid PAN found
        }
    }

    return false; // No valid PAN found
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('panCard') as File;

        if (!file) {
            return NextResponse.json(
                { isValid: false, message: 'No PAN card provided.' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        const isValid = await validatePanCard(imageBuffer);

        return NextResponse.json({ isValid });
    } catch (error) {
        console.error('PAN validation error:', error);
        return NextResponse.json(
            { isValid: false, message: Error.name || 'Unknown error' },
            { status: 500 }
        );
    }
}
