import { Request, Response, Router } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const createSupabaseEndpoints = (upload: multer.Multer) => {
  const router = Router();

  router.post(
    "/supabase/upload",
    upload.array("files"),
    async (req: Request, res: Response): Promise<void> => {
      try {
        if (!req.files || req.files.length === 0) {
          res.status(400).send("No files uploaded.");
          return;
        }

        const uploadedFiles = [];

        for (const file of req.files as Express.Multer.File[]) {
          const timestamp = Date.now();
          const filePath = `uploads/${timestamp}-${file.originalname}`;

          const { error } = await supabase.storage
            .from("bucket")
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });

          if (error) {
            console.error("Supabase upload error:", error);
            res.status(500).send("Failed to upload file to Supabase");
            return;
          }

          uploadedFiles.push(filePath);
        }

        res.status(200).json({
          message: "Files uploaded to Supabase successfully",
          files: uploadedFiles,
        });
      } catch (error) {
        console.error("Error uploading files to Supabase:", error);
        res.status(500).send("Error uploading files.");
      }
    }
  );

  router.get(
    "/supabase/files",
    async (req: Request, res: Response): Promise<void> => {
      try {
        const folderPath = "uploads/";
        const { data, error } = await supabase.storage
          .from("bucket")
          .list(folderPath);

        if (error) {
          console.error("Error retrieving files:", error);
          res.status(500).json({ message: "Error retrieving files." });
          return;
        }

        const files = data.map((file) => {
          const originalFileName = file.name.replace(/^\d+-/, "");
          return {
            originalName: originalFileName,
            uniqueName: file.name,
          };
        });

        res.status(200).json({
          message: "Files retrieved successfully",
          files: files,
        });
      } catch (error) {
        console.error("Error listing files:", error);
        res.status(500).json({ message: "Error listing files." });
      }
    }
  );

  return router;
};

export default createSupabaseEndpoints;
