import path from "path";
import fs from "fs";
import { config } from "../../config/index.js";

export function saveBase64Image(base64Data: string): string {
  try {
    const uploadDir = config.uploadDir || path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const ext = matches[1].split("/")[1] || "jpg";
      const buffer = Buffer.from(matches[2], "base64");
      const filename = `crop-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      return `/uploads/${filename}`;
    }
  } catch (err) {
    console.error("Failed to save base64 image:", err);
  }
  return base64Data;
}
