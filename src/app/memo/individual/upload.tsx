// pages/api/upload.js
import nextConnect from 'next-connect';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = `./public/${req.body.name}`;
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        },
    }),
});

const apiRoute = nextConnect({
    onError(error, req, res) {
        res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
    },
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    },
});

apiRoute.use(upload.fields([
    { name: 'bankApplication', maxCount: 1 },
    { name: 'incomeCertificate', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
    { name: 'panCard', maxCount: 1 }
]));

apiRoute.post((req, res) => {
    console.log(req.body); // You can access other form data here
    res.status(200).json({ message: 'Success', data: result });
});

export default apiRoute;
export const config = {
    api: {
        bodyParser: false, // Disabling body parsing, multer will handle it
    },
};
