import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export async function checkForUpdates(): Promise<Update | null> {
    return await check();
}

export async function installUpdate(update: Update, onProgress?: (progress: number) => void): Promise<void> {
    let downloaded = 0;
    let contentLength = 0;

    await update.downloadAndInstall((event) => {
        switch (event.event) {
            case "Started":
                contentLength = event.data.contentLength ?? 0;
                break;

            case "Progress":
                downloaded += event.data.chunkLength;
                if (contentLength > 0) {
                    const progress = (downloaded / contentLength) * 100;
                    onProgress?.(progress);
                }
                break;

            case "Finished":
                onProgress?.(100);
                break;
        }
    });

    await relaunch();
}