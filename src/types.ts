declare namespace Express {
    export interface Request {
        file?: Multer.File;
        files?: Multer.File[];
    }
}


interface FileInfo {
    fileName: string;
    filePath: string;
    size: number;
    createdAt: Date;
}