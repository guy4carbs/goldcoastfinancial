import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Copy, Check, FolderOpen, Image } from "lucide-react";
import { motion } from "framer-motion";
import { uploadImage, listImages, deleteImage, UploadedImage } from "@/lib/storageUtils";
import { toast } from "sonner";
import { AdminLoungeLayout } from "./admin/AdminLoungeLayout";
import { AdminPageHero, AdminGlassCard, AdminStaggerContainer, AdminEmptyState, ADMIN_GRADIENT } from "@/components/admin/AdminHeritagePrimitives";
import { GLASS, RADIUS, SHADOW, MOTION, TYPE, GRID, COLORS, fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";

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
    <AdminLoungeLayout breadcrumbs={[{ label: 'Images' }]}>
      <AdminStaggerContainer className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Hero */}
          <AdminPageHero
            icon={Image}
            title="Image CDN Manager"
            subtitle="Upload and manage images for Heritage website"
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
              <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.gray[400] }} />
              <h3 className="font-semibold mb-2" style={{ fontSize: TYPE.title, color: COLORS.gray[900] }}>
                {uploading ? "Uploading..." : "Upload Images"}
              </h3>
              <p className="mb-4" style={{ fontSize: TYPE.body, color: COLORS.gray[600] }}>
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
                className="text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: ADMIN_GRADIENT,
                  padding: '12px 24px',
                  borderRadius: RADIUS.button,
                  boxShadow: SHADOW.level2,
                }}
              >
                {uploading ? "Uploading..." : "Select Files"}
              </button>
            </div>
          </div>
        </AdminGlassCard>

        {/* Image Grid */}
        <AdminGlassCard>
          <h2 className="font-semibold mb-4" style={{ fontSize: TYPE.title, color: COLORS.gray[900] }}>
            Images in {folders.find((f) => f.value === selectedFolder)?.label}
            <span className="ml-2" style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>({images.length})</span>
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p style={{ color: COLORS.gray[500] }}>Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <AdminEmptyState
              icon={Image}
              title="No images in this folder yet"
              description="Upload images using the drop zone above"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {images.map((image) => (
                <motion.div
                  key={image.path}
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
                  {/* Image Preview */}
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Image Info */}
                  <div style={{ padding: GRID.spacing.md }}>
                    <p className="font-medium mb-2 truncate" style={{ fontSize: TYPE.meta, color: COLORS.gray[900] }} title={image.name}>
                      {image.name}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(image.url)}
                        className="flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                        style={{
                          padding: '8px 12px',
                          borderRadius: RADIUS.input,
                          ...GLASS.css.light,
                          color: COLORS.gray[700],
                        }}
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
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        style={{ borderRadius: RADIUS.input }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* URL Preview */}
                    <div className="mt-2 p-2 truncate" style={{ background: COLORS.gray[50], borderRadius: RADIUS.input, fontSize: TYPE.caption, color: COLORS.gray[600] }} title={image.url}>
                      {image.url}
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
