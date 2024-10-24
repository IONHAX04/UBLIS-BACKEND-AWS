// fileHandler.ts
import fs from "fs";
import path from "path";
import { Readable } from "stream";

// Define the type for the file object that Hapi provides
interface HapiFile {
  hapi: {
    filename: string;
    headers: Record<string, string>;
  };
  pipe: (dest: NodeJS.WritableStream) => Readable; // Specify the pipe method
}

// Function to generate a unique filename
const generateUniqueFilename = (originalName: string): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let uniqueName = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueName += characters[randomIndex];
  }

  const extension = path.extname(originalName); // Get the original file extension
  return uniqueName + extension; // Append the original extension to the unique name
};

// Function to store a file
export const storeFile = async (file: HapiFile): Promise<string> => {
  console.log("------------------------------------------");
  const uploadDir = path.join(process.cwd(), "./src/asserts/documents");
  const uniqueFilename = generateUniqueFilename(file.hapi.filename);
  const uploadPath = path.join(uploadDir, uniqueFilename);

  // Check if the directory exists, if not create it
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create directory recursively
  }

  const fileStream = fs.createWriteStream(uploadPath);

  return new Promise((resolve, reject) => {
    // Ensure that file is treated as a Readable stream
    const readableFileStream: Readable = file as unknown as Readable;

    readableFileStream.pipe(fileStream);

    readableFileStream.on("end", () => {
      resolve(uploadPath); // Return the stored file path
    });

    readableFileStream.on("error", (err: Error) => {
      // Explicitly define the type of err
      reject(err);
    });
  });
};

// Function to view a stored file
export const viewFile = (filePath: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      filePath,
      (err: NodeJS.ErrnoException | null, data?: Buffer) => {
        // Define types for err and data
        if (err) {
          return reject(err);
        }
        resolve(data!); // Use the non-null assertion operator to indicate data is defined
      }
    );
  });
};
