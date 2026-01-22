import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
  StorageReference
} from "firebase/storage";
import { storage } from "./firebase";

export interface UploadedImage {
  name: string;
  url: string;
  path: string;
  ref: StorageReference;
}

/**
 * Upload an image to Firebase Storage
 * @param file - The file to upload
 * @param folder - Optional folder path (e.g., 'hero', 'products')
 * @returns Promise with the download URL and metadata
 */
export async function uploadImage(
  file: File,
  folder: string = 'images'
): Promise<{ url: string; path: string; name: string }> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${folder}/${fileName}`;

    // Create a storage reference
    const storageRef = ref(storage, filePath);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const url = await getDownloadURL(snapshot.ref);

    return {
      url,
      path: filePath,
      name: fileName
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * List all images in a folder
 * @param folder - The folder to list images from
 * @returns Promise with array of image data
 */
export async function listImages(folder: string = 'images'): Promise<UploadedImage[]> {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);

    const images = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url,
          path: itemRef.fullPath,
          ref: itemRef
        };
      })
    );

    return images;
  } catch (error) {
    console.error('Error listing images:', error);
    throw error;
  }
}

/**
 * Delete an image from Firebase Storage
 * @param path - The full path of the image to delete
 */
export async function deleteImage(path: string): Promise<void> {
  try {
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Get a download URL for an existing image
 * @param path - The full path of the image
 * @returns Promise with the download URL
 */
export async function getImageUrl(path: string): Promise<string> {
  try {
    const imageRef = ref(storage, path);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
}

// ============ VIDEO FUNCTIONS ============

export interface UploadedVideo {
  name: string;
  url: string;
  path: string;
  ref: StorageReference;
}

/**
 * Upload a video to Firebase Storage
 * @param file - The video file to upload
 * @param folder - Optional folder path (e.g., 'hero', 'testimonials')
 * @returns Promise with the download URL and metadata
 */
export async function uploadVideo(
  file: File,
  folder: string = 'videos'
): Promise<{ url: string; path: string; name: string }> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `videos/${folder}/${fileName}`;

    // Create a storage reference
    const storageRef = ref(storage, filePath);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const url = await getDownloadURL(snapshot.ref);

    return {
      url,
      path: filePath,
      name: fileName
    };
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}

/**
 * List all videos in a folder
 * @param folder - The folder to list videos from
 * @returns Promise with array of video data
 */
export async function listVideos(folder: string = 'general'): Promise<UploadedVideo[]> {
  try {
    const folderRef = ref(storage, `videos/${folder}`);
    const result = await listAll(folderRef);

    const videos = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url,
          path: itemRef.fullPath,
          ref: itemRef
        };
      })
    );

    return videos;
  } catch (error) {
    console.error('Error listing videos:', error);
    throw error;
  }
}

/**
 * Delete a video from Firebase Storage
 * @param path - The full path of the video to delete
 */
export async function deleteVideo(path: string): Promise<void> {
  try {
    const videoRef = ref(storage, path);
    await deleteObject(videoRef);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}
