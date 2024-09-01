import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

// Set up formidable for file uploads
const formidableConfig = {
  uploadDir: path.join(process.cwd(), '/public/uploads'),
  keepExtensions: true,
};

// Helper function to parse form data
const parseForm = (req: NextApiRequest) =>
  new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    const form = formidable(formidableConfig);
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

// Preprocess the image using sharp (resize and convert to grayscale)
const preprocessImage = async (imagePath: string, size = { width: 500, height: 300 }) => {
  const imageBuffer = await sharp(imagePath)
    .resize(size.width, size.height)
    .grayscale()
    .toBuffer();

  // Convert the image buffer to PNG format (required by pixelmatch)
  return PNG.sync.read(imageBuffer);
};

// Calculate tampering percentage based on pixel differences
const calculateTamperingPercentage = (diffPixels: number, totalPixels: number) => {
  return (diffPixels / totalPixels) * 100;
};

// Main API handler for PAN card validation
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    // Parse the incoming form data
    const { files } = await parseForm(req);
    const fileArray = files.panCard;

    // Handle case where the file might be an array or a single object
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Preprocess the current image
    const processedCurrentImage = await preprocessImage(file.filepath);

    // Paths to original PAN card images for comparison
    const originalImagePaths = [
      path.join(process.cwd(), '/public/images/originals/NewPan.jpg'),
      path.join(process.cwd(), '/public/images/originals/OldPan.jpg'),
    ];

    let lowestTamperingPercentage = 100;

    for (const originalImagePath of originalImagePaths) {
      const processedOriginalImage = await preprocessImage(originalImagePath);

      const { width, height } = processedOriginalImage;
      const diffImage = new PNG({ width, height });
      
      // Compare images using pixelmatch
      const diffPixels = pixelmatch(
        processedOriginalImage.data,
        processedCurrentImage.data,
        diffImage.data,
        width,
        height,
        { threshold: 0.1 } // Adjust the threshold as needed
      );

      const tamperingPercentage = calculateTamperingPercentage(diffPixels, width * height);

      if (tamperingPercentage < lowestTamperingPercentage) {
        lowestTamperingPercentage = tamperingPercentage;
      }
    }

    // Cleanup: delete the uploaded file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({ tamperingPercentage: lowestTamperingPercentage });

  } catch (error) {
    console.error('Error in PAN validation:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disabling body parser to handle form-data
  },
};
