/**
 * VideoLibrary - Browse and filter training videos
 *
 * Features:
 * - Grid of video cards with thumbnails
 * - Filter by module/tag
 * - Search by title
 * - "My Bookmarks" section
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Search,
  Film,
  Clock,
  Play,
  Bookmark,
  BookmarkCheck,
  Filter,
  Grid,
  List,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoPlayer, TrainingVideo } from "./VideoPlayer";

// Complete video library based on Phase 1.3 requirements
// All videos are placeholders until actual recordings are created
const PLACEHOLDER_VIDEOS: TrainingVideo[] = [
  // ============ ONBOARDING VIDEOS ============
  {
    id: "vid-ceo-welcome",
    title: "CEO Welcome Message",
    description:
      "A personal welcome from our CEO covering Gold Coast Financial's mission, values, and what makes us different. Sets the foundation for your journey as an advisor.",
    duration: 240, // 4 minutes
    thumbnailUrl: "/images/placeholder-video-ceo.jpg",
    videoUrl: "",
    tags: ["onboarding", "culture", "required"],
    moduleId: "mod-welcome",
    isPlaceholder: true
  },
  {
    id: "vid-portal-tour",
    title: "Agent Portal Tour",
    description:
      "Complete walkthrough of the GCF Agent Portal including navigation, key features, CRM usage, and where to find resources. Essential for new advisors.",
    duration: 420, // 7 minutes
    thumbnailUrl: "/images/placeholder-video-portal.jpg",
    videoUrl: "",
    tags: ["onboarding", "portal", "required"],
    moduleId: "mod-portal",
    isPlaceholder: true
  },

  // ============ EDUCATION-FIRST METHODOLOGY VIDEOS (GCF-201) ============
  {
    id: "vid-opening-consent",
    title: "Opening & Consent Demo",
    description:
      "Live demonstration of the proper opening sequence including introduction, permission to proceed, and recording consent. Watch how to set the right tone from the start.",
    duration: 300, // 5 minutes
    thumbnailUrl: "/images/placeholder-video-opening.jpg",
    videoUrl: "",
    tags: ["methodology", "call-framework", "demo"],
    moduleId: "mod-education-call",
    isPlaceholder: true
  },
  {
    id: "vid-discovery-questions",
    title: "Discovery Questions Demo",
    description:
      "Watch a skilled advisor conduct discovery that uncovers client needs naturally. Demonstrates open-ended questioning, active listening, and needs documentation.",
    duration: 480, // 8 minutes
    thumbnailUrl: "/images/placeholder-video-discovery.jpg",
    videoUrl: "",
    tags: ["methodology", "discovery", "demo"],
    moduleId: "mod-education-call",
    isPlaceholder: true
  },
  {
    id: "vid-product-education",
    title: "Product Education Demo",
    description:
      "Example of educating clients about insurance options without pressure. Shows how to explain features, limitations, and verify understanding before proceeding.",
    duration: 480, // 8 minutes
    thumbnailUrl: "/images/placeholder-video-education.jpg",
    videoUrl: "",
    tags: ["methodology", "education", "demo"],
    moduleId: "mod-education-call",
    isPlaceholder: true
  },
  {
    id: "vid-confirmation-close",
    title: "Confirmation & Close Demo",
    description:
      "The natural close in action: verifying understanding, confirming the decision, and completing the application process ethically and compliantly.",
    duration: 300, // 5 minutes
    thumbnailUrl: "/images/placeholder-video-close.jpg",
    videoUrl: "",
    tags: ["methodology", "closing", "demo"],
    moduleId: "mod-education-call",
    isPlaceholder: true
  },

  // ============ PRODUCT KNOWLEDGE VIDEOS ============
  {
    id: "vid-term-life",
    title: "Term Life Insurance Explained",
    description:
      "Comprehensive overview of term life insurance including coverage periods, premium structures, conversion options, and ideal client profiles. Includes real-world examples.",
    duration: 480, // 8 minutes
    thumbnailUrl: "/images/placeholder-video-term.jpg",
    videoUrl: "",
    tags: ["products", "term-life", "required"],
    moduleId: "mod-product-term",
    isPlaceholder: true
  },
  {
    id: "vid-iul-mechanics",
    title: "IUL Mechanics Explained",
    description:
      "Deep dive into Indexed Universal Life: index crediting strategies, caps, floors, participation rates, and how to explain these concepts clearly to clients.",
    duration: 600, // 10 minutes
    thumbnailUrl: "/images/placeholder-video-iul.jpg",
    videoUrl: "",
    tags: ["products", "iul", "advanced", "required"],
    moduleId: "mod-product-iul",
    isPlaceholder: true
  },
  {
    id: "vid-final-expense",
    title: "Final Expense Overview",
    description:
      "Understanding final expense insurance: coverage amounts, simplified/guaranteed issue underwriting, graded benefits, and sensitive communication with senior clients.",
    duration: 360, // 6 minutes
    thumbnailUrl: "/images/placeholder-video-fe.jpg",
    videoUrl: "",
    tags: ["products", "final-expense", "seniors", "required"],
    moduleId: "mod-product-fe",
    isPlaceholder: true
  },
  {
    id: "vid-annuity-fundamentals",
    title: "Annuity Fundamentals",
    description:
      "Fixed indexed annuity essentials: accumulation vs. income, crediting methods, surrender periods, and required disclosures. Critical suitability considerations for senior clients.",
    duration: 480, // 8 minutes
    thumbnailUrl: "/images/placeholder-video-annuity.jpg",
    videoUrl: "",
    tags: ["products", "annuity", "advanced", "required"],
    moduleId: "mod-product-annuity",
    isPlaceholder: true
  },

  // ============ CLIENT FACILITATION VIDEOS ============
  {
    id: "vid-needs-discovery",
    title: "Needs Discovery Demo",
    description:
      "Complete needs analysis demonstration from introduction through documentation. Shows proper questioning techniques and how to calculate coverage requirements.",
    duration: 480, // 8 minutes
    thumbnailUrl: "/images/placeholder-video-needs.jpg",
    videoUrl: "",
    tags: ["sales", "needs-analysis", "demo"],
    moduleId: "mod-sales-needs",
    isPlaceholder: true
  },
  {
    id: "vid-handling-concerns",
    title: "Handling Common Concerns",
    description:
      "How to address client concerns and questions professionally. Demonstrates the difference between addressing legitimate concerns and prohibited pressure tactics.",
    duration: 600, // 10 minutes
    thumbnailUrl: "/images/placeholder-video-objections.jpg",
    videoUrl: "",
    tags: ["sales", "objections", "compliance", "demo"],
    moduleId: "mod-sales-objections",
    isPlaceholder: true
  },

  // ============ COMPLIANCE VIDEOS ============
  {
    id: "vid-compliance-essentials",
    title: "Compliance Essentials for Advisors",
    description:
      "Critical compliance knowledge including disclosure requirements, suitability rules, documentation standards, and prohibited practices. Required viewing.",
    duration: 780, // 13 minutes
    thumbnailUrl: "/images/placeholder-video-compliance.jpg",
    videoUrl: "",
    tags: ["compliance", "required"],
    moduleId: "mod-compliance-intro",
    isPlaceholder: true
  },
  {
    id: "vid-senior-protections",
    title: "Senior Client Protections",
    description:
      "Special considerations when working with senior clients: enhanced disclosures, family involvement, cognitive concerns, and regulatory requirements by state.",
    duration: 420, // 7 minutes
    thumbnailUrl: "/images/placeholder-video-seniors.jpg",
    videoUrl: "",
    tags: ["compliance", "seniors", "required"],
    moduleId: "mod-product-fe",
    isPlaceholder: true
  },
  {
    id: "vid-suitability-documentation",
    title: "Suitability Documentation Best Practices",
    description:
      "How to document suitability properly: what to include, common mistakes to avoid, and examples of defensible documentation. Protects you and the client.",
    duration: 540, // 9 minutes
    thumbnailUrl: "/images/placeholder-video-suitability.jpg",
    videoUrl: "",
    tags: ["compliance", "documentation", "required"],
    moduleId: "mod-suitability-defense",
    isPlaceholder: true
  }
];

// Get all unique tags from videos
const getAllTags = (videos: TrainingVideo[]): string[] => {
  const tagSet = new Set<string>();
  videos.forEach((v) => v.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
};

interface VideoLibraryProps {
  videos?: TrainingVideo[];
  bookmarks?: { videoId: string; timestamp: number }[];
  onSelectVideo?: (video: TrainingVideo) => void;
  onBookmark?: (videoId: string, timestamp: number) => void;
  className?: string;
}

export function VideoLibrary({
  videos = PLACEHOLDER_VIDEOS,
  bookmarks = [],
  onSelectVideo,
  onBookmark,
  className
}: VideoLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(
    null
  );

  const allTags = useMemo(() => getAllTags(videos), [videos]);

  // Filter videos based on search and tag
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch =
        searchQuery === "" ||
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === "all" || video.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [videos, searchQuery, selectedTag]);

  // Get bookmarked videos
  const bookmarkedVideos = useMemo(() => {
    const bookmarkedIds = new Set(bookmarks.map((b) => b.videoId));
    return videos.filter((v) => bookmarkedIds.has(v.id));
  }, [videos, bookmarks]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins} min`;
  };

  // Handle video selection
  const handleSelectVideo = (video: TrainingVideo) => {
    setSelectedVideo(video);
    onSelectVideo?.(video);
  };

  // If a video is selected, show the player
  if (selectedVideo) {
    return (
      <div className={className}>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => setSelectedVideo(null)}
        >
          ← Back to Library
        </Button>
        <VideoPlayer
          video={selectedVideo}
          bookmarks={bookmarks
            .filter((b) => b.videoId === selectedVideo.id)
            .map((b) => b.timestamp)}
          onBookmark={(timestamp) => onBookmark?.(selectedVideo.id, timestamp)}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">
            Video Library
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Training videos and tutorials
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {videos.length} videos
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            All Videos
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            My Bookmarks
            {bookmarkedVideos.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {bookmarkedVideos.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-40">
                  <Tag className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Video grid/list */}
          {filteredVideos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Film className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium text-gray-600">No videos found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => handleSelectVideo(video)}
                  formatDuration={formatDuration}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVideos.map((video) => (
                <VideoListItem
                  key={video.id}
                  video={video}
                  onClick={() => handleSelectVideo(video)}
                  formatDuration={formatDuration}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4 mt-4">
          {bookmarkedVideos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Bookmark className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium text-gray-600">No bookmarks yet</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Bookmark videos while watching to save them here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => handleSelectVideo(video)}
                  formatDuration={formatDuration}
                  isBookmarked
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Video Card Component
interface VideoCardProps {
  video: TrainingVideo;
  onClick: () => void;
  formatDuration: (seconds: number) => string;
  isBookmarked?: boolean;
}

function VideoCard({
  video,
  onClick,
  formatDuration,
  isBookmarked
}: VideoCardProps) {
  return (
    <Card
      className="cursor-pointer hover:border-violet-500/50 transition-colors overflow-hidden group"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
        {video.isPlaceholder ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <Film className="w-10 h-10 text-white/50 mb-2" />
            <Badge variant="secondary" className="text-xs">
              Coming Soon
            </Badge>
          </div>
        ) : (
          <>
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </div>
          </>
        )}
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
          {formatDuration(video.duration)}
        </div>
        {/* Bookmark indicator */}
        {isBookmarked && (
          <div className="absolute top-2 right-2">
            <BookmarkCheck className="w-5 h-5 text-violet-500" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-primary line-clamp-1">
          {video.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {video.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-3">
          {video.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Video List Item Component
function VideoListItem({
  video,
  onClick,
  formatDuration
}: VideoCardProps) {
  return (
    <Card
      className="cursor-pointer hover:border-violet-500/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4 flex gap-4">
        {/* Thumbnail */}
        <div className="relative w-40 h-24 flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded overflow-hidden">
          {video.isPlaceholder ? (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <Film className="w-8 h-8 text-white/50" />
            </div>
          ) : (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-primary">
              {video.title}
            </h3>
            {video.isPlaceholder && (
              <Badge variant="secondary" className="text-xs ml-2">
                Coming Soon
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {video.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(video.duration)}</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex gap-1">
              {video.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
