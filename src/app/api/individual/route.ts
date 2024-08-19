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
async function processTextWithGemini(formData: { [key: string]: any }, text: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in the environment variables');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    // Set the `responseMimeType` to output JSON
    generationConfig: { responseMimeType: "application/json" }
  });
  const memoData = formData;
  // Fixed custom prompt
  const customPrompt = `Act as a senior loan underwriter with over 20 years of experience in/ evaluating personal loan applications.
        Your task is to analyze the provided applicant data and generate a detailed credit memo.
        The analysis should cover the applicant's background, financial stability, loan feasibility, and overall creditworthiness.
        Your final recommendation should include a justification based on the data provided.

        Objective:

        Analyze the following details provided by the applicant:

        Personal Loan Description:
        Applicant Name: ${memoData.applicantName}
        Applicant Age: ${memoData.applicantAge}
        Annual Income: ${memoData.annualIncome}
        Loan Amount: ${memoData.loanAmount}
        Loan Purpose: ${memoData.loanPurpose}
        Loan Type: ${memoData.loanType}
        Loan Term: ${memoData.loanTerm} months
        CIBIL Score: ${memoData.cibilScore}

        Extract Additional Details Extracted from Loan Application Form:${text}

        Tasks:

        Profile Overview: Provide a summary of the applicant's background, focusing on age, education, and income.
        Financial Stability Assessment: Assess the applicant's financial stability by analyzing their education, employment, and annual income. Highlight any potential risks or strengths.
        Loan Feasibility Evaluation: Analyze the requested loan amount, purpose, and type. Determine if the loan amount is reasonable and justified given the applicant's financial profile.
        Creditworthiness Assessment: Evaluate the applicant’s CIBIL score, discussing how it affects their creditworthiness and the likelihood of loan approval.
        Supporting Documents:
        Review the uploaded loan application form and bank statement.
        Highlight any discrepancies or important details found in the documents that may affect the loan approval process.
        Final Recommendation:
        Based on the analysis of the above sections, provide a final recommendation on whether the loan should be approved, conditionally approved, or rejected.
        Justify your decision with specific references to the data provided.
        Take a deep breath and work on this problem step-by-step.
        Now i want you to return the output in a specific format. you will return me a json file exactly like this""
        reponse = {
          "profileScore":"something between 1 to 10 on whether to give the loan or not",
          "historicalAnalysis":["50000","60000","70000","80000","90000"],/*this is his annual income of last 5 years*/
          "employmentDetails":{
            "employerName":"abc.inc",
            "position":"manager",
            "employmentDuration":"5 years"
          },
          "verifiedIncome":"500000 usd",
          "riskAnalysis":{
            "riskLevel":"low or high or medium",
            "reasons":["factors","affecting","it"]
          }
          //other relevant fields that you think we should mention
        }
        return reponse
        `;
  
  // Combine the custom prompt with the text
  const combinedText = `${customPrompt}\n\n${text}`;

  console.log('Sending text to Gemini API:');

  const result = await model.generateContent([combinedText]);

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

        const fileType = file.type;

        if (fileType === 'application/pdf') {
          try {
            const pdfData = await pdfParse(buffer);
            
            // Check if the PDF was parsed successfully
            if (pdfData.numpages === 0) {
              throw new Error('The PDF file appears to be empty or invalid.');
            }
            
            extractedTexts.push(pdfData.text);
          } catch (parseError) {
            console.error('Error parsing PDF:', parseError);
            throw new Error('Failed to parse PDF. Please ensure the file is a valid PDF.');
          }
        } else {
          // Handle non-PDF files, e.g., images (if needed)
          console.log(`Skipping parsing for non-PDF file: ${file.name}`);
        }

        const blobUrl = blockBlobClient.url;
        savedFiles.push({ field: key, blobUrl });
        formEntries[key] = blobUrl;
      } else {
        formEntries[key] = value;
      }
    }

    formEntries.memoId = memoId;

    // Combine all extracted texts into one
    const combinedText = extractedTexts.join('\n\n'); // Combine with two newlines for separation

    try {
      const responseText = await processTextWithGemini(formEntries, combinedText);
      console.log(`Processed combined text response: ${responseText}`);
      
      // Parse the stringified JSON response
      const jsonResponse = JSON.parse(responseText);

      // Add the JSON response to formEntries
      formEntries.geminiResponse = jsonResponse;
    } catch (geminiError) {
      console.error('Error processing combined text with Gemini:', geminiError);
      throw new Error('Gemini processing failed');
    }

    const jsonBlobName = `${memoId}/data.json`;
    const jsonBlockBlobClient = containerClient.getBlockBlobClient(jsonBlobName);
    
    // Convert the formEntries object to a string and upload it
    const jsonData = JSON.stringify(formEntries, null, 2);
    await jsonBlockBlobClient.upload(jsonData, jsonData.length);

    return NextResponse.json({ 
      message: 'Form data, files uploaded, and text processed successfully', 
      memoId, 
      savedFiles,
      geminiResponse: formEntries.geminiResponse // Include Gemini response in the return
    });
  } catch (error) {
    console.error('Error during form submission:', error);
    return NextResponse.json({ message: 'Error during form submission', error: (error as Error).message }, { status: 500 });
  }
}


