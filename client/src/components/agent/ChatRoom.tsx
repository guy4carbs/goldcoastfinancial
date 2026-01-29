import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Phone, Users, Plus, Send, Hash, MessageSquare, Search, Smile, Paperclip, Image, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: string;
  createdAt: string;
}

interface ChatConversation {
  id: string;
  name: string | null;
  type: string;
  createdById: string;
  participantCount?: number;
  lastMessage?: ChatMessage | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface ChatRoomProps {
  currentUserId: string;
  currentUserName: string;
}

const EMOJI_LIST = ["😀", "😂", "🎉", "👍", "👏", "🔥", "❤️", "💯", "🙌", "✅", "💪", "🚀", "⭐", "💰", "📈", "🏆"];

export default function ChatRoom({ currentUserId, currentUserName }: ChatRoomProps) {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading: loadingConversations } = useQuery<ChatConversation[]>({
    queryKey: ["/api/chat/conversations"],
  });

  const { data: mainChat } = useQuery<ChatConversation>({
    queryKey: ["/api/chat/main"],
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery<ChatMessage[]>({
    queryKey: [`/api/chat/conversations/${selectedConversation?.id}/messages`],
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  const { data: availableUsers = [] } = useQuery<ChatUser[]>({
    queryKey: ["/api/chat/users"],
  });

  useEffect(() => {
    if (mainChat && !selectedConversation) {
      setSelectedConversation(mainChat);
    }
  }, [mainChat, selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/chat/conversations/${selectedConversation?.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: [`/api/chat/conversations/${selectedConversation?.id}/messages`] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async ({ name, participantIds }: { name?: string; participantIds: string[] }) => {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name || null,
          type: participantIds.length > 1 ? "group" : "direct",
          participantIds,
        }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json();
    },
    onSuccess: (newConv) => {
      setShowNewChatModal(false);
      setNewChatName("");
      setSelectedUsers([]);
      setSelectedConversation(newConv);
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    let content = messageInput.trim();
    if (attachedFile) {
      content = `${content} [Attached: ${attachedFile.name}]`;
    }
    sendMessageMutation.mutate(content);
    setAttachedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) return;
    createConversationMutation.mutate({
      name: selectedUsers.length > 1 ? newChatName : undefined,
      participantIds: selectedUsers,
    });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const filteredUsers = availableUsers.filter(user =>
    userSearch === "" ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const allConversations = [
    ...(mainChat ? [mainChat] : []),
    ...conversations.filter(c => c.id !== mainChat?.id),
  ];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const getConversationDisplayName = (conv: ChatConversation) => {
    if (conv.name) return conv.name;
    if (conv.type === "direct") return "Direct Message";
    return "Group Chat";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold">Team Chat</h2>
          <p className="text-muted-foreground text-sm">Connect with your team and managers</p>
        </div>
        <Dialog open={showNewChatModal} onOpenChange={setShowNewChatModal}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start a New Conversation</DialogTitle>
              <DialogDescription>Select team members to chat with</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-user-search"
                />
              </div>
              
              {selectedUsers.length > 1 && (
                <div>
                  <Label>Group Name (optional)</Label>
                  <Input
                    placeholder="Enter group name..."
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    className="mt-1"
                    data-testid="input-group-name"
                  />
                </div>
              )}

              <ScrollArea className="h-[200px] border rounded-lg p-2">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                          selectedUsers.includes(user.id) && "bg-violet-50"
                        )}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {selectedUsers.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedUsers.length} member{selectedUsers.length > 1 ? "s" : ""} selected
                </p>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewChatModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateChat}
                  disabled={selectedUsers.length === 0 || createConversationMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createConversationMutation.isPending ? "Creating..." : "Start Chat"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {loadingConversations ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : allConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                allConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors border-b",
                      selectedConversation?.id === conv.id && "bg-violet-50"
                    )}
                    onClick={() => setSelectedConversation(conv)}
                    data-testid={`chat-conversation-${conv.id}`}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                      conv.type === "channel" ? "bg-primary/10 text-primary" : "bg-violet-100 text-violet-600"
                    )}>
                      {conv.type === "channel" ? <Hash className="w-5 h-5" /> : <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getConversationDisplayName(conv)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-medium",
                  selectedConversation?.type === "channel" ? "bg-primary/10 text-primary" : "bg-violet-100 text-violet-600"
                )}>
                  {selectedConversation?.type === "channel" ? <Hash className="w-5 h-5" /> : <MessageSquare className="w-4 h-4" />}
                </div>
                <div>
                  <CardTitle className="text-base">
                    {selectedConversation ? getConversationDisplayName(selectedConversation) : "Select a conversation"}
                  </CardTitle>
                  <CardDescription>
                    {selectedConversation?.participantCount || 0} members
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={showCallModal} onOpenChange={setShowCallModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-chat-call">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Start a Call</DialogTitle>
                      <DialogDescription>Choose how you'd like to connect</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 pt-4">
                      <Button 
                        className="w-full gap-2 bg-primary hover:bg-primary/90" 
                        onClick={() => {
                          window.open('https://meet.google.com/new', '_blank');
                          setShowCallModal(false);
                        }}
                      >
                        <Phone className="w-4 h-4" />
                        Start Google Meet
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => {
                          window.open('https://zoom.us/start/videomeeting', '_blank');
                          setShowCallModal(false);
                        }}
                      >
                        <Phone className="w-4 h-4" />
                        Start Zoom Call
                      </Button>
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        Share the meeting link with your team in the chat
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-chat-members">
                      <Users className="w-4 h-4 mr-2" />
                      Members
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Chat Members</DialogTitle>
                      <DialogDescription>
                        {selectedConversation?.participantCount || 0} members in this chat
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[250px] pt-4">
                      <div className="space-y-2">
                        {availableUsers.map((user) => (
                          <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px]">Online</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-4">
              {loadingMessages ? (
                <div className="text-center text-muted-foreground py-8">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No messages yet. Be the first to say hello!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex gap-3", isOwn && "flex-row-reverse")}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                          isOwn ? "bg-secondary text-white" : "bg-muted"
                        )}>
                          {msg.senderName.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          isOwn ? "bg-secondary text-white" : "bg-muted"
                        )}>
                          {!isOwn && (
                            <p className="text-xs font-medium mb-1">{msg.senderName}</p>
                          )}
                          <p className="text-sm">{msg.content}</p>
                          <p className={cn(
                            "text-xs mt-1",
                            isOwn ? "text-white/70" : "text-muted-foreground"
                          )}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            <div className="p-4 border-t">
              {attachedFile && (
                <div className="mb-2 flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{attachedFile.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setAttachedFile(null)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <div className="flex gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9"
                        disabled={!selectedConversation}
                        data-testid="button-emoji"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                      <div className="grid grid-cols-8 gap-1">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded text-lg"
                            onClick={() => insertEmoji(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9"
                    disabled={!selectedConversation}
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-attach-file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <input
                    type="file"
                    ref={imageInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9"
                    disabled={!selectedConversation}
                    onClick={() => imageInputRef.current?.click()}
                    data-testid="button-attach-image"
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  disabled={!selectedConversation || sendMessageMutation.isPending}
                  className="flex-1"
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!selectedConversation || (!messageInput.trim() && !attachedFile) || sendMessageMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
