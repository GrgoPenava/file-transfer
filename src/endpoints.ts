import { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createEndpoints = (upload: multer.Multer) => {
    const router = Router();

    router.post('/upload', upload.array('files'), (req: Request, res: Response): void => {
        try {
            if (!req.files || req.files.length === 0) {
                res.status(400).send('No files uploaded or invalid file types.');
                return;
            }
    
            const uploadedFiles = req.files.map((file: Express.Multer.File) => {
                const filePath = path.join(__dirname, 'uploads', file.filename);
    
                fs.chmod(filePath, 0o644, (err) => {
                    if (err) {
                        console.error('Error setting file permissions:', err);
                    }
                });
    
                return file.filename;
            });
    
            res.status(200).send(`Files uploaded successfully: ${uploadedFiles.join(', ')}`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error uploading files.');
        }
    });
    

    router.get('/file/info/:fileName', (req: Request, res: Response): void => {
        const fileNameWithType = req.params.fileName;
        const uploadDirectory = path.join(__dirname, 'uploads');
        const filePath = path.join(uploadDirectory, fileNameWithType);

        if (!fs.existsSync(filePath)) {
            res.status(404).send('File not found');
            return;
        }
        

        const fileInfo = {
            fileName: fileNameWithType.slice(0,fileNameWithType.length - path.extname(filePath).length),
            mimeType: path.extname(filePath),
            fullName: fileNameWithType,
            size: fs.statSync(filePath).size,
            createdAt: fs.statSync(filePath).birthtime,
        };

        res.status(200).json({
            message: `File info retrieved successfully`,
            file: fileInfo,
        });
    });

    router.get('/file/download/:fileName', (req: Request, res: Response): void => {
        const fileName = req.params.fileName;
        const uploadDirectory = path.join(__dirname, 'uploads');
        const filePath = path.join(uploadDirectory, fileName);

        if (!fs.existsSync(filePath)) {
            res.status(404).send('File not found');
        }

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Error sending file.');
            }
        });
    });

    return router;
};

export default createEndpoints;
