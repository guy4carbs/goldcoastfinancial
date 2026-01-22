import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Copy, Check, FolderOpen, Video, Play } from "lucide-react";
import { uploadVideo, listVideos, deleteVideo, UploadedVideo } from "@/lib/storageUtils";
import { toast } from "sonner";
import AdminNav from "@/components/AdminNav";

export default function AdminVideos() {
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState("general");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders = [
    { value: "general", label: "General Videos" },
    { value: "hero", label: "Hero/Background" },
    { value: "testimonials", label: "Testimonials" },
    { value: "explainers", label: "Explainer Videos" },
    { value: "about", label: "About Us" },
  ];

  // Load videos on mount and when folder changes
  useEffect(() => {
    loadVideos();
  }, [selectedFolder]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const videoList = await listVideos(selectedFolder);
      setVideos(videoList);
    } catch (error) {
      toast.error("Failed to load videos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validate file types
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const invalidFiles = Array.from(files).filter(f => !validTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      toast.error("Please upload only video files (MP4, WebM, OGG, MOV)");
      return;
    }

    // Check file sizes (warn if over 100MB)
    const largeFiles = Array.from(files).filter(f => f.size > 100 * 1024 * 1024);
    if (largeFiles.length > 0) {
      toast.warning("Large files detected. Upload may take a while.");
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = files.length;
      let completed = 0;

      for (const file of Array.from(files)) {
        await uploadVideo(file, selectedFolder);
        completed++;
        setUploadProgress(Math.round((completed / totalFiles) * 100));
      }

      toast.success(`Successfully uploaded ${files.length} video(s)`);
      loadVideos();
    } catch (error) {
      toast.error("Failed to upload videos");
      console.error(error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDelete = async (video: UploadedVideo) => {
    if (!confirm(`Delete ${video.name}?`)) return;

    try {
      await deleteVideo(video.path);
      toast.success("Video deleted");
      loadVideos();
    } catch (error) {
      toast.error("Failed to delete video");
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Manager</h1>
            <p className="text-gray-600">Upload and manage videos for Heritage website</p>
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
                      ? "bg-heritage-primary text-white"
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
            className="bg-white rounded-lg shadow-sm p-12 mb-6 border-2 border-dashed border-gray-300 hover:border-heritage-primary transition-colors"
          >
            <div className="text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {uploading ? `Uploading... ${uploadProgress}%` : "Upload Videos"}
              </h3>
              <p className="text-gray-600 mb-2">
                Drag and drop videos here, or click to select
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supported formats: MP4, WebM, OGG, MOV
              </p>

              {uploading && (
                <div className="w-full max-w-xs mx-auto mb-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-heritage-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-heritage-primary hover:bg-heritage-primary/90 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Select Videos"}
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Videos in {folders.find((f) => f.value === selectedFolder)?.label}
              <span className="text-gray-500 text-sm ml-2">({videos.length})</span>
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading videos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No videos in this folder yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <div
                    key={video.path}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Video Preview */}
                    <div className="aspect-video bg-gray-900 relative">
                      {playingVideo === video.url ? (
                        <video
                          src={video.url}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                          onEnded={() => setPlayingVideo(null)}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center cursor-pointer group"
                          onClick={() => setPlayingVideo(video.url)}
                        >
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <p className="text-sm font-medium text-gray-900 mb-2 truncate" title={video.name}>
                        {video.name}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(video.url)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                        >
                          {copiedUrl === video.url ? (
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
                          onClick={() => handleDelete(video)}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* URL Preview */}
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 truncate" title={video.url}>
                        {video.url}
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
