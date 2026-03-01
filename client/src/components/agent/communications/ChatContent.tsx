/**
 * ChatContent - Team Chat functionality extracted for Communications hub
 * Provides full chat capabilities within a tab interface
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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

const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: 'conv-1', name: 'Sarah Mitchell', initials: 'SM', lastMessage: 'Did you see the new IUL rates?', timestamp: '2:30 PM', unread: 2, online: true },
  { id: 'conv-2', name: 'Jack Cook', initials: 'JC', lastMessage: 'Great job this week!', timestamp: '1:15 PM', unread: 0, online: true },
  { id: 'conv-3', name: 'Sales Team', initials: 'ST', lastMessage: 'Marcus: Thanks everyone!', timestamp: '12:45 PM', unread: 0, online: false, isGroup: true },
  { id: 'conv-4', name: 'Marcus Chen', initials: 'MC', lastMessage: 'Thanks for the tip!', timestamp: '11:30 AM', unread: 0, online: false },
  { id: 'conv-5', name: 'Training Group', initials: 'TG', lastMessage: 'New module available', timestamp: 'Yesterday', unread: 1, online: false, isGroup: true },
  { id: 'conv-6', name: 'Emily Davis', initials: 'ED', lastMessage: 'Can we sync tomorrow?', timestamp: 'Yesterday', unread: 0, online: true },
];

const AVAILABLE_USERS: readonly string[] = ['Jack Cook', 'Sarah Mitchell', 'Marcus Chen', 'Emily Davis', 'James Wilson', 'Lisa Anderson'] as const;

// Messages for each conversation
const CONVERSATION_MESSAGES: Record<string, Message[]> = {
  'conv-1': [ // Sarah Mitchell
    {
      id: '1',
      sender: 'Sarah Mitchell',
      senderInitials: 'SM',
      content: 'Hey! Have you had a chance to look at those new IUL rates from Prudential?',
      timestamp: '2:15 PM',
      isOwn: false,
    },
    {
      id: '2',
      sender: 'You',
      senderInitials: 'AJ',
      content: 'Not yet! Are they competitive?',
      timestamp: '2:20 PM',
      isOwn: true,
    },
    {
      id: '3',
      sender: 'Sarah Mitchell',
      senderInitials: 'SM',
      content: 'Very competitive! The cap rates went up 0.5% across the board. Great for clients looking for growth potential.',
      timestamp: '2:22 PM',
      isOwn: false,
      reactions: [{ emoji: '👍', count: 1 }]
    },
    {
      id: '4',
      sender: 'Sarah Mitchell',
      senderInitials: 'SM',
      content: 'Did you see the new IUL rates?',
      timestamp: '2:30 PM',
      isOwn: false,
    },
  ],
  'conv-2': [ // Jack Cook
    {
      id: '1',
      sender: 'Jack Cook',
      senderInitials: 'JC',
      content: 'Just wanted to say great job on the Henderson case!',
      timestamp: '12:45 PM',
      isOwn: false,
      reactions: [{ emoji: '🎉', count: 2 }]
    },
    {
      id: '2',
      sender: 'You',
      senderInitials: 'AJ',
      content: 'Thanks Jack! It was a team effort - Sarah helped with the underwriting questions.',
      timestamp: '12:50 PM',
      isOwn: true,
    },
    {
      id: '3',
      sender: 'Jack Cook',
      senderInitials: 'JC',
      content: 'That\'s what I like to see! Collaboration is key. Keep up the momentum!',
      timestamp: '1:00 PM',
      isOwn: false,
    },
    {
      id: '4',
      sender: 'Jack Cook',
      senderInitials: 'JC',
      content: 'Great job this week!',
      timestamp: '1:15 PM',
      isOwn: false,
      reactions: [{ emoji: '💪', count: 1 }]
    },
  ],
  'conv-3': [ // Sales Team (Group)
    {
      id: '1',
      sender: 'Jack Cook',
      senderInitials: 'JC',
      content: 'Team update: We hit 115% of our Q4 target! 🎉',
      timestamp: '12:00 PM',
      isOwn: false,
      reactions: [{ emoji: '🎉', count: 8 }, { emoji: '💪', count: 5 }]
    },
    {
      id: '2',
      sender: 'Sarah Mitchell',
      senderInitials: 'SM',
      content: 'Amazing work everyone! Special shoutout to the new agents who really stepped up.',
      timestamp: '12:10 PM',
      isOwn: false,
      reactions: [{ emoji: '👏', count: 4 }]
    },
    {
      id: '3',
      sender: 'Emily Davis',
      senderInitials: 'ED',
      content: 'Couldn\'t have done it without the training sessions. Those objection handling workshops were 🔥',
      timestamp: '12:20 PM',
      isOwn: false,
    },
    {
      id: '4',
      sender: 'You',
      senderInitials: 'AJ',
      content: 'Proud to be part of this team! What\'s the focus for Q1?',
      timestamp: '12:30 PM',
      isOwn: true,
    },
    {
      id: '5',
      sender: 'Marcus Chen',
      senderInitials: 'MC',
      content: 'Thanks everyone!',
      timestamp: '12:45 PM',
      isOwn: false,
    },
  ],
  'conv-4': [ // Marcus Chen
    {
      id: '1',
      sender: 'You',
      senderInitials: 'AJ',
      content: 'Hey Marcus, quick tip on the Thompson lead - they mentioned they\'re looking to retire in 5 years.',
      timestamp: '11:00 AM',
      isOwn: true,
    },
    {
      id: '2',
      sender: 'Marcus Chen',
      senderInitials: 'MC',
      content: 'Oh that\'s great intel! I\'ll pivot my pitch to focus on retirement income strategies.',
      timestamp: '11:15 AM',
      isOwn: false,
    },
    {
      id: '3',
      sender: 'Marcus Chen',
      senderInitials: 'MC',
      content: 'Thanks for the tip!',
      timestamp: '11:30 AM',
      isOwn: false,
      reactions: [{ emoji: '🙏', count: 1 }]
    },
  ],
  'conv-5': [ // Training Group
    {
      id: '1',
      sender: 'System',
      senderInitials: 'SY',
      content: '📚 New training module available: "Advanced Objection Handling"',
      timestamp: 'Yesterday',
      isOwn: false,
    },
    {
      id: '2',
      sender: 'Jack Cook',
      senderInitials: 'JC',
      content: 'Everyone please complete this by Friday. The techniques in this module are game-changers.',
      timestamp: 'Yesterday',
      isOwn: false,
    },
    {
      id: '3',
      sender: 'Emily Davis',
      senderInitials: 'ED',
      content: 'Just finished it - the "feel, felt, found" technique is gold!',
      timestamp: 'Yesterday',
      isOwn: false,
      reactions: [{ emoji: '💯', count: 3 }]
    },
    {
      id: '4',
      sender: 'System',
      senderInitials: 'SY',
      content: 'New module available',
      timestamp: 'Yesterday',
      isOwn: false,
    },
  ],
  'conv-6': [ // Emily Davis
    {
      id: '1',
      sender: 'Emily Davis',
      senderInitials: 'ED',
      content: 'Hey! Do you have time for a quick sync tomorrow? I want to pick your brain about handling medical underwriting questions.',
      timestamp: 'Yesterday',
      isOwn: false,
    },
    {
      id: '2',
      sender: 'You',
      senderInitials: 'AJ',
      content: 'Sure! How about 2pm? I\'ve got some good resources to share.',
      timestamp: 'Yesterday',
      isOwn: true,
    },
    {
      id: '3',
      sender: 'Emily Davis',
      senderInitials: 'ED',
      content: 'Perfect! I\'ll send a calendar invite. Thanks!',
      timestamp: 'Yesterday',
      isOwn: false,
    },
    {
      id: '4',
      sender: 'Emily Davis',
      senderInitials: 'ED',
      content: 'Can we sync tomorrow?',
      timestamp: 'Yesterday',
      isOwn: false,
    },
  ],
};

export default function AgentChatContent() {
  const { currentUser } = useAgentStore();

  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(INITIAL_CONVERSATIONS[0]);
  const [conversationMessages, setConversationMessages] = useState<Record<string, Message[]>>(CONVERSATION_MESSAGES);
  const [newMessage, setNewMessage] = useState('');

  // Get messages for current conversation
  const messages = conversationMessages[selectedConversation.id] || [];
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
  const isMuted = mutedConversations.has(selectedConversation.id);

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
    toast.success(`Starting voice call with ${selectedConversation.name}...`);
  }, [selectedConversation]);

  const handleVideoCall = useCallback(() => {
    toast.success(`Starting video call with ${selectedConversation.name}...`);
  }, [selectedConversation]);

  const handleNewMessage = useCallback(() => {
    setShowNewMessageDialog(true);
  }, []);

  const handleStartConversation = useCallback((user: string) => {
    // Check if conversation already exists in current conversations
    const existing = conversations.find(c => c.name === user);
    if (existing) {
      setSelectedConversation(existing);
      toast.info(`Opening conversation with ${user}`);
    } else {
      // Create a new conversation
      const newConvId = `conv-new-${Date.now()}`;
      const newConv: Conversation = {
        id: newConvId,
        name: user,
        initials: user.split(' ').map(n => n[0]).join(''),
        lastMessage: '',
        timestamp: 'Now',
        unread: 0,
        online: Math.random() > 0.5,
      };
      // Add to conversations list at the top
      setConversations(prev => [newConv, ...prev]);
      // Initialize empty messages for new conversation
      setConversationMessages(prev => ({
        ...prev,
        [newConvId]: []
      }));
      setSelectedConversation(newConv);
      toast.success(`Started new conversation with ${user}`);
    }
    setShowNewMessageDialog(false);
    setNewConversationSearch('');
  }, [conversations]);

  const handleToggleMute = useCallback(() => {
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
    const convId = selectedConversation.id;
    toast.success(`Conversation with ${selectedConversation.name} deleted`);
    // Remove from conversations list
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== convId);
      // Select the first remaining conversation
      if (filtered.length > 0) {
        setSelectedConversation(filtered[0]);
      }
      return filtered;
    });
    // Remove messages for this conversation
    setConversationMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[convId];
      return newMessages;
    });
    // Remove from muted if it was muted
    setMutedConversations(prev => {
      const newSet = new Set(prev);
      newSet.delete(convId);
      return newSet;
    });
    setShowInfoPanel(false);
  }, [selectedConversation]);

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
    setConversationMessages(prev => ({
      ...prev,
      [selectedConversation.id]: (prev[selectedConversation.id] || []).map(msg => {
        if (msg.id !== messageId) return msg;
        const existingReactions = msg.reactions || [];
        const existingReaction = existingReactions.find(r => r.emoji === emoji);

        // If same emoji exists, remove it (toggle off)
        if (existingReaction) {
          return {
            ...msg,
            reactions: existingReactions.filter(r => r.emoji !== emoji)
          };
        }

        // Otherwise, replace any existing reaction with the new one (single reaction)
        return {
          ...msg,
          reactions: [{ emoji, count: 1 }]
        };
      })
    }));
    setShowTapback(null);
  }, [selectedConversation.id]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset state when conversation changes
  useEffect(() => {
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
  }, [selectedConversation.id]);

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

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() && pendingAttachments.length === 0) return;

    const mentions: string[] = [];
    let match;
    const regex = new RegExp(MENTION_REGEX.source, 'g');
    while ((match = regex.exec(newMessage)) !== null) {
      mentions.push(match[1]);
    }

    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      senderInitials: currentUser?.name?.split(' ').map(n => n[0]).join('') || 'AJ',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isOwn: true,
      replyTo: replyingTo ? { id: replyingTo.id, sender: replyingTo.sender, content: replyingTo.content } : undefined,
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
    };

    // Add message to the current conversation
    setConversationMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), message]
    }));
    setNewMessage('');
    setReplyingTo(null);
    setPendingAttachments([]);

    if (mentions.length > 0) {
      toast.info(`Mentioned: ${mentions.join(', ')}`);
    }

    // Simulate typing indicator and response (demo only)
    if (!selectedConversation.isGroup && selectedConversation.online) {
      setTimeout(() => setIsTyping(true), 1000);
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          "Got it, thanks!",
          "Sounds good 👍",
          "I'll look into that.",
          "Perfect, let me know if you need anything else.",
          "Thanks for letting me know!"
        ];
        const responseMsg: Message = {
          id: `resp-${Date.now()}`,
          sender: selectedConversation.name,
          senderInitials: selectedConversation.initials,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          isOwn: false,
        };
        setConversationMessages(prev => ({
          ...prev,
          [selectedConversation.id]: [...(prev[selectedConversation.id] || []), responseMsg]
        }));
      }, 2500);
    }
  }, [newMessage, pendingAttachments, currentUser, replyingTo, selectedConversation]);

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
        const isSelected = selectedConversation.id === conv.id;
        return (
          <button
            key={conv.id}
            onClick={() => {
              setSelectedConversation(conv);
              setMobileSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-2 py-2.5 text-left transition-all mb-0.5",
              isSelected
                ? "bg-gradient-to-b from-violet-500 via-purple-500 to-amber-400 text-white shadow-md"
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
                      ? "bg-gradient-to-br from-violet-400 to-purple-500 text-white"
                      : "bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600"
                )}>
                  {conv.initials}
                </AvatarFallback>
              </Avatar>
              {conv.online && !conv.isGroup && (
                <div className={cn(
                  "w-2.5 h-2.5 absolute bottom-0 right-0 rounded-full border-2",
                  isSelected ? "bg-emerald-400 border-purple-500" : "bg-emerald-500 border-white"
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
                    isSelected ? "bg-white/30 text-white" : "bg-violet-500 text-white"
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
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-100 hover:bg-violet-200 transition-colors"
                    onClick={handleNewMessage}
                  >
                    <PenSquare className="w-4 h-4 text-violet-600" />
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
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-violet-200 transition-all"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mb-2 px-1">Suggested</p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {AVAILABLE_USERS.filter(user =>
                    user.toLowerCase().includes(newConversationSearch.toLowerCase())
                  ).map(user => (
                    <button
                      key={user}
                      onClick={() => handleStartConversation(user)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-violet-50 rounded-xl transition-colors text-left"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 font-semibold">
                          {user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{user}</p>
                        <p className="text-xs text-gray-500">Team Member</p>
                      </div>
                    </button>
                  ))}
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
            className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-100 hover:bg-violet-200 transition-colors"
            onClick={handleNewMessage}
          >
            <PenSquare className="w-4 h-4 text-violet-600" />
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
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-200/60 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all placeholder-gray-500"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <ConversationList />
        </ScrollArea>
      </div>

      {/* Chat Area */}
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
              <ChevronLeft className="w-5 h-5 text-violet-500" />
            </button>
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarFallback className={cn(
                  "text-sm font-semibold",
                  selectedConversation.isGroup
                    ? "bg-gradient-to-br from-violet-400 to-purple-500 text-white"
                    : "bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600"
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
              <Phone className="w-5 h-5 text-violet-500" />
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              onClick={handleVideoCall}
            >
              <Video className="w-5 h-5 text-violet-500" />
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => setShowInfoPanel(!showInfoPanel)}
            >
              <Info className="w-5 h-5 text-violet-500" />
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
                    ? "bg-gradient-to-br from-violet-400 to-purple-500 text-white"
                    : "bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600"
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
                          <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 text-[10px] font-semibold">
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
                          ? "bg-gradient-to-br from-violet-500 via-purple-500 to-purple-600 text-white"
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
                    <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 text-[10px] font-semibold">
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
                                  selectedSkinTone === idx && "bg-violet-100"
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
                          className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-violet-200"
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
                                ? "bg-violet-500 text-white"
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
                                ? "ring-2 ring-violet-500 ring-offset-1"
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
              <div className="w-1 h-8 bg-violet-500 rounded-full" />
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
                {AVAILABLE_USERS.filter(u =>
                  u.toLowerCase().includes((newMessage.split(' ').pop() || '').slice(1).toLowerCase())
                ).map(user => (
                  <button
                    key={user}
                    onClick={() => handleSelectMention(user)}
                    className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-violet-50 rounded-lg text-sm"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[10px] bg-violet-100 text-violet-600">
                        {user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {user}
                  </button>
                ))}
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
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel - slides in from right */}
      <AnimatePresence>
        {showInfoPanel && (
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
                      ? "bg-gradient-to-br from-violet-400 to-purple-500 text-white"
                      : "bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600"
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
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center hover:bg-violet-200 transition-colors">
                      <Phone className="w-5 h-5 text-violet-600" />
                    </div>
                    <span className="text-xs text-gray-500">Call</span>
                  </button>
                  <button
                    onClick={handleVideoCall}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center hover:bg-violet-200 transition-colors">
                      <Video className="w-5 h-5 text-violet-600" />
                    </div>
                    <span className="text-xs text-gray-500">Video</span>
                  </button>
                  <button
                    onClick={handleToggleMute}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center hover:bg-violet-200 transition-colors">
                      {isMuted ? <BellOff className="w-5 h-5 text-violet-600" /> : <Bell className="w-5 h-5 text-violet-600" />}
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
                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                          <File className="w-4 h-4 text-violet-600" />
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
