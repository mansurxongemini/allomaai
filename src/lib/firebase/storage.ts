import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

/**
 * Uploads an image to Firebase Storage and returns its download URL.
 *
 * @param file - The file to upload.
 * @param folder - The folder in which to save the file (e.g., 'blogs').
 * @returns A promise that resolves to the download URL.
 * @throws Error with a user-friendly message on failure.
 */
export async function uploadImage(file: File, folder: string = "general"): Promise<string> {
    // Basic validation before hitting the network
    if (!file) throw new Error("Fayl tanlanmagan")
    if (file.size > 10 * 1024 * 1024) throw new Error("Fayl hajmi 10MB dan kichik bo'lishi kerak")

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    const storageRef = ref(storage, `${folder}/${fileName}`)

    try {
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        return downloadURL
    } catch (error: any) {
        console.error("Storage upload error:", error)
        // Translate Firebase error codes to user-friendly messages
        if (error?.code === "storage/unauthorized") {
            throw new Error("Rasm yuklash uchun ruxsat yo'q")
        }
        if (error?.code === "storage/quota-exceeded") {
            throw new Error("Saqlash hajmi to'lgan")
        }
        throw new Error("Rasm yuklashda xatolik yuz berdi. Qaytadan urinib ko'ring.")
    }
}

/**
 * Deletes an image from Firebase Storage by its download URL.
 */
export async function deleteImage(downloadURL: string): Promise<void> {
    try {
        const storageRef = ref(storage, downloadURL)
        await deleteObject(storageRef)
    } catch (error: any) {
        // It's OK if the file doesn't exist (already deleted)
        if (error?.code !== "storage/object-not-found") {
            console.error("Storage delete error:", error)
        }
    }
}
