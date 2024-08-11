import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Helper function to generate a simplified memoId
function generateMemoId() {
  const randomNum = Math.floor(100 + Math.random() * 900); // Random 3-digit number
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase(); // Random 3-letter string
  return `${randomStr}${randomNum}`;
}

export async function POST(request: Request) {
  try {
    // Manually handle the body parsing
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ message: 'Invalid content type' }, { status: 400 });
    }

    const formData = await request.formData();
    
    // Generate a simplified memoId
    const memoId = generateMemoId();
    
    // Create a unique directory for each user
    const username = formData.get('username') as string;
    const uniqueDir = path.join(process.cwd(), 'public', 'uploads', `${username}_${memoId}`);
    await fs.mkdir(uniqueDir, { recursive: true });

    // Initialize an object to store all form data and files information
    const formEntries: { [key: string]: any } = {};
    const savedFiles = [];

    // Loop through formData entries to save all data and files
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Handle file uploads
        const file = value;
        const filePath = path.join(uniqueDir, file.name);

        // Read the file as a buffer and write it to the desired location
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);

        // Store the file path in the formEntries object
        savedFiles.push({ field: key, filePath });
        formEntries[key] = filePath; // Save the file path under the respective key
      } else {
        // Handle regular form fields
        formEntries[key] = value;
      }
    }

    // Add memoId to the form data
    formEntries.memoId = memoId;

    // Save the entire form data, including file paths, as a JSON file
    const userDataPath = path.join(uniqueDir, 'data.json');
    await fs.writeFile(userDataPath, JSON.stringify(formEntries, null, 2));

    return NextResponse.json({ message: 'Form data and files uploaded successfully', memoId, savedFiles });
  } catch (error) {
    console.error('Error during form submission:', error);
    return NextResponse.json({ message: 'Error during form submission', error: (error as Error).message }, { status: 500 });
  }
}
