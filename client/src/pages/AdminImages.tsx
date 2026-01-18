import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Copy, Check, FolderOpen } from "lucide-react";
import { uploadImage, listImages, deleteImage, UploadedImage } from "@/lib/storageUtils";
import { toast } from "sonner";
import AdminNav from "@/components/AdminNav";

export default function AdminImages() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("images");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders = [
    { value: "images", label: "General Images" },
    { value: "hero", label: "Hero Images" },
    { value: "products", label: "Product Images" },
    { value: "team", label: "Team Photos" },
    { value: "logos", label: "Logos & Badges" },
  ];

  // Load images on mount and when folder changes
  useEffect(() => {
    loadImages();
  }, [selectedFolder]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const imageList = await listImages(selectedFolder);
      setImages(imageList);
    } catch (error) {
      toast.error("Failed to load images");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadImage(file, selectedFolder)
      );

      await Promise.all(uploadPromises);
      toast.success(`Successfully uploaded ${files.length} image(s)`);
      loadImages();
    } catch (error) {
      toast.error("Failed to upload images");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDelete = async (image: UploadedImage) => {
    if (!confirm(`Delete ${image.name}?`)) return;

    try {
      await deleteImage(image.path);
      toast.success("Image deleted");
      loadImages();
    } catch (error) {
      toast.error("Failed to delete image");
      console.error(error);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Image CDN Manager</h1>
            <p className="text-gray-600">Upload and manage images for Heritage website</p>
          </div>

        {/* Folder Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Folder
          </label>
          <div className="flex gap-2 flex-wrap">
            {folders.map((folder) => (
              <button
                key={folder.value}
                onClick={() => setSelectedFolder(folder.value)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedFolder === folder.value
                    ? "bg-[#292966] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FolderOpen className="w-4 h-4 inline mr-2" />
                {folder.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="bg-white rounded-lg shadow-sm p-12 mb-6 border-2 border-dashed border-gray-300 hover:border-[#292966] transition-colors"
        >
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {uploading ? "Uploading..." : "Upload Images"}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop images here, or click to select
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-[#292966] hover:bg-[#1E1E4D] text-white px-6 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Select Files"}
            </button>
          </div>
        </div>

        {/* Image Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Images in {folders.find((f) => f.value === selectedFolder)?.label}
            <span className="text-gray-500 text-sm ml-2">({images.length})</span>
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No images in this folder yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image.path}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image Preview */}
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Image Info */}
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2 truncate" title={image.name}>
                      {image.name}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(image.url)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                      >
                        {copiedUrl === image.url ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy URL
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(image)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* URL Preview */}
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 truncate" title={image.url}>
                      {image.url}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
