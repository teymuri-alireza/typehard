import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { basename } from "@tauri-apps/api/path";
import type { PracticeLesson } from "../types/models.js";


export async function importLesson(): Promise<PracticeLesson | undefined> {
    const filePath = await open({
        multiple: false,
        directory: false,
        filters: [
            {
                name: "Text files",
                extensions: ["txt"],
            },
        ],
    });

    if (filePath === null) {
        // The user cancelled the dialog.
        return;
    }

    try {
        const fileName = await basename(filePath);
        const content = await readTextFile(filePath);

        const lesson: PracticeLesson = {
            id: crypto.randomUUID(),
            title: fileName.replace(/\.txt$/i, ""),
            difficulty: "beginner",
            text: content,
            author: "Imported Lesson",
            source: filePath,
        }

        return lesson;

    } catch (error) {
        console.error("Failed to import lesson:", error);
    }
}