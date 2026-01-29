/**
 * Social Learning Components - Phase 5.4
 *
 * Social and collaborative learning features:
 * - ModuleRating: Rate and review training content
 * - DiscussionThread: Q&A on modules
 * - PeerRecognition: @mention achievements
 * - StudyGroups: Cohort-based learning
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Send,
  Users,
  Award,
  AtSign,
  Crown,
  Clock,
  ChevronRight,
  BookOpen,
  Reply,
  MoreHorizontal,
  Heart,
  Sparkles,
  UserPlus,
  Calendar,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// MODULE RATING
// ============================================================================

interface ModuleRatingProps {
  moduleId: string;
  moduleTitle: string;
  currentRating?: number;
  averageRating: number;
  totalRatings: number;
  userReview?: string;
  onRate: (rating: number, review?: string) => void;
  className?: string;
}

export function ModuleRating({
  moduleId,
  moduleTitle,
  currentRating,
  averageRating,
  totalRatings,
  userReview,
  onRate,
  className
}: ModuleRatingProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState(currentRating || 0);
  const [review, setReview] = useState(userReview || "");
  const [isEditing, setIsEditing] = useState(!currentRating);

  const displayRating = hoveredStar || selectedRating;

  const handleSubmit = () => {
    onRate(selectedRating, review || undefined);
    setIsEditing(false);
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Rate This Module
          </CardTitle>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({totalRatings})</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {/* Star rating */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => setSelectedRating(star)}
                  >
                    <Star
                      className={cn(
                        "w-8 h-8 transition-colors",
                        star <= displayRating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <p className="text-sm font-medium text-amber-600">
                  {ratingLabels[displayRating]}
                </p>
              )}
            </div>

            {/* Review text */}
            <Textarea
              placeholder="Share your thoughts about this module (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="resize-none"
              rows={3}
            />

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={selectedRating === 0}
              className="w-full bg-primary"
            >
              Submit Rating
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-5 h-5",
                      star <= (currentRating || 0)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </div>
            {userReview && (
              <p className="text-sm text-gray-600 italic">"{userReview}"</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// DISCUSSION THREAD
// ============================================================================

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface DiscussionThreadProps {
  moduleId: string;
  moduleTitle: string;
  comments: Comment[];
  onPostComment: (content: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  className?: string;
}

export function DiscussionThread({
  moduleId,
  moduleTitle,
  comments,
  onPostComment,
  onLikeComment,
  className
}: DiscussionThreadProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onPostComment(newComment);
    setNewComment("");
  };

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    onPostComment(replyContent, parentId);
    setReplyContent("");
    setReplyingTo(null);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={cn("flex gap-3", isReply && "ml-10")}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {comment.author.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{comment.author.name}</span>
          {comment.author.role && (
            <Badge variant="outline" className="text-[10px] h-4">
              {comment.author.role}
            </Badge>
          )}
          <span className="text-xs text-gray-400">{formatTime(comment.timestamp)}</span>
        </div>
        <p className="text-sm text-gray-700">{comment.content}</p>
        <div className="flex items-center gap-4 mt-2">
          <button
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              comment.isLiked ? "text-red-500" : "text-gray-400 hover:text-gray-600"
            )}
            onClick={() => onLikeComment(comment.id)}
          >
            <Heart className={cn("w-3.5 h-3.5", comment.isLiked && "fill-current")} />
            {comment.likes}
          </button>
          {!isReply && (
            <button
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              onClick={() => setReplyingTo(comment.id)}
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          )}
        </div>

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="flex gap-2 mt-3">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="resize-none text-sm"
              rows={2}
            />
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                onClick={() => handleReply(comment.id)}
                disabled={!replyContent.trim()}
              >
                <Send className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-500" />
            Discussion
          </CardTitle>
          <Badge variant="outline">{comments.length} comments</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* New comment input */}
        <div className="flex gap-3 mb-6">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs bg-violet-500 text-primary">
              You
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Ask a question or share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none mb-2"
              rows={2}
            />
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="bg-primary"
            >
              <Send className="w-3 h-3 mr-1" />
              Post
            </Button>
          </div>
        </div>

        {/* Comments list */}
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No comments yet. Be the first to start a discussion!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PEER RECOGNITION
// ============================================================================

interface Recognition {
  id: string;
  from: {
    name: string;
    avatar?: string;
  };
  to: {
    name: string;
    avatar?: string;
  };
  achievement: string;
  message: string;
  timestamp: Date;
  reactions: number;
}

interface PeerRecognitionProps {
  recognitions: Recognition[];
  onSendRecognition: (toUserId: string, achievement: string, message: string) => void;
  teamMembers: Array<{ id: string; name: string; avatar?: string }>;
  className?: string;
}

export function PeerRecognition({
  recognitions,
  onSendRecognition,
  teamMembers,
  className
}: PeerRecognitionProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const achievements = [
    { id: "helper", label: "Helpful Teammate", icon: Heart },
    { id: "expert", label: "Subject Matter Expert", icon: Award },
    { id: "motivator", label: "Great Motivator", icon: Sparkles },
    { id: "learner", label: "Fast Learner", icon: BookOpen },
  ];

  const handleSend = () => {
    if (!selectedMember || !selectedAchievement) return;
    onSendRecognition(selectedMember, selectedAchievement, message);
    setShowDialog(false);
    setSelectedMember(null);
    setSelectedAchievement(null);
    setMessage("");
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-500" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AtSign className="w-4 h-4 text-pink-500" />
            Peer Recognition
          </CardTitle>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-pink-600 border-pink-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Give Recognition
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Recognize a Teammate</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Select teammate */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Who would you like to recognize?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {teamMembers.slice(0, 6).map((member) => (
                      <button
                        key={member.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                          selectedMember === member.id
                            ? "border-pink-400 bg-pink-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => setSelectedMember(member.id)}
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">{member.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select achievement */}
                <div>
                  <label className="text-sm font-medium mb-2 block">What are you recognizing them for?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {achievements.map((ach) => {
                      const Icon = ach.icon;
                      return (
                        <button
                          key={ach.id}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                            selectedAchievement === ach.id
                              ? "border-pink-400 bg-pink-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                          onClick={() => setSelectedAchievement(ach.id)}
                        >
                          <Icon className="w-5 h-5 text-pink-500" />
                          <span className="text-sm">{ach.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Add a message (optional)</label>
                  <Textarea
                    placeholder="Say something nice..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleSend}
                  disabled={!selectedMember || !selectedAchievement}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Send Recognition
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {recognitions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No recognitions yet. Be the first to appreciate a teammate!
          </p>
        ) : (
          <div className="space-y-3">
            {recognitions.slice(0, 5).map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg"
              >
                <div className="flex -space-x-2">
                  <Avatar className="w-8 h-8 border-2 border-white">
                    <AvatarImage src={rec.from.avatar} />
                    <AvatarFallback className="text-xs">
                      {rec.from.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="w-8 h-8 border-2 border-white">
                    <AvatarImage src={rec.to.avatar} />
                    <AvatarFallback className="text-xs">
                      {rec.to.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{rec.from.name}</span>
                    {" recognized "}
                    <span className="font-medium">{rec.to.name}</span>
                    {" for "}
                    <span className="text-pink-600">{rec.achievement}</span>
                  </p>
                  {rec.message && (
                    <p className="text-xs text-gray-600 mt-1 italic">"{rec.message}"</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// STUDY GROUPS
// ============================================================================

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: Array<{ id: string; name: string; avatar?: string }>;
  maxMembers: number;
  topic: string;
  nextSession?: Date;
  isJoined: boolean;
}

interface StudyGroupsProps {
  groups: StudyGroup[];
  onJoinGroup: (groupId: string) => void;
  onLeaveGroup: (groupId: string) => void;
  onCreateGroup?: () => void;
  className?: string;
}

export function StudyGroups({
  groups,
  onJoinGroup,
  onLeaveGroup,
  onCreateGroup,
  className
}: StudyGroupsProps) {
  const formatNextSession = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" />
            Study Groups
          </CardTitle>
          {onCreateGroup && (
            <Button size="sm" variant="outline" onClick={onCreateGroup}>
              <UserPlus className="w-3 h-3 mr-1" />
              Create Group
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <div className="text-center py-6">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No study groups available</p>
            {onCreateGroup && (
              <Button variant="link" className="mt-2" onClick={onCreateGroup}>
                Create the first one
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  group.isJoined ? "border-violet-500/50 bg-violet-500/5" : "border-gray-200"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{group.name}</h4>
                    <p className="text-xs text-gray-500">{group.description}</p>
                  </div>
                  {group.isJoined ? (
                    <Badge className="bg-violet-500 text-primary">Joined</Badge>
                  ) : (
                    <Badge variant="outline">{group.members.length}/{group.maxMembers}</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-[10px]">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {group.topic}
                  </Badge>
                  {group.nextSession && (
                    <Badge variant="outline" className="text-[10px]">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatNextSession(group.nextSession)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 4).map((member) => (
                      <Avatar key={member.id} className="w-6 h-6 border-2 border-white">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {group.members.length > 4 && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                        <span className="text-[10px] text-gray-600">+{group.members.length - 4}</span>
                      </div>
                    )}
                  </div>

                  {group.isJoined ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-500"
                      onClick={() => onLeaveGroup(group.id)}
                    >
                      Leave
                    </Button>
                  ) : group.members.length < group.maxMembers ? (
                    <Button
                      size="sm"
                      className="bg-primary"
                      onClick={() => onJoinGroup(group.id)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Join
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">Full</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPACT RATING DISPLAY (for module cards)
// ============================================================================

interface CompactRatingProps {
  rating: number;
  count: number;
  className?: string;
}

export function CompactRating({ rating, count, className }: CompactRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count})</span>
    </div>
  );
}
