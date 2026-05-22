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
  // Legacy field retained for backward compatibility. Image functions now go
  // through the server-side admin API and no longer return a Firebase
  // StorageReference. Kept optional so consumers don't break.
  ref?: StorageReference | null;
}

/**
 * Upload an image via the server-side admin endpoint.
 * Backend handles the Firebase Storage interaction so we avoid opaque
 * client-side failures on `.firebasestorage.app` buckets.
 *
 * @param file - The file to upload
 * @param folder - Folder slug (e.g., 'images', 'hero', 'products', 'team', 'logos')
 * @returns Promise with the download URL and metadata
 */
export async function uploadImage(
  file: File,
  folder: string = 'images'
): Promise<{ url: string; path: string; name: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/admin/images/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Upload failed (${res.status})`);
  }

  return await res.json(); // { url, path, name, size }
}

/**
 * List all images in a folder via the server-side admin endpoint.
 * @param folder - The folder to list images from
 * @returns Promise with array of image data
 */
export async function listImages(folder: string = 'images'): Promise<UploadedImage[]> {
  const res = await fetch(
    `/api/admin/images/list?folder=${encodeURIComponent(folder)}`,
    { credentials: 'include' }
  );

  if (!res.ok) {
    throw new Error(`List failed (${res.status})`);
  }

  const data = await res.json();
  return (data.images || []).map((img: any) => ({
    name: img.name,
    url: img.url,
    path: img.path,
    ref: null,
  }));
}

/**
 * Delete an image via the server-side admin endpoint.
 * @param path - The full path of the image to delete
 */
export async function deleteImage(path: string): Promise<void> {
  const res = await fetch(
    `/api/admin/images?path=${encodeURIComponent(path)}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!res.ok) {
    throw new Error(`Delete failed (${res.status})`);
  }
}

/**
 * Get a download URL for an existing image.
 * Derives the folder from the path's first segment, lists the folder,
 * and returns the matching image's URL.
 * @param path - The full path of the image (e.g., 'hero/1234-foo.png')
 * @returns Promise with the download URL
 */
export async function getImageUrl(path: string): Promise<string> {
  const folder = path.split('/')[0];
  const images = await listImages(folder);
  const match = images.find((i) => i.path === path);
  if (!match) {
    throw new Error(`Image not found: ${path}`);
  }
  return match.url;
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
