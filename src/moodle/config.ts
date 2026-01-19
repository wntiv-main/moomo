import type { AsyncResult } from "./asyncresult";

declare global {
	interface Window {
		showDirectoryPicker(options?: {
			/**
			 * By specifying an ID, the browser can remember different directories for different IDs.
			 * If the same ID is used for another picker, the picker opens in the same directory.
			 */
			id?: number | string,
			/**
			 * A string that defaults to "read" for read - only access or "readwrite" for read and write access to the directory.
			 */
			mode?: "read" | "readwrite",
			/**
			 * A FileSystemHandle or a well known directory() to open the dialog in.
			 */
			startIn?: FileSystemHandle | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos",
		}): AsyncResult<FileSystemDirectoryHandle, DOMException>;
	}
}

async function getConfigFolderAccess() {
	if (!('showDirectoryPicker' in window)) {
		return undefined;
	}
	alert("Please select the 'config' folder within the extension install directory after pressing OK:");
	return await window.showDirectoryPicker({
		id: 'ext_config',
		mode: 'readwrite',
		startIn: 'documents',
	}).catch(() => undefined);
}

export { };
