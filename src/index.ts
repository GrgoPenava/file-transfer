import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import createEndpoints from './endpoints';
import cors from "cors";

const app = express();
const port = 3000;

const allowedFileTypes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "allowedFileTypes.json"), "utf-8")
).allowedTypes;

const allowedOrigins = ["http://your-allowed-origin.com"];

const uploadDirectory = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const fileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(createEndpoints(upload));

app.listen(port, () => {
    console.log(`File upload service is running on http://localhost:${port}`);
});
