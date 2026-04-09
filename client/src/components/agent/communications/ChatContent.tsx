/**
 * ChatContent - Team Chat functionality extracted for Communications hub
 * Provides full chat capabilities within a tab interface
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStore } from "@/lib/agentStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Smile,
  Paperclip,
  Phone,
  Video,
  CheckCheck,
  Menu,
  X,
  Reply,
  AtSign,
  File,
  ImageIcon,
  XCircle,
  PenSquare,
  ChevronLeft,
  Info,
  Bell,
  BellOff,
  Trash2,
  UserPlus,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import { type CommColorScheme, getCommTheme } from './commTheme';

// Constants
// Apple Tapback reactions
const TAPBACK_REACTIONS: readonly string[] = ['❤️', '👍', '👎', '😂', '‼️', '❓'] as const;
const MENTION_REGEX = /@(\w+\s?\w*)/g;

// Full emoji categories - Complete Apple emoji library
const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😶‍🌫️', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊'],
  'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'],
  'People': ['👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '🥷', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴️', '👯', '🧖', '🧗', '🤸', '🏌️', '🏇', '⛷️', '🏂', '🏋️', '🤼', '🤽', '🤾', '🤺', '⛹️', '🚣', '🧘', '🛀', '🛌'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '❤️‍🔥', '❤️‍🩹', '💌', '💒', '💑', '💏', '👪', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧'],
  'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
  'Nature': ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪹', '🪺', '🍄', '🌰', '🪨', '🪵', '🌍', '🌎', '🌏', '🌐', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️'],
  'Food': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'],
  'Travel': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁'],
  'Objects': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓'],
  'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '🟰', '♾️', '💲', '💱', '™️', '©️', '®️', '👁️‍🗨️', '🔚', '🔙', '🔛', '🔝', '🔜', '〰️', '➰', '➿', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'],
  'Flags': ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇨', '🇨🇩', '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾', '🇨🇿', '🇩🇪', '🇩🇬', '🇩🇯', '🇩🇰', '🇩🇲', '🇩🇴', '🇩🇿', '🇪🇦', '🇪🇨', '🇪🇪', '🇪🇬', '🇪🇭', '🇪🇷', '🇪🇸', '🇪🇹', '🇪🇺', '🇫🇮', '🇫🇯', '🇫🇰', '🇫🇲', '🇫🇴', '🇫🇷', '🇬🇦', '🇬🇧', '🇬🇩', '🇬🇪', '🇬🇫', '🇬🇬', '🇬🇭', '🇬🇮', '🇬🇱', '🇬🇲', '🇬🇳', '🇬🇵', '🇬🇶', '🇬🇷', '🇬🇸', '🇬🇹', '🇬🇺', '🇬🇼', '🇬🇾', '🇭🇰', '🇭🇲', '🇭🇳', '🇭🇷', '🇭🇹', '🇭🇺', '🇮🇨', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇲', '🇮🇳', '🇮🇴', '🇮🇶', '🇮🇷', '🇮🇸', '🇮🇹', '🇯🇪', '🇯🇲', '🇯🇴', '🇯🇵', '🇰🇪', '🇰🇬', '🇰🇭', '🇰🇮', '🇰🇲', '🇰🇳', '🇰🇵', '🇰🇷', '🇰🇼', '🇰🇾', '🇰🇿', '🇱🇦', '🇱🇧', '🇱🇨', '🇱🇮', '🇱🇰', '🇱🇷', '🇱🇸', '🇱🇹', '🇱🇺', '🇱🇻', '🇱🇾', '🇲🇦', '🇲🇨', '🇲🇩', '🇲🇪', '🇲🇫', '🇲🇬', '🇲🇭', '🇲🇰', '🇲🇱', '🇲🇲', '🇲🇳', '🇲🇴', '🇲🇵', '🇲🇶', '🇲🇷', '🇲🇸', '🇲🇹', '🇲🇺', '🇲🇻', '🇲🇼', '🇲🇽', '🇲🇾', '🇲🇿', '🇳🇦', '🇳🇨', '🇳🇪', '🇳🇫', '🇳🇬', '🇳🇮', '🇳🇱', '🇳🇴', '🇳🇵', '🇳🇷', '🇳🇺', '🇳🇿', '🇴🇲', '🇵🇦', '🇵🇪', '🇵🇫', '🇵🇬', '🇵🇭', '🇵🇰', '🇵🇱', '🇵🇲', '🇵🇳', '🇵🇷', '🇵🇸', '🇵🇹', '🇵🇼', '🇵🇾', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇸', '🇷🇺', '🇷🇼', '🇸🇦', '🇸🇧', '🇸🇨', '🇸🇩', '🇸🇪', '🇸🇬', '🇸🇭', '🇸🇮', '🇸🇯', '🇸🇰', '🇸🇱', '🇸🇲', '🇸🇳', '🇸🇴', '🇸🇷', '🇸🇸', '🇸🇹', '🇸🇻', '🇸🇽', '🇸🇾', '🇸🇿', '🇹🇦', '🇹🇨', '🇹🇩', '🇹🇫', '🇹🇬', '🇹🇭', '🇹🇯', '🇹🇰', '🇹🇱', '🇹🇲', '🇹🇳', '🇹🇴', '🇹🇷', '🇹🇹', '🇹🇻', '🇹🇼', '🇹🇿', '🇺🇦', '🇺🇬', '🇺🇲', '🇺🇳', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇦', '🇻🇨', '🇻🇪', '🇻🇬', '🇻🇮', '🇻🇳', '🇻🇺', '🇼🇫', '🇼🇸', '🇽🇰', '🇾🇪', '🇾🇹', '🇿🇦', '🇿🇲', '🇿🇼', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿'],
} as const;

// Skin tone modifiers
const SKIN_TONES = ['', '🏻', '🏼', '🏽', '🏾', '🏿'] as const;
const SKIN_TONE_LABELS = ['Default', 'Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];

// Emojis that actually support skin tones (only hands, people, and body parts that change)
const SKIN_TONE_EMOJIS = new Set([
  // Hand gestures
  '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪',
  // People
  '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '🥷', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴️', '🧖', '🧗', '🤸', '🏌️', '🏇', '⛷️', '🏂', '🏋️', '🤽', '🤾', '⛹️', '🚣', '🧘', '🛀', '🛌',
  // Body parts that support skin tones
  '🦵', '🦶', '👂', '🦻', '👃',
  // Couples/families
  '🧑‍🤝‍🧑', '👭', '👫', '👬'
]);

// Emoji search terms for filtering
const EMOJI_SEARCH_TERMS: Record<string, string> = {
  '😀': 'grinning face happy smile', '😃': 'smiley happy joy', '😄': 'smile happy laugh', '😁': 'grin beam happy', '😆': 'laughing satisfied', '😅': 'sweat smile nervous', '🤣': 'rofl rolling floor laughing', '😂': 'joy tears laughing crying', '🙂': 'slightly smiling', '🙃': 'upside down silly', '😉': 'wink flirt', '😊': 'blush happy shy', '😇': 'angel innocent halo', '🥰': 'love hearts smiling', '😍': 'heart eyes love', '🤩': 'star struck excited', '😘': 'kiss love blow', '😗': 'kissing', '😚': 'kissing closed eyes', '😙': 'kissing smiling', '🥲': 'smiling tear happy sad', '😋': 'yum delicious tasty', '😛': 'tongue out playful', '😜': 'wink tongue crazy', '🤪': 'zany crazy wild', '😝': 'squinting tongue', '🤑': 'money face rich', '🤗': 'hugging hug', '🤭': 'hand over mouth giggle', '🤫': 'shushing quiet secret', '🤔': 'thinking hmm wonder', '🤐': 'zipper mouth quiet', '🤨': 'raised eyebrow suspicious', '😐': 'neutral face blank', '😑': 'expressionless blank', '😶': 'no mouth silent', '😏': 'smirk smug', '😒': 'unamused annoyed', '🙄': 'eye roll whatever', '😬': 'grimace awkward', '🤥': 'lying pinocchio', '😌': 'relieved peaceful', '😔': 'pensive sad thoughtful', '😪': 'sleepy tired', '🤤': 'drooling yum', '😴': 'sleeping zzz', '😷': 'mask sick medical', '🤒': 'thermometer sick fever', '🤕': 'bandage hurt injured', '🤢': 'nauseated sick gross', '🤮': 'vomiting sick throw up', '🤧': 'sneezing sick cold', '🥵': 'hot sweating heat', '🥶': 'cold freezing frozen', '🥴': 'woozy drunk dizzy', '😵': 'dizzy knocked out', '🤯': 'mind blown exploding head', '🤠': 'cowboy western hat', '🥳': 'party celebrate birthday', '🥸': 'disguise incognito', '😎': 'cool sunglasses', '🤓': 'nerd glasses geek', '🧐': 'monocle fancy curious',
  '👋': 'wave hello hi goodbye', '🤚': 'raised back hand stop', '🖐️': 'hand fingers spread', '✋': 'raised hand stop high five', '🖖': 'vulcan spock star trek', '👌': 'ok okay perfect', '🤌': 'pinched fingers italian', '🤏': 'pinching small tiny', '✌️': 'peace victory', '🤞': 'crossed fingers luck hope', '🤟': 'love you gesture', '🤘': 'rock on metal horns', '🤙': 'call me shaka hang loose', '👈': 'point left', '👉': 'point right', '👆': 'point up', '👇': 'point down', '☝️': 'index up one', '👍': 'thumbs up like good yes', '👎': 'thumbs down dislike bad no', '✊': 'fist bump raised', '👊': 'punch fist bump', '🤛': 'left fist bump', '🤜': 'right fist bump', '👏': 'clap applause bravo', '🙌': 'raised hands celebration praise', '👐': 'open hands', '🤲': 'palms together', '🤝': 'handshake deal agreement', '🙏': 'pray please thank you folded hands', '✍️': 'writing hand', '💅': 'nail polish manicure', '🤳': 'selfie', '💪': 'muscle strong flex bicep',
  '❤️': 'red heart love', '🧡': 'orange heart', '💛': 'yellow heart', '💚': 'green heart', '💙': 'blue heart', '💜': 'purple heart', '🖤': 'black heart', '🤍': 'white heart', '🤎': 'brown heart', '💔': 'broken heart sad', '❣️': 'heart exclamation', '💕': 'two hearts love', '💞': 'revolving hearts', '💓': 'beating heart', '💗': 'growing heart', '💖': 'sparkling heart', '💘': 'cupid heart arrow love', '💝': 'heart ribbon gift', '💟': 'heart decoration',
  '🎉': 'party popper celebration confetti', '🎊': 'confetti ball celebration', '🎈': 'balloon party birthday', '🎁': 'gift present wrapped', '🎀': 'ribbon bow', '🏆': 'trophy winner champion', '🥇': 'gold medal first winner', '🥈': 'silver medal second', '🥉': 'bronze medal third', '⚽': 'soccer football ball', '🏀': 'basketball ball', '🏈': 'american football', '⚾': 'baseball ball', '🎾': 'tennis ball', '🎯': 'target bullseye dart', '🎮': 'video game controller gaming', '🎲': 'dice game random',
  '🔥': 'fire hot flame lit', '✨': 'sparkles stars magic', '💫': 'dizzy star', '⭐': 'star yellow', '🌟': 'glowing star shining', '⚡': 'lightning bolt electric zap', '💥': 'boom explosion collision', '🌈': 'rainbow colors pride', '☀️': 'sun sunny bright', '🌙': 'moon crescent night', '⛅': 'cloud sun partly cloudy', '❄️': 'snowflake cold winter', '💧': 'water drop', '🌊': 'wave ocean water sea',
  '🍎': 'apple red fruit', '🍕': 'pizza food slice', '🍔': 'burger hamburger food', '🍟': 'fries french food', '🍦': 'ice cream dessert', '🍩': 'donut doughnut', '🍪': 'cookie biscuit', '🎂': 'birthday cake celebration', '🍰': 'cake slice dessert', '☕': 'coffee hot drink', '🍺': 'beer drink alcohol', '🍷': 'wine glass drink',
  '💼': 'briefcase work business', '📱': 'phone mobile cell', '💻': 'laptop computer', '📧': 'email envelope mail', '📅': 'calendar date', '✅': 'check mark done yes', '❌': 'cross mark no wrong', '❓': 'question mark', '❗': 'exclamation mark alert', '💯': 'hundred perfect score', '💰': 'money bag rich', '💵': 'dollar bill money', '💳': 'credit card payment',
  '🇺🇸': 'usa america united states flag', '🇬🇧': 'uk britain england flag', '🇨🇦': 'canada flag', '🇦🇺': 'australia flag', '🇩🇪': 'germany flag', '🇫🇷': 'france flag', '🇪🇸': 'spain flag', '🇮🇹': 'italy flag', '🇯🇵': 'japan flag', '🇰🇷': 'korea south flag', '🇨🇳': 'china flag', '🇮🇳': 'india flag', '🇧🇷': 'brazil flag', '🇲🇽': 'mexico flag', '🇷🇺': 'russia flag',
};

// Typing indicator component (Apple-style bouncing dots)
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-gray-200/80 rounded-2xl w-fit">
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
    />
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
    />
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
    />
  </div>
);

// Date separator component
const DateSeparator = ({ date }: { date: string }) => (
  <div className="flex items-center justify-center py-4">
    <span className="text-xs font-medium text-gray-400 bg-white/80 px-3 py-1 rounded-full">
      {date}
    </span>
  </div>
);

// Format timestamp like iMessage (handles "Yesterday", times, etc.)
const formatConversationTime = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
}

interface Message {
  id: string;
  sender: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  reactions?: { emoji: string; count: number }[];
  replyTo?: { id: string; sender: string; content: string };
  attachments?: Attachment[];
}

// iMessage-style conversations list
interface Conversation {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  isGroup?: boolean;
}

// API functions
const chatApi = "/api/chat";

async function fetchConversations(): Promise<any[]> {
  const res = await fetch(`${chatApi}/conversations`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

async function fetchMainChat(): Promise<any> {
  const res = await fetch(`${chatApi}/main`, { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

async function fetchMessages(conversationId: string): Promise<any[]> {
  const res = await fetch(`${chatApi}/conversations/${conversationId}/messages`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

async function sendChatMessage(conversationId: string, content: string): Promise<any> {
  const res = await fetch(`${chatApi}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

async function createConversation(participantIds: string[], name?: string): Promise<any> {
  const res = await fetch(`${chatApi}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ participantIds, name, type: participantIds.length > 1 ? "group" : "direct" }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

async function fetchChatUsers(): Promise<any[]> {
  const res = await fetch(`${chatApi}/users`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export default function AgentChatContent({ colorScheme = 'violet' as CommColorScheme }: { colorScheme?: CommColorScheme } = {}) {
  const theme = getCommTheme(colorScheme);
  const { currentUser } = useAgentStore();

  const queryClient = useQueryClient();

  // Fetch conversations from API
  const { data: apiConversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ["team-conversations"],
    queryFn: fetchConversations,
    refetchInterval: 15000,
  });

  // Auto-join main team chat
  const { data: mainChat } = useQuery({
    queryKey: ["team-main-chat"],
    queryFn: fetchMainChat,
  });

  // Map API conversations to the UI Conversation type
  const conversations: Conversation[] = useMemo(() => {
    return apiConversations.map((c: any) => {
      // lastMessage from API is a message object { content, senderName, createdAt } or null
      const lm = c.lastMessage;
      const lastMsgContent = lm?.content || '';
      const lastMsgTime = lm?.createdAt || c.updatedAt;
      return {
        id: c.id,
        name: c.name || 'Direct Message',
        initials: (c.name || 'DM').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        lastMessage: lastMsgContent,
        timestamp: lastMsgTime ? formatConversationTime(lastMsgTime) : '',
        unread: c.unreadCount || 0,
        online: true,
        isGroup: c.type === 'group' || c.type === 'channel',
      };
    });
  }, [apiConversations]);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

  // Auto-select first conversation or main chat
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Track selected conversation in a ref for the WebSocket handler
  const selectedConvRef = useRef<string | null>(null);
  useEffect(() => {
    selectedConvRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!currentUser?.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws?.send(JSON.stringify({
            type: 'auth',
            userId: currentUser.id,
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'new_message') {
              // Refresh messages for the affected conversation
              if (data.message?.conversationId) {
                queryClient.invalidateQueries({ queryKey: ['team-messages', data.message.conversationId] });
              }
              // Refresh conversation list to update last message preview
              queryClient.invalidateQueries({ queryKey: ['team-conversations'] });
            }

            if (data.type === 'typing' && data.conversationId === selectedConvRef.current) {
              setIsTyping(data.isTyping);
              if (data.isTyping) {
                setTimeout(() => setIsTyping(false), 5000);
              }
            }
          } catch (e) {
            console.error('WebSocket message parse error:', e);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (e) {
        console.error('WebSocket connection error:', e);
      }
    };

    connect();

    return () => {
      ws?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [currentUser?.id, queryClient]);

  const [newMessage, setNewMessage] = useState('');

  // Fetch messages for current conversation from API
  const { data: apiMessages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["team-messages", selectedConversationId],
    queryFn: () => selectedConversationId ? fetchMessages(selectedConversationId) : Promise.resolve([]),
    enabled: !!selectedConversationId,
    refetchInterval: 5000,
  });

  const messages: Message[] = useMemo(() => {
    return apiMessages.map((m: any) => ({
      id: m.id,
      sender: m.senderName || 'Unknown',
      senderInitials: (m.senderName || '??').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
      content: m.content,
      timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      isOwn: m.senderId === currentUser?.id,
      reactions: [],
      attachments: [],
    }));
  }, [apiMessages, currentUser?.id]);

  // Fetch available users for new conversation dialog
  const { data: availableUsers = [] } = useQuery({
    queryKey: ["chat-users"],
    queryFn: fetchChatUsers,
    staleTime: 60000, // cache for 1 minute
  });
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [newConversationSearch, setNewConversationSearch] = useState('');
  const [mutedConversations, setMutedConversations] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [showTapback, setShowTapback] = useState<string | null>(null);
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Smileys');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [skinToneEmoji, setSkinToneEmoji] = useState<string | null>(null);
  const [selectedSkinTone, setSelectedSkinTone] = useState<number>(0);

  // Check if current conversation is muted
  const isMuted = selectedConversation ? mutedConversations.has(selectedConversation.id) : false;

  const filteredMessages = useMemo(() =>
    messageSearchQuery
      ? messages.filter(m => m.content.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
          m.sender.toLowerCase().includes(messageSearchQuery.toLowerCase()))
      : messages,
    [messages, messageSearchQuery]
  );

  useEffect(() => {
    const lastWord = newMessage.split(' ').pop() || '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  }, [newMessage]);

  const parseMessageContent = useCallback((content: string) => {
    const parts = content.split(MENTION_REGEX);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <span key={i} className="bg-primary/10 text-primary px-1 rounded font-medium">@{part}</span>;
      }
      return part;
    });
  }, []);

  const handleSelectMention = useCallback((userName: string) => {
    const words = newMessage.split(' ');
    words[words.length - 1] = `@${userName} `;
    setNewMessage(words.join(' '));
    setShowMentions(false);
  }, [newMessage]);

  const handlePhoneCall = useCallback(() => {
    if (!selectedConversation) return;
    toast.success(`Starting voice call with ${selectedConversation.name}...`);
  }, [selectedConversation]);

  const handleVideoCall = useCallback(() => {
    if (!selectedConversation) return;
    toast.success(`Starting video call with ${selectedConversation.name}...`);
  }, [selectedConversation]);

  const handleNewMessage = useCallback(() => {
    setShowNewMessageDialog(true);
    queryClient.invalidateQueries({ queryKey: ["chat-users"] });
    queryClient.refetchQueries({ queryKey: ["chat-users"] });
  }, [queryClient]);

  const handleStartConversation = useCallback(async (user: any) => {
    // user can be an object from API with id and name, or a string name
    const userName = typeof user === 'string' ? user : (user.name || user.fullName || 'Unknown');
    const userId = typeof user === 'string' ? null : user.id;

    // Check if conversation already exists in current conversations
    const existing = conversations.find(c => c.name === userName);
    if (existing) {
      setSelectedConversationId(existing.id);
      toast.info(`Opening conversation with ${userName}`);
    } else if (userId) {
      try {
        const newConv = await createConversation([userId]);
        queryClient.invalidateQueries({ queryKey: ["team-conversations"] });
        setSelectedConversationId(newConv.id);
        toast.success(`Started new conversation with ${userName}`);
      } catch {
        toast.error("Failed to create conversation");
      }
    }
    setShowNewMessageDialog(false);
    setNewConversationSearch('');
  }, [conversations, queryClient]);

  const handleToggleMute = useCallback(() => {
    if (!selectedConversation) return;
    setMutedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(selectedConversation.id)) {
        newSet.delete(selectedConversation.id);
        toast.success(`Unmuted ${selectedConversation.name}`);
      } else {
        newSet.add(selectedConversation.id);
        toast.success(`Muted ${selectedConversation.name}`);
      }
      return newSet;
    });
  }, [selectedConversation]);

  const handleDeleteConversation = useCallback(() => {
    if (!selectedConversation) return;
    toast.success(`Conversation with ${selectedConversation.name} deleted`);
    // Remove from muted if it was muted
    setMutedConversations(prev => {
      const newSet = new Set(prev);
      newSet.delete(selectedConversation.id);
      return newSet;
    });
    // Select next conversation
    const remaining = conversations.filter(c => c.id !== selectedConversation.id);
    setSelectedConversationId(remaining.length > 0 ? remaining[0].id : null);
    queryClient.invalidateQueries({ queryKey: ["team-conversations"] });
    setShowInfoPanel(false);
  }, [selectedConversation, conversations, queryClient]);

  const handleAttachment = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const attachment: Attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`,
      };
      setPendingAttachments(prev => [...prev, attachment]);
      toast.success(`File "${file.name}" attached`);
    }
    e.target.value = '';
  }, []);

  const removePendingAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== attachmentId));
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    setEmojiCategory('Smileys');
    setEmojiSearch('');
    setSkinToneEmoji(null);
  }, []);

  const handleAddReaction = useCallback((messageId: string, emoji: string) => {
    // Reactions are UI-only for now (no backend persistence)
    // Could be extended to POST /api/chat/conversations/:id/messages/:mid/reactions
    setShowTapback(null);
    toast.success(`Reacted with ${emoji}`);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset state when conversation changes
  useEffect(() => {
    if (!selectedConversationId) return;
    setReplyingTo(null);
    setNewMessage('');
    setShowMessageSearch(false);
    setMessageSearchQuery('');
    setShowEmojiPicker(false);
    setPendingAttachments([]);
    setIsTyping(false);
    setShowTapback(null);
    // Scroll to bottom after a brief delay to ensure messages render
    setTimeout(scrollToBottom, 100);
  }, [selectedConversationId]);

  // Close tapback menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showTapback) setShowTapback(null);
    };
    if (showTapback) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showTapback]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    const content = newMessage.trim();
    setNewMessage('');
    setReplyingTo(null);
    setPendingAttachments([]);

    try {
      await sendChatMessage(selectedConversationId, content);
      queryClient.invalidateQueries({ queryKey: ["team-messages", selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ["team-conversations"] });
    } catch {
      toast.error("Failed to send message");
    }
  }, [newMessage, selectedConversationId, queryClient]);

  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // iMessage-style conversation list
  const ConversationList = () => (
    <div className="px-2">
      {conversations.map((conv) => {
        const isSelected = selectedConversation?.id === conv.id;
        return (
          <button
            key={conv.id}
            onClick={() => {
              setSelectedConversationId(conv.id);
              setMobileSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-2 py-2.5 text-left transition-all mb-0.5",
              isSelected
                ? theme.selectedGradient
                : "hover:bg-gray-100"
            )}
            style={{ borderRadius: RADIUS.input }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-11 h-11">
                <AvatarFallback className={cn(
                  "text-sm font-semibold",
                  isSelected
                    ? "bg-white/20 text-white"
                    : conv.isGroup
                      ? theme.avatarOnline
                      : theme.avatarOffline
                )}>
                  {conv.initials}
                </AvatarFallback>
              </Avatar>
              {conv.online && !conv.isGroup && (
                <div className={cn(
                  "w-2.5 h-2.5 absolute bottom-0 right-0 rounded-full border-2",
                  isSelected ? cn("bg-emerald-400", theme.onlineDotBorder) : "bg-emerald-500 border-white"
                )} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1 mb-0.5">
                <span className={cn(
                  "font-semibold text-sm truncate flex-1",
                  isSelected ? "text-white" : "text-gray-900"
                )}>
                  {conv.name}
                </span>
                <span className={cn(
                  "text-[11px] flex-shrink-0",
                  isSelected ? "text-white/70" : "text-gray-400"
                )}>
                  {conv.timestamp}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <p className={cn(
                  "text-xs truncate flex-1",
                  isSelected ? "text-white/80" : "text-gray-500"
                )}>
                  {conv.lastMessage}
                </p>
                {conv.unread > 0 && (
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0",
                    isSelected ? "bg-white/30 text-white" : theme.unreadBadge
                  )}>
                    {conv.unread}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <motion.div
      variants={fadeInUp}
      className="flex gap-0 bg-white relative overflow-hidden"
      style={{
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        height: 'calc(100vh - 16rem)',
      }}
    >
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-gray-50/95 backdrop-blur-sm z-50 flex flex-col lg:hidden"
              style={{ boxShadow: SHADOW.level4 }}
            >
              <div className="p-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 pl-2">Messages</h2>
                <div className="flex items-center gap-2">
                  <button
                    className={cn("w-8 h-8 flex items-center justify-center rounded-full transition-colors", theme.bg100, theme.hoverBg200)}
                    onClick={handleNewMessage}
                  >
                    <PenSquare className={cn("w-4 h-4", theme.activeIcon)} />
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="px-3 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-200/60 rounded-xl outline-none focus:bg-white transition-all placeholder-gray-500"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <ConversationList />
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Message Dialog */}
      <AnimatePresence>
        {showNewMessageDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowNewMessageDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-50 overflow-hidden"
              style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level4 }}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">New Message</h3>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setShowNewMessageDialog(false)}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search people..."
                    value={newConversationSearch}
                    onChange={(e) => setNewConversationSearch(e.target.value)}
                    className={cn("w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 transition-all", theme.focusRing200)}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mb-2 px-1">Suggested</p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {availableUsers.filter((user: any) => {
                    const name = user.name || user.fullName || '';
                    return name.toLowerCase().includes(newConversationSearch.toLowerCase());
                  }).map((user: any) => {
                    const name = user.name || user.fullName || 'Unknown';
                    const initials = name.split(' ').map((n: string) => n[0]).join('');
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleStartConversation(user)}
                        className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left", theme.hoverBg50)}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className={cn(theme.avatarOffline, "font-semibold")}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{name}</p>
                          <p className="text-xs text-gray-500">{user.role || 'Team Member'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - iMessage style */}
      <div
        className="hidden lg:flex lg:w-72 flex-col bg-gray-50/50 border-r"
        style={{ borderTopLeftRadius: RADIUS.card, borderBottomLeftRadius: RADIUS.card }}
      >
        <div className="p-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 pl-2">Messages</h2>
          <button
            className={cn("w-8 h-8 flex items-center justify-center rounded-full transition-colors", theme.bg100, theme.hoverBg200)}
            onClick={handleNewMessage}
          >
            <PenSquare className={cn("w-4 h-4", theme.activeIcon)} />
          </button>
        </div>
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("w-full pl-9 pr-3 py-2 text-sm bg-gray-200/60 rounded-xl outline-none focus:bg-white focus:ring-2 transition-all placeholder-gray-500", theme.focusRing100)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <ConversationList />
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
      <div
        className={cn("flex-1 flex flex-col transition-all", showInfoPanel && "lg:mr-80")}
        style={{ borderTopRightRadius: showInfoPanel ? 0 : RADIUS.card, borderBottomRightRadius: showInfoPanel ? 0 : RADIUS.card }}
      >
        {/* Chat Header - iMessage style */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <ChevronLeft className={cn("w-5 h-5", theme.accent500)} />
            </button>
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarFallback className={cn(
                  "text-sm font-semibold",
                  selectedConversation.isGroup
                    ? theme.avatarOnline
                    : theme.avatarOffline
                )}>
                  {selectedConversation.initials}
                </AvatarFallback>
              </Avatar>
              {selectedConversation.online && !selectedConversation.isGroup && (
                <div className="w-3 h-3 absolute bottom-0 right-0 rounded-full bg-emerald-500 border-2 border-white" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {selectedConversation.name}
              </h2>
              <p className="text-xs text-gray-500">
                {selectedConversation.online ? 'Active now' : selectedConversation.isGroup ? 'Group' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              onClick={handlePhoneCall}
            >
              <Phone className={cn("w-5 h-5", theme.accent500)} />
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              onClick={handleVideoCall}
            >
              <Video className={cn("w-5 h-5", theme.accent500)} />
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => setShowInfoPanel(!showInfoPanel)}
            >
              <Info className={cn("w-5 h-5", theme.accent500)} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {showMessageSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-2 border-b overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={messageSearchQuery}
                  onChange={(e) => setMessageSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
                {messageSearchQuery && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    {filteredMessages.length} results
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-2 bg-gradient-to-b from-gray-50/30 to-white">
          {/* Empty state for new conversations */}
          {filteredMessages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarFallback className={cn(
                  "text-2xl font-semibold",
                  selectedConversation.isGroup
                    ? theme.avatarOnline
                    : theme.avatarOffline
                )}>
                  {selectedConversation.initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedConversation.name}</h3>
              <p className="text-sm text-gray-500">
                {selectedConversation.isGroup ? 'Start chatting with the group' : 'iMessage'}
              </p>
            </div>
          )}

          {/* Date separator at top */}
          {filteredMessages.length > 0 && <DateSeparator date="Today" />}

          <div className="space-y-0.5">
            {filteredMessages.map((message, idx) => {
              const prevMessage = filteredMessages[idx - 1];
              const nextMessage = filteredMessages[idx + 1];
              const isFirstInGroup = !prevMessage || prevMessage.sender !== message.sender;
              const isLastInGroup = !nextMessage || nextMessage.sender !== message.sender;
              const showTapbackMenu = showTapback === message.id;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: idx * 0.02
                  }}
                  className={cn(
                    "group flex gap-2 relative",
                    message.isOwn ? "justify-end" : "justify-start",
                    isLastInGroup && "mb-2"
                  )}
                >
                  {/* Avatar - only show for last message in group from others */}
                  {!message.isOwn && (
                    <div className="w-7 flex-shrink-0 self-end">
                      {isLastInGroup && (
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className={cn(theme.avatarOffline, "text-[10px] font-semibold")}>
                            {message.senderInitials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}

                  <div className={cn("max-w-[70%] flex flex-col relative", message.isOwn ? "items-end" : "items-start")}>
                    {/* Sender name - only for first in group in group chats */}
                    {!message.isOwn && isFirstInGroup && selectedConversation.isGroup && (
                      <span className="text-[11px] font-medium text-gray-500 ml-1 mb-0.5">{message.sender}</span>
                    )}

                    {/* Reply indicator */}
                    {message.replyTo && (
                      <div className={cn(
                        "flex items-center gap-1 mb-1 text-[11px] text-gray-400",
                        message.isOwn ? "mr-1" : "ml-1"
                      )}>
                        <Reply className="w-3 h-3" />
                        <span>Replying to {message.replyTo.sender}</span>
                      </div>
                    )}

                    {/* Tapback reactions - Apple style positioned on bubble top-right */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="absolute -top-2.5 -right-1 z-10">
                        <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200/80 px-1 py-0.5">
                          {message.reactions.map((reaction, ridx) => (
                            <button
                              key={ridx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddReaction(message.id, reaction.emoji);
                              }}
                              className="text-base hover:scale-110 transition-transform"
                            >
                              {reaction.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message bubble - iMessage style with tail */}
                    <div
                      className={cn(
                        "relative px-3 py-2 inline-block text-left cursor-pointer select-none",
                        message.isOwn
                          ? theme.selectedMsgGradient
                          : "bg-[#e9e9eb] text-gray-900"
                      )}
                      style={{
                        borderRadius: message.isOwn
                          ? isLastInGroup
                            ? '18px 18px 4px 18px'
                            : isFirstInGroup
                              ? '18px 18px 18px 18px'
                              : '18px 18px 18px 18px'
                          : isLastInGroup
                            ? '18px 18px 18px 4px'
                            : isFirstInGroup
                              ? '18px 18px 18px 18px'
                              : '18px 18px 18px 18px',
                      }}
                      onDoubleClick={() => setShowTapback(showTapbackMenu ? null : message.id)}
                    >
                      {message.replyTo && (
                        <div className={cn(
                          "text-[11px] mb-1.5 pb-1.5 border-b",
                          message.isOwn ? "border-white/20 text-white/70" : "border-gray-300 text-gray-500"
                        )}>
                          <p className="truncate max-w-[200px]">{message.replyTo.content}</p>
                        </div>
                      )}
                      <p className="text-[15px] leading-snug">{parseMessageContent(message.content)}</p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map(att => (
                            <div key={att.id} className={cn(
                              "flex items-center gap-2 p-2 rounded-lg",
                              message.isOwn ? "bg-white/10" : "bg-gray-300/50"
                            )}>
                              {att.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <File className="w-4 h-4" />}
                              <span className="text-xs">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tapback menu - Apple style */}
                    <AnimatePresence>
                      {showTapbackMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                          className={cn(
                            "absolute z-20 bg-white/95 backdrop-blur-xl rounded-full shadow-xl border border-gray-200/50 px-2 py-1.5 flex items-center gap-1",
                            message.isOwn ? "right-0 -top-12" : "left-0 -top-12"
                          )}
                        >
                          {TAPBACK_REACTIONS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => {
                                handleAddReaction(message.id, emoji);
                                setShowTapback(null);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 hover:bg-gray-100 rounded-full transition-all"
                            >
                              {emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Timestamp & delivery status - only for last in group */}
                    {isLastInGroup && (
                      <div className={cn(
                        "flex items-center gap-1 mt-0.5 px-1",
                        message.isOwn ? "justify-end" : "justify-start"
                      )}>
                        <span className="text-[10px] text-gray-400">{message.timestamp}</span>
                        {message.isOwn && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            · Delivered
                          </span>
                        )}
                      </div>
                    )}

                    {/* Hover actions - more subtle */}
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all",
                      message.isOwn ? "-left-20" : "-right-20"
                    )}>
                      <button
                        onClick={() => handleReply(message)}
                        className="p-1.5 bg-white/90 backdrop-blur border border-gray-200 shadow-sm hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <Reply className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button
                        onClick={() => setShowTapback(showTapbackMenu ? null : message.id)}
                        className="p-1.5 bg-white/90 backdrop-blur border border-gray-200 shadow-sm hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <Smile className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2 items-end"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className={cn(theme.avatarOffline, "text-[10px] font-semibold")}>
                      {selectedConversation.initials}
                    </AvatarFallback>
                  </Avatar>
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input - iMessage style */}
        <div className="p-2 bg-gray-100/80 backdrop-blur-sm border-t border-gray-200/50 relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />

          {/* Emoji Picker - Full emoji keyboard (rendered in portal to escape stacking contexts) */}
          {typeof document !== 'undefined' && createPortal(
            <AnimatePresence>
              {showEmojiPicker && (
                <>
                  {/* Backdrop to block ALL interactions behind */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30"
                    style={{ zIndex: 99999 }}
                    onClick={() => {
                      setShowEmojiPicker(false);
                      setSkinToneEmoji(null);
                      setEmojiSearch('');
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-2xl bg-white border border-gray-200 overflow-hidden"
                    style={{ zIndex: 100000, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Skin tone selector popup */}
                    <AnimatePresence>
                      {skinToneEmoji && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute top-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 flex gap-1"
                          style={{ zIndex: 100001 }}
                        >
                          {SKIN_TONES.map((tone, idx) => {
                            const emojiWithTone = idx === 0 ? skinToneEmoji : skinToneEmoji + tone;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedSkinTone(idx);
                                  handleEmojiSelect(emojiWithTone);
                                  setSkinToneEmoji(null);
                                }}
                                className={cn(
                                  "text-2xl p-2 rounded-xl hover:bg-gray-100 transition-all hover:scale-110",
                                  selectedSkinTone === idx && theme.bg100
                                )}
                                title={SKIN_TONE_LABELS[idx]}
                              >
                                {emojiWithTone}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Search bar */}
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search emojis..."
                          value={emojiSearch}
                          onChange={(e) => setEmojiSearch(e.target.value)}
                          className={cn("w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 rounded-lg outline-none focus:ring-2", theme.focusRing200)}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Category tabs - hide when searching */}
                    {!emojiSearch && (
                      <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto">
                        {Object.keys(EMOJI_CATEGORIES).map((category) => (
                          <button
                            key={category}
                            onClick={() => setEmojiCategory(category as keyof typeof EMOJI_CATEGORIES)}
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                              emojiCategory === category
                                ? cn(theme.accentBg, "text-white")
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Skin tone selector bar */}
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 bg-gray-50">
                      <span className="text-[11px] text-gray-500">Skin tone:</span>
                      <div className="flex gap-0.5">
                        {SKIN_TONES.map((tone, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedSkinTone(idx)}
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all",
                              selectedSkinTone === idx
                                ? cn("ring-2 ring-offset-1", theme.ring500)
                                : "hover:bg-gray-200"
                            )}
                            title={SKIN_TONE_LABELS[idx]}
                          >
                            {idx === 0 ? '👋' : '👋' + tone}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Emoji grid */}
                    <div className="h-72 overflow-y-auto p-2 bg-white">
                      <div className="grid grid-cols-10 gap-1">
                        {(emojiSearch
                          ? Object.values(EMOJI_CATEGORIES).flat().filter(emoji =>
                              EMOJI_SEARCH_TERMS[emoji]?.toLowerCase().includes(emojiSearch.toLowerCase())
                            )
                          : EMOJI_CATEGORIES[emojiCategory]
                        ).map((emoji) => {
                          const supportsSkinTone = SKIN_TONE_EMOJIS.has(emoji);
                          const displayEmoji = supportsSkinTone && selectedSkinTone > 0
                            ? emoji + SKIN_TONES[selectedSkinTone]
                            : emoji;
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleEmojiSelect(displayEmoji)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                if (supportsSkinTone) {
                                  setSkinToneEmoji(emoji);
                                }
                              }}
                              className="text-2xl hover:bg-gray-100 rounded-lg p-1.5 transition-all hover:scale-110 flex items-center justify-center"
                            >
                              {displayEmoji}
                            </button>
                          );
                        })}
                        {emojiSearch && Object.values(EMOJI_CATEGORIES).flat().filter(emoji =>
                          EMOJI_SEARCH_TERMS[emoji]?.toLowerCase().includes(emojiSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="col-span-10 text-center py-8 text-gray-400 text-sm">
                            No emojis found
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.body
          )}

          {/* Reply indicator - iMessage style */}
          {replyingTo && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-200/60 backdrop-blur mb-2 rounded-2xl">
              <div className={cn("w-1 h-8 rounded-full", theme.accentBg)} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-500 font-medium">Replying to {replyingTo.sender}</p>
                <p className="text-[13px] text-gray-700 truncate">{replyingTo.content}</p>
              </div>
              <button
                onClick={cancelReply}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}

          {/* Pending attachments - iMessage style */}
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {pendingAttachments.map(att => (
                <div key={att.id} className="flex items-center gap-2 bg-gray-200/80 backdrop-blur rounded-xl px-3 py-2">
                  {att.type === 'image' ? <ImageIcon className="w-4 h-4 text-gray-600" /> : <File className="w-4 h-4 text-gray-600" />}
                  <span className="text-[13px] text-gray-700">{att.name}</span>
                  <button onClick={() => removePendingAttachment(att.id)} className="hover:text-red-500 transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Mentions dropdown */}
          <AnimatePresence>
            {showMentions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-16 left-4 bg-white border border-gray-200 p-2 z-50 max-h-40 overflow-y-auto"
                style={{ borderRadius: 16, boxShadow: SHADOW.level3 }}
              >
                <p className="text-xs text-gray-500 px-2 mb-1">Mention someone</p>
                {availableUsers.filter((u: any) => {
                  const name = u.name || u.fullName || '';
                  return name.toLowerCase().includes((newMessage.split(' ').pop() || '').slice(1).toLowerCase());
                }).map((user: any) => {
                  const name = user.name || user.fullName || 'Unknown';
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelectMention(name)}
                      className={cn("flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm", theme.hoverBg50)}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className={cn("text-[10px]", theme.bg100, theme.activeIcon)}>
                          {name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {name}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input row - iMessage style */}
          <div className="flex items-end gap-2">
            {/* Apps/Plus button */}
            <button
              onClick={handleAttachment}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors mb-0.5"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>

            {/* Message input container */}
            <div className="flex-1 relative flex items-end bg-white rounded-[20px] border border-gray-300/50 shadow-sm overflow-hidden">
              <input
                type="text"
                placeholder="iMessage"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-transparent border-none outline-none text-[15px] py-2 px-3 placeholder-gray-400"
              />

              {/* Right side icons */}
              <div className="flex items-center gap-0.5 pr-1 pb-1">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Smile className="w-5 h-5 text-gray-400" />
                </button>

                {/* Send button - only show when there's content */}
                {(newMessage.trim() || pendingAttachments.length > 0) && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={handleSendMessage}
                    className={cn("w-7 h-7 flex items-center justify-center rounded-full shadow-sm", theme.selectedMsgGradient)}
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-semibold text-gray-400">Select a conversation</h3>
        <p className="text-sm text-gray-400 mt-1">Choose a conversation or start a new one</p>
      </div>
      )}

      {/* Info Panel - slides in from right */}
      <AnimatePresence>
        {showInfoPanel && selectedConversation && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="hidden lg:flex absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 flex-col"
            style={{ borderTopRightRadius: RADIUS.card, borderBottomRightRadius: RADIUS.card }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-gray-900">Details</h3>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setShowInfoPanel(false)}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              {/* Profile Section */}
              <div className="p-6 flex flex-col items-center border-b border-gray-100">
                <Avatar className="w-20 h-20 mb-3">
                  <AvatarFallback className={cn(
                    "text-2xl font-semibold",
                    selectedConversation.isGroup
                      ? theme.avatarOnline
                      : theme.avatarOffline
                  )}>
                    {selectedConversation.initials}
                  </AvatarFallback>
                </Avatar>
                <h4 className="text-lg font-semibold text-gray-900">{selectedConversation.name}</h4>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedConversation.online ? 'Active now' : selectedConversation.isGroup ? 'Group Chat' : 'Offline'}
                </p>

                {/* Quick Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={handlePhoneCall}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", theme.bg100, theme.hoverBg200)}>
                      <Phone className={cn("w-5 h-5", theme.activeIcon)} />
                    </div>
                    <span className="text-xs text-gray-500">Call</span>
                  </button>
                  <button
                    onClick={handleVideoCall}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", theme.bg100, theme.hoverBg200)}>
                      <Video className={cn("w-5 h-5", theme.activeIcon)} />
                    </div>
                    <span className="text-xs text-gray-500">Video</span>
                  </button>
                  <button
                    onClick={handleToggleMute}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", theme.bg100, theme.hoverBg200)}>
                      {isMuted ? <BellOff className={cn("w-5 h-5", theme.activeIcon)} /> : <Bell className={cn("w-5 h-5", theme.activeIcon)} />}
                    </div>
                    <span className="text-xs text-gray-500">{isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="p-4">
                <div className="space-y-1">
                  {selectedConversation.isGroup && (
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors text-left">
                      <UserPlus className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">Add People</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMessageSearch(true);
                      setShowInfoPanel(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors text-left"
                  >
                    <Search className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Search in Conversation</span>
                  </button>
                  <button
                    onClick={handleToggleMute}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors text-left"
                  >
                    {isMuted ? <Bell className="w-5 h-5 text-gray-400" /> : <BellOff className="w-5 h-5 text-gray-400" />}
                    <span className="text-sm text-gray-700">{isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors text-left">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Chat Settings</span>
                  </button>
                </div>

                {/* Shared Media Preview */}
                <div className="mt-6">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">Shared Media</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                      <div
                        key={i}
                        className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center"
                      >
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shared Files */}
                <div className="mt-6">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">Shared Files</h5>
                  <div className="space-y-2">
                    {['Policy_Quote.pdf', 'Client_Notes.docx', 'Rates_2024.xlsx'].map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", theme.bg100)}>
                          <File className={cn("w-4 h-4", theme.activeIcon)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate">{file}</p>
                          <p className="text-xs text-gray-400">Shared 2 days ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Delete Button */}
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={handleDeleteConversation}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-red-50 rounded-xl transition-colors text-red-500"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-sm font-medium">Delete Conversation</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
