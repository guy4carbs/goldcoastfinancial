import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Copy, Check, FolderOpen, Video, Play } from "lucide-react";
import { motion } from "framer-motion";
import { uploadVideo, listVideos, deleteVideo, UploadedVideo } from "@/lib/storageUtils";
import { toast } from "sonner";
import { AdminLoungeLayout } from "./admin/AdminLoungeLayout";
import { AdminPageHero, AdminGlassCard, AdminStaggerContainer, AdminEmptyState, ADMIN_GRADIENT } from "@/components/admin/AdminHeritagePrimitives";
import { GLASS, RADIUS, SHADOW, MOTION, TYPE, GRID, COLORS, fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";

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
    <AdminLoungeLayout breadcrumbs={[{ label: 'Videos' }]}>
      <AdminStaggerContainer className="max-w-7xl mx-auto px-6">
          {/* Hero */}
          <AdminPageHero
            icon={Video}
            title="Video Manager"
            subtitle="Upload and manage videos for Heritage website"
          />

          {/* Folder Selector */}
          <AdminGlassCard>
            <label className="block font-medium mb-3" style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>
              Select Folder
            </label>
            <div className="flex gap-2 flex-wrap">
              {folders.map((folder) => (
                <button
                  key={folder.value}
                  onClick={() => setSelectedFolder(folder.value)}
                  className="px-4 py-2 font-medium transition-all"
                  style={{
                    borderRadius: RADIUS.button,
                    ...(selectedFolder === folder.value
                      ? { background: ADMIN_GRADIENT, color: 'white', boxShadow: SHADOW.glow.slate }
                      : { ...GLASS.css.light, color: COLORS.gray[700] }),
                  }}
                >
                  <FolderOpen className="w-4 h-4 inline mr-2" />
                  {folder.label}
                </button>
              ))}
            </div>
          </AdminGlassCard>

          {/* Upload Area */}
          <AdminGlassCard style={{ padding: '48px 24px' }}>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="transition-colors"
              style={{
                border: `2px dashed ${GLASS.border}`,
                borderRadius: RADIUS.card,
                padding: '48px 24px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.lounges.admin.dark)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = GLASS.border)}
            >
              <div className="text-center">
                <Video className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.gray[400] }} />
                <h3 className="font-semibold mb-2" style={{ fontSize: TYPE.title, color: COLORS.gray[900] }}>
                  {uploading ? `Uploading... ${uploadProgress}%` : "Upload Videos"}
                </h3>
                <p className="mb-2" style={{ fontSize: TYPE.body, color: COLORS.gray[600] }}>
                  Drag and drop videos here, or click to select
                </p>
                <p className="mb-4" style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>
                  Supported formats: MP4, WebM, OGG, MOV
                </p>

                {uploading && (
                  <div className="w-full max-w-xs mx-auto mb-4">
                    <div className="h-2" style={{ background: COLORS.gray[200], borderRadius: RADIUS.pill }}>
                      <div
                        className="h-2 transition-all duration-300"
                        style={{ width: `${uploadProgress}%`, background: ADMIN_GRADIENT, borderRadius: RADIUS.pill }}
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
                  className="text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: ADMIN_GRADIENT,
                    padding: '12px 24px',
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.level2,
                  }}
                >
                  {uploading ? "Uploading..." : "Select Videos"}
                </button>
              </div>
            </div>
          </AdminGlassCard>

          {/* Video Grid */}
          <AdminGlassCard>
            <h2 className="font-semibold mb-4" style={{ fontSize: TYPE.title, color: COLORS.gray[900] }}>
              Videos in {folders.find((f) => f.value === selectedFolder)?.label}
              <span className="ml-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>({videos.length})</span>
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <p style={{ color: COLORS.gray[500] }}>Loading videos...</p>
              </div>
            ) : videos.length === 0 ? (
              <AdminEmptyState
                icon={Video}
                title="No videos in this folder yet"
                description="Upload videos using the drop zone above"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <motion.div
                    key={video.path}
                    variants={fadeInUp}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className="overflow-hidden"
                    style={{
                      ...GLASS.css.light,
                      borderRadius: RADIUS.card,
                      border: `1px solid ${GLASS.border}`,
                      boxShadow: SHADOW.card,
                    }}
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
                    <div style={{ padding: GRID.spacing.md }}>
                      <p className="font-medium mb-2 truncate" style={{ fontSize: TYPE.meta, color: COLORS.gray[900] }} title={video.name}>
                        {video.name}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(video.url)}
                          className="flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                          style={{
                            padding: '8px 12px',
                            borderRadius: RADIUS.input,
                            ...GLASS.css.light,
                            color: COLORS.gray[700],
                          }}
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
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          style={{ borderRadius: RADIUS.input }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* URL Preview */}
                      <div className="mt-2 p-2 truncate" style={{ background: COLORS.gray[50], borderRadius: RADIUS.input, fontSize: TYPE.caption, color: COLORS.gray[600] }} title={video.url}>
                        {video.url}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AdminGlassCard>
      </AdminStaggerContainer>
    </AdminLoungeLayout>
  );
}
