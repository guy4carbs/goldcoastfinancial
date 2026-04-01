import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Voicemail, Trash2, Save, ChevronDown, ChevronUp, Copy, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoiceRecorder } from "@/components/ui/voice-recorder";
import { useAgentStore } from "@/lib/agentStore";
import { RADIUS, SHADOW, fadeInUp } from "@/lib/heritageDesignSystem";
import { toast } from "sonner";

const VOICEMAIL_SCRIPT = `Hey, this is [YOUR NAME] with Heritage Life Solutions — I'm reaching out because you recently inquired about coverage, and I have some really great options I think you'd want to see before they change.
I can only hold these rates for a short time so give me a call back at [YOUR PHONE] when you get this.
Again, that's [YOUR NAME] at [YOUR PHONE]. Talk soon!`;

export function VoicemailRecorder() {
  const queryClient = useQueryClient();
  const currentUser = useAgentStore((s) => s.currentUser);
  const [scriptExpanded, setScriptExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const pendingBlobRef = useRef<Blob | null>(null);
  const [pendingDuration, setPendingDuration] = useState(0);

  // Fetch current voicemail status
  const { data: vmData, isLoading } = useQuery<{ hasVoicemail: boolean; voicemailUrl: string | null }>({
    queryKey: ["/api/calls/voicemail"],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      const formData = new FormData();
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("wav") ? "wav" : "webm";
      formData.append("file", blob, `voicemail.${ext}`);
      const res = await fetch("/api/calls/voicemail/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls/voicemail"] });
      pendingBlobRef.current = null;
      toast.success("Voicemail saved! It will be played when calls go to voicemail.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save voicemail");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/calls/voicemail", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls/voicemail"] });
      pendingBlobRef.current = null;
      setPendingDuration(0);
      toast.success("Voicemail deleted");
    },
    onError: () => {
      toast.error("Failed to delete voicemail");
    },
  });

  const formatPhone = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 10);
    if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    return val;
  };
  const agentPhone = currentUser?.phone ? formatPhone(currentUser.phone) : "your number";
  const personalizedScript = VOICEMAIL_SCRIPT
    .replaceAll("[YOUR NAME]", currentUser?.name || "your name")
    .replaceAll("[YOUR PHONE]", agentPhone);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(personalizedScript);
    setCopied(true);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    pendingBlobRef.current = blob;
    setPendingDuration(duration);
  };

  const handleSave = () => {
    if (pendingBlobRef.current) {
      uploadMutation.mutate(pendingBlobRef.current);
    }
  };

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-5">
      {/* Status Card */}
      <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Voicemail className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your Voicemail</h2>
                <p className="text-sm text-gray-500">This message plays when your outbound calls reach a lead's voicemail</p>
              </div>
            </div>
            <Badge
              className={vmData?.hasVoicemail
                ? "bg-emerald-100 text-emerald-700 border-0"
                : "bg-amber-100 text-amber-700 border-0"
              }
              style={{ borderRadius: RADIUS.pill }}
            >
              {vmData?.hasVoicemail ? "Active" : "Not Recorded"}
            </Badge>
          </div>

          {vmData?.hasVoicemail && !pendingBlobRef.current && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 flex items-start gap-2" style={{ borderRadius: RADIUS.input }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700">
                Your voicemail is active. When you call a lead and they don't pick up, your recorded message will automatically play after the beep.
              </p>
            </div>
          )}

          {!vmData?.hasVoicemail && !pendingBlobRef.current && (
            <div className="p-3 bg-amber-50 border border-amber-100 flex items-start gap-2" style={{ borderRadius: RADIUS.input }}>
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                No voicemail recorded yet. Record one below — it'll play automatically when you call a lead and they don't answer.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Script Card */}
      <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
        <CardContent className="p-6">
          <button
            type="button"
            onClick={() => setScriptExpanded(!scriptExpanded)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Suggested Script</span>
              <Badge variant="secondary" className="text-[10px]" style={{ borderRadius: RADIUS.pill }}>
                Tap to {scriptExpanded ? "collapse" : "expand"}
              </Badge>
            </div>
            {scriptExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {scriptExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
              <div className="p-4 bg-violet-50 border border-violet-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line" style={{ borderRadius: RADIUS.input }}>
                {personalizedScript}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyScript}
                className="mt-3 gap-2"
                style={{ borderRadius: RADIUS.button }}
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Script"}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Recorder Card */}
      <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
        <CardContent className="p-6">
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            existingAudioUrl={vmData?.voicemailUrl}
            isUploading={uploadMutation.isPending}
            maxDuration={60}
          />

          {/* Save / Delete actions */}
          {(pendingBlobRef.current || vmData?.hasVoicemail) && (
            <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
              {pendingBlobRef.current && (
                <Button
                  onClick={handleSave}
                  disabled={uploadMutation.isPending}
                  className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                  style={{ borderRadius: RADIUS.button }}
                >
                  {uploadMutation.isPending ? (
                    <span className="animate-spin">...</span>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Voicemail
                </Button>
              )}

              {vmData?.hasVoicemail && (
                <Button
                  variant="outline"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Voicemail
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
