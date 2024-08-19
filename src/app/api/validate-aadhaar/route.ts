import { NextResponse } from 'next/server';
import { validateAadhaar } from '@/lib/validateAadhaar';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('aadharCard') as File;

        if (!file) {
            return NextResponse.json({ isValid: false, message: 'No Aadhaar card provided.' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const isValid = await validateAadhaar(Buffer.from(buffer));

        return NextResponse.json({ isValid });
    } catch (error) {
        console.error('Aadhaar validation error:', error);
        return NextResponse.json({ isValid: false, message: Error.name }, { status: 500 });
    }
}
