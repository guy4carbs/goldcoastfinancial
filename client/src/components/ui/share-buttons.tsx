import { Linkedin, Twitter, Share2, Link2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  url?: string;
  summary?: string;
  className?: string;
  variant?: "default" | "compact";
}

export function ShareButtons({
  title,
  url,
  summary = "",
  className = "",
  variant = "default"
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Get current URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600,noopener,noreferrer');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: summary,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error - fall back to copy
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      // Fallback to copying link
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === "compact") {
    return (
      <div className={`flex gap-1.5 ${className}`}>
        <button
          onClick={handleLinkedInShare}
          className="w-7 h-7 rounded-md bg-[#0A66C2] hover:bg-[#004182] flex items-center justify-center transition-colors"
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-3.5 h-3.5 text-white" />
        </button>
        <button
          onClick={handleTwitterShare}
          className="w-7 h-7 rounded-md bg-[#1DA1F2] hover:bg-[#0c85d0] flex items-center justify-center transition-colors"
          aria-label="Share on Twitter"
          title="Share on Twitter"
        >
          <Twitter className="w-3.5 h-3.5 text-white" />
        </button>
        <button
          onClick={handleCopyLink}
          className="w-7 h-7 rounded-md bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          aria-label="Copy link"
          title="Copy link"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-sm text-muted-foreground">Share:</span>
      <div className="flex gap-2">
        <button
          onClick={handleLinkedInShare}
          className="w-9 h-9 rounded-lg bg-[#0A66C2] hover:bg-[#004182] flex items-center justify-center transition-colors shadow-sm hover:shadow-md"
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleTwitterShare}
          className="w-9 h-9 rounded-lg bg-[#1DA1F2] hover:bg-[#0c85d0] flex items-center justify-center transition-colors shadow-sm hover:shadow-md"
          aria-label="Share on Twitter"
          title="Share on Twitter"
        >
          <Twitter className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleNativeShare}
          className="w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors shadow-sm hover:shadow-md"
          aria-label="Share or copy link"
          title="Share or copy link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Share2 className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}
