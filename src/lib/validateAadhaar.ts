import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { validateVerhoeff } from '@/lib/verhoeffAlgorithm'; // Ensure this function is implemented

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
 * Finds potential Aadhaar UID candidates in the extracted text.
 * @param text - Text extracted from the image.
 * @returns Array of UID candidates.
 */
function findUidCandidates(text: string): string[] {
    const regex = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
    const matches = text.match(regex);
    return matches || [];
}

/**
 * Validates the UID using the Verhoeff algorithm.
 * @param uid - The UID string to validate.
 * @returns Boolean indicating whether the UID is valid.
 */
function validateUid(uid: string): boolean {
    const sanitizedUid = uid.replace(/\s/g, '');
    return validateVerhoeff(sanitizedUid);
}

/**
 * Main function to validate the Aadhaar card from an image.
 * @param imageBuffer - Buffer of the uploaded image file.
 * @returns Boolean indicating whether a valid Aadhaar number was found.
 */
export async function validateAadhaar(imageBuffer: Buffer): Promise<boolean> {
    const text = await extractTextFromImage(imageBuffer);

    console.log("Extracted Text:", text);  // Log the extracted text

    const uidCandidates = findUidCandidates(text);

    console.log("UID Candidates:", uidCandidates);  // Log the found UID candidates

    for (const uid of uidCandidates) {
        if (validateUid(uid)) {
            console.log("Valid UID Found:", uid);  // Log the valid UID
            return true; // Valid Aadhaar found
        }
    }

    return false; // No valid Aadhaar found
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('aadharCard') as File;

        if (!file) {
            return NextResponse.json(
                { isValid: false, message: 'No Aadhaar card provided.' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        const isValid = await validateAadhaar(imageBuffer);

        return NextResponse.json({ isValid });
    } catch (error) {
        console.error('Aadhaar validation error:', error);
        return NextResponse.json(
            { isValid: false, message: Error.name || 'Unknown error' },
            { status: 500 }
        );
    }
}
