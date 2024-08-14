import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import pdfParse from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to generate a simplified memoId
function generateMemoId() {
  const randomNum = Math.floor(100 + Math.random() * 900);
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${randomStr}${randomNum}`;
}

// Function to process text with Google Gemini (Generative AI)
async function processTextWithGemini(text: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in the environment variables');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  console.log('Sending text to Gemini API:', text);

  const result = await model.generateContent([text]);

  console.log('Gemini API result:', result);

  if (!result || !result.response || !result.response.text) {
      throw new Error('Invalid response from Gemini API');
  }

  return result.response.text();
}

export async function POST(request: Request) {
  try {
    console.log('GEMINI_API_KEY:', process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    console.log('AZURE_STORAGE_CONNECTION_STRING:', process.env.NEXT_PUBLIC_AZURE_STORAGE_CONNECTION_STRING);

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ message: 'Invalid content type' }, { status: 400 });
    }

    const formData = await request.formData();
    const memoId = generateMemoId();
    const formEntries: { [key: string]: any } = {};
    const savedFiles = [];
    const extractedTexts = [];
    const geminiResponses: string[] = [];

    const AZURE_STORAGE_CONNECTION_STRING = process.env.NEXT_PUBLIC_AZURE_STORAGE_CONNECTION_STRING as string;
    
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING is not defined in the environment variables');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerName = 'inputpdfs';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const file = value;
        const blobName = `${memoId}/${file.name}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await blockBlobClient.upload(buffer, buffer.length);

        try {
          const pdfText = await pdfParse(buffer);
          extractedTexts.push(pdfText.text);
        } catch (parseError) {
          console.error('Error parsing PDF:', parseError);
          throw new Error('Failed to parse PDF');
        }

        const blobUrl = blockBlobClient.url;
        savedFiles.push({ field: key, blobUrl });
        formEntries[key] = blobUrl;
      } else {
        formEntries[key] = value;
      }
    }

    formEntries.memoId = memoId;

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 100 });

    for (const text of extractedTexts) {
      try {
        const chunks = await splitter.splitText(text);
        console.log('Text chunks:', chunks.length);

        for (const chunk of chunks) {
          try {
            const response = await processTextWithGemini(chunk);
            console.log(`Processed chunk response: ${response}`);
            geminiResponses.push(response); // Collect the Gemini responses
          } catch (geminiError) {
            console.error('Error processing text with Gemini:', geminiError);
            throw new Error('Gemini processing failed');
          }
        }
      } catch (splitError) {
        console.error('Error splitting text:', splitError);
        throw new Error('Text splitting failed');
      }
    }

    // Add Gemini responses to the form entries
    formEntries.geminiResponses = geminiResponses;

    const jsonBlobName = `${memoId}/data.json`;
    const jsonBlockBlobClient = containerClient.getBlockBlobClient(jsonBlobName);
    const jsonData = JSON.stringify(formEntries, null, 2);
    await jsonBlockBlobClient.upload(jsonData, jsonData.length);

    return NextResponse.json({ 
      message: 'Form data, files uploaded, and text processed successfully', 
      memoId, 
      savedFiles,
      geminiResponses // Include Gemini responses in the return
    });
  } catch (error) {
    console.error('Error during form submission:', error);
    return NextResponse.json({ message: 'Error during form submission', error: (error as Error).message }, { status: 500 });
  }
}
