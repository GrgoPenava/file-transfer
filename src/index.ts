import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import createEndpoints from "./endpoints";
import cors from "cors";
import createSupabaseEndpoints from "./supabaseEndpoints";

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

const storage = multer.memoryStorage();

const upload = multer({ storage, fileFilter });

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(createEndpoints(upload)).use(createSupabaseEndpoints(upload));

app.listen(port, () => {
  console.log(`File upload service is running on http://localhost:${port}`);
});
