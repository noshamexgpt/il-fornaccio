"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { cwd } from "process";

export async function uploadFile(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

    // Ensure unique filename to prevent overwrites (optional, but good practice)
    const uniqueFilename = `${Date.now()}-${filename}`;

    try {
        const uploadDir = join(cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const path = join(uploadDir, uniqueFilename);
        await writeFile(path, buffer);

        return { success: true, url: `/uploads/${uniqueFilename}` };
    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Upload failed" };
    }
}
