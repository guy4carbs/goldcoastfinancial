/**
 * AgentDialer - Phone Dialer for Agent Lounge
 * Power dialer functionality for outbound calling campaigns
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero, AgentStatCard, AgentStatCardGrid, DemoBadge } from "@/components/agent/primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  Clock,
  User,
  Users,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Pause,
  Play,
  SkipForward,
  History,
  Star,
  FileText,
  ChevronRight,
  Search,
  Plus,
  Settings,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RADIUS, SHADOW, MOTION, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

interface CallLog {
  id: string;
  name: string;
  phone: string;
  time: string;
  duration: string;
  type: 'outbound' | 'inbound' | 'missed';
  outcome?: 'connected' | 'voicemail' | 'no-answer' | 'busy';
}

const RECENT_CALLS: CallLog[] = [
  { id: '1', name: 'John Smith', phone: '(555) 123-4567', time: '10:30 AM', duration: '5:23', type: 'outbound', outcome: 'connected' },
  { id: '2', name: 'Sarah Johnson', phone: '(555) 234-5678', time: '10:15 AM', duration: '0:45', type: 'outbound', outcome: 'voicemail' },
  { id: '3', name: 'Mike Williams', phone: '(555) 345-6789', time: '9:45 AM', duration: '-', type: 'missed', outcome: 'no-answer' },
  { id: '4', name: 'Emily Davis', phone: '(555) 456-7890', time: '9:30 AM', duration: '12:15', type: 'outbound', outcome: 'connected' },
  { id: '5', name: 'Robert Brown', phone: '(555) 567-8901', time: 'Yesterday', duration: '3:45', type: 'inbound', outcome: 'connected' },
];

const DIALPAD_KEYS = [
  { num: '1', letters: '' },
  { num: '2', letters: 'ABC' },
  { num: '3', letters: 'DEF' },
  { num: '4', letters: 'GHI' },
  { num: '5', letters: 'JKL' },
  { num: '6', letters: 'MNO' },
  { num: '7', letters: 'PQRS' },
  { num: '8', letters: 'TUV' },
  { num: '9', letters: 'WXYZ' },
  { num: '*', letters: '' },
  { num: '0', letters: '+' },
  { num: '#', letters: '' },
];

export default function AgentDialer() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDialpadPress = (key: string) => {
    setPhoneNumber(prev => prev + key);
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }
    setIsInCall(true);
    toast.success('Calling ' + phoneNumber);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCallDuration(0);
    toast.info('Call ended');
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    return number;
  };

  const getCallTypeIcon = (type: CallLog['type']) => {
    switch (type) {
      case 'outbound': return <PhoneCall className="w-4 h-4 text-violet-500" />;
      case 'inbound': return <Phone className="w-4 h-4 text-violet-500" />;
      case 'missed': return <PhoneMissed className="w-4 h-4 text-red-500" />;
    }
  };

  const filteredCalls = RECENT_CALLS.filter(call =>
    call.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.phone.includes(searchQuery)
  );

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Phone}
            title="Dialer"
            subtitle="Power dialer for outbound calling campaigns"
            badge={<DemoBadge className="bg-white/20 text-white border-white/30" />}
          >
            <Button
              className="gap-2 bg-white/20 backdrop-blur hover:bg-white/30 text-white border-0"
              style={{ borderRadius: RADIUS.button }}
            >
              <Headphones className="w-4 h-4" />
              Start Power Dial
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard
              icon={PhoneCall}
              value={24}
              label="Calls Today"
              gradient="from-violet-500 to-purple-600"
            />
            <AgentStatCard
              icon={Clock}
              value="1h 23m"
              label="Talk Time"
              gradient="from-emerald-500 to-green-600"
            />
            <AgentStatCard
              icon={Users}
              value="68%"
              label="Connect Rate"
              gradient="from-amber-500 to-orange-600"
            />
            <AgentStatCard
              icon={Star}
              value={8}
              label="Appointments Set"
              gradient="from-violet-500 to-purple-600"
            />
          </AgentStatCardGrid>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Dialpad */}
          <motion.div variants={fadeInUp}>
            <Card
              className="border-0"
              style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5 text-violet-500" />
                  Dialpad
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Phone Number Display */}
                <div className="mb-6">
                  <div
                    className="relative bg-gray-50 p-4 text-center"
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <p className="text-2xl font-semibold text-gray-900 tracking-wider min-h-[36px]">
                      {formatPhoneNumber(phoneNumber) || 'Enter number'}
                    </p>
                    {phoneNumber && (
                      <button
                        onClick={handleBackspace}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dialpad Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {DIALPAD_KEYS.map((key) => (
                    <motion.button
                      key={key.num}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDialpadPress(key.num)}
                      className="flex flex-col items-center justify-center py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <span className="text-2xl font-semibold text-gray-900">{key.num}</span>
                      {key.letters && (
                        <span className="text-[10px] text-gray-400 tracking-widest">{key.letters}</span>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Call Button */}
                {!isInCall ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCall}
                    className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Phone className="w-5 h-5" />
                    Call
                  </motion.button>
                ) : (
                  <div className="space-y-3">
                    {/* Call Controls */}
                    <div className="flex justify-center gap-4">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsMuted(!isMuted)}
                        className={cn(
                          "w-14 h-14 flex items-center justify-center rounded-full transition-colors",
                          isMuted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        className={cn(
                          "w-14 h-14 flex items-center justify-center rounded-full transition-colors",
                          isSpeakerOn ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                      </motion.button>
                    </div>

                    {/* End Call Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEndCall}
                      className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <PhoneOff className="w-5 h-5" />
                      End Call
                    </motion.button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Calls */}
          <motion.div variants={fadeInUp}>
            <Card
              className="border-0 h-full"
              style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-violet-500" />
                    Recent Calls
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1 text-violet-600">
                    <Plus className="w-4 h-4" />
                    Add Contact
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search calls..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>

                {/* Call List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredCalls.map((call) => (
                    <motion.div
                      key={call.id}
                      whileHover={{ x: 2 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      style={{ borderRadius: RADIUS.input }}
                      onClick={() => {
                        setPhoneNumber(call.phone.replace(/\D/g, ''));
                        toast.info(`Ready to call ${call.name}`);
                      }}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {call.name.split(' ').map(n => n[0]).join('')}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">{call.name}</span>
                          {getCallTypeIcon(call.type)}
                        </div>
                        <p className="text-sm text-gray-500">{call.phone}</p>
                      </div>

                      {/* Time & Duration */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{call.time}</p>
                        <p className="text-xs text-gray-400">{call.duration}</p>
                      </div>

                      {/* Call Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 text-violet-600 hover:bg-violet-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhoneNumber(call.phone.replace(/\D/g, ''));
                          handleCall();
                        }}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-lg font-semibold mb-4">Power Dial Queues</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Hot Leads', count: 12, icon: Star, description: 'High priority leads to call', gradient: 'from-amber-400 to-orange-500' },
              { name: 'Follow-ups', count: 28, icon: Clock, description: 'Scheduled follow-up calls', gradient: 'from-violet-400 to-purple-500' },
              { name: 'New Leads', count: 45, icon: Users, description: 'Fresh leads to contact', gradient: 'from-violet-400 to-purple-500' },
            ].map((queue, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
              >
                <Card
                  className="border-0 transition-all cursor-pointer group"
                  style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn("w-12 h-12 bg-gradient-to-br flex items-center justify-center shadow-md", queue.gradient)}
                        style={{ borderRadius: RADIUS.button }}
                      >
                        <queue.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{queue.name}</h3>
                          <Badge className="bg-violet-100 text-violet-700">{queue.count}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{queue.description}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                        style={{ borderRadius: RADIUS.button }}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
