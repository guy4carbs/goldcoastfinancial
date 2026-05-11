/**
 * lifeOS commit-message → release-notes parser.
 *
 * Pure rule-based, no LLM. Designed for our "Subject: short description"
 * commit-message convention. The founder pastes a chunk of git log output
 * (or any newline-separated commit list), the parser categorizes each
 * line, strips technical jargon, and produces clean Title Case prose with
 * NO underscores anywhere.
 *
 * Designed to be approachable for non-technical users — "removed the
 * writing number column" not "drop NAIC column".
 */

export interface ParsedDraft {
  title: string;
  summary: string;
  bodyMarkdown: string;
  recognizedCount: number;
  totalCount: number;
}

/**
 * Map subject-prefix (the bit before the colon) → user-facing section
 * header. Anything not in this map falls into "Other improvements".
 * Sections are rendered in the same order as defined here.
 */
const SUBJECT_TO_SECTION: ReadonlyArray<[RegExp, string]> = [
  [/^lifeos\b/i,            "lifeOS"],
  [/^invite\b/i,            "Invitations"],
  [/^carriers?\b/i,         "Carriers"],
  [/^hierarchy\b/i,         "Hierarchy"],
  [/^founders?\b/i,         "Founders Lounge"],
  [/^covenant\b/i,          "Covenant"],
  [/^crm\b/i,               "CRM"],
  [/^hcms\b/i,              "Agent HCMS"],
  [/^leads?\b/i,            "Lead Distribution"],
  [/^auth\b/i,              "Sign-in & Security"],
  [/^2fa\b/i,               "Sign-in & Security"],
  [/^webauthn\b/i,          "Sign-in & Security"],
  [/^onboarding\b/i,        "Onboarding"],
  [/^tour\b/i,              "Guided Tours"],
  [/^heritage\b/i,          "Heritage"],
  [/^settings?\b/i,         "Settings"],
  [/^analytics\b/i,         "Analytics & Reporting"],
  [/^commissions?\b/i,      "Commissions"],
  [/^policies?\b/i,         "Policies"],
  [/^clients?\b/i,          "Clients"],
  [/^docs?\b/i,             "Documents"],
  [/^email\b/i,             "Email"],
  [/^sms\b/i,               "Messaging"],
];

/**
 * Replace technical words/abbreviations with friendly ones. Match against
 * whole words only (word boundaries). Order matters — longer phrases first
 * so e.g. "agency_carrier_contracts" gets rewritten before "carrier".
 */
const PHRASE_REPLACEMENTS: ReadonlyArray<[RegExp, string]> = [
  [/\bagency_carrier_contracts\b/gi,  "carrier contracts"],
  [/\bcarrier_directory\b/gi,         "carrier directory"],
  [/\blifeos_releases\b/gi,           "release notes"],
  [/\buser_release_acks\b/gi,         "update tracking"],
  [/\bagent_hierarchy\b/gi,           "hierarchy"],
  [/\bagent_profiles?\b/gi,           "agent profile"],
  [/\bcontracting_checklists?\b/gi,   "contracting checklist"],
  [/\bsecure_forms?\b/gi,             "secure links"],
  [/\bsales_agent\b/gi,               "sales agent"],
  [/\bsystem_admin\b/gi,              "system admin"],
  [/\bmarketing_staff\b/gi,           "marketing staff"],
  [/\bagency_manager\b/gi,            "agency manager"],
  [/\bre-invite\b/gi,                 "resend invite"],
  [/\bwriting\s*#/gi,                 "writing number"],
  [/\bnaic\b/gi,                      "carrier identifier"],
  [/\bam best\b/gi,                   "AM Best rating"],
  [/\bIUL\b/g,                        "IUL"],
  [/\bMYGA\b/g,                       "MYGA"],
  [/\bLTC\b/g,                        "LTC"],
  [/\bFK\b/g,                         "link"],
  [/\bJSONB?\b/gi,                    "data"],
  [/\bAPI\b/g,                        "API"],
  [/\bSQL\b/g,                        "data"],
  [/\bUI\b/g,                         "interface"],
  [/\bUX\b/g,                         "experience"],
  [/\bCSP\b/g,                        "content security policy"],
  [/\bSPA\b/g,                        "app"],
  [/\bSW\b/g,                         "service worker"],
  [/\bRBAC\b/g,                       "role permissions"],
  [/\bMPA\b/g,                        "Master Producer Agreement"],
  [/\bCSV\b/g,                        "CSV"],
  [/\bbackfill\b/gi,                  "update old records"],
  [/\bidempotent\b/gi,                "safe to re-run"],
  [/\bmigration\b/gi,                 "database update"],
  [/\bschema\b/gi,                    "data model"],
  [/\bendpoint\b/gi,                  "endpoint"],
  [/\bdry-run\b/gi,                   "preview"],
  [/\bauth\b/gi,                      "sign-in"],
  [/\bwebauthn\b/gi,                  "Touch ID / passkey"],
  [/\b2FA\b/g,                        "two-factor sign-in"],
  [/\botp\b/gi,                       "one-time code"],
  [/\binvitee\b/gi,                   "invited user"],
  [/\binviter\b/gi,                   "the person inviting"],
  [/\bdownline\b/gi,                  "downline"],
  [/\bupline\b/gi,                    "upline"],
  [/\boverride\b/gi,                  "override"],
];

/**
 * Action-verb canonicalization at the start of the sentence. Maps the
 * common imperative-mood commit verbs to a consistent past-tense voice
 * for release notes ("Added X" rather than "add X").
 */
const VERB_REWRITES: ReadonlyArray<[RegExp, string]> = [
  [/^add\b/i,        "Added"],
  [/^adds\b/i,       "Added"],
  [/^added\b/i,      "Added"],
  [/^remove\b/i,     "Removed"],
  [/^removes\b/i,    "Removed"],
  [/^removed\b/i,    "Removed"],
  [/^drop\b/i,       "Removed"],
  [/^drops\b/i,      "Removed"],
  [/^dropped\b/i,    "Removed"],
  [/^delete\b/i,     "Deleted"],
  [/^deletes\b/i,    "Deleted"],
  [/^fix\b/i,        "Fixed"],
  [/^fixes\b/i,      "Fixed"],
  [/^fixed\b/i,      "Fixed"],
  [/^update\b/i,     "Updated"],
  [/^updates\b/i,    "Updated"],
  [/^updated\b/i,    "Updated"],
  [/^refactor\b/i,   "Improved"],
  [/^refactors\b/i,  "Improved"],
  [/^refactored\b/i, "Improved"],
  [/^improve\b/i,    "Improved"],
  [/^improves\b/i,   "Improved"],
  [/^cleanup\b/i,    "Cleaned up"],
  [/^enable\b/i,     "Enabled"],
  [/^enables\b/i,    "Enabled"],
  [/^disable\b/i,    "Disabled"],
  [/^disables\b/i,   "Disabled"],
  [/^rename\b/i,     "Renamed"],
  [/^renames\b/i,    "Renamed"],
  [/^make\b/i,       "Made"],
  [/^makes\b/i,      "Made"],
  [/^introduce\b/i,  "Introduced"],
  [/^migrate\b/i,    "Migrated"],
  [/^wire(\s+up)?\b/i,    "Connected"],
  [/^wires(\s+up)?\b/i,   "Connected"],
  [/^wired(\s+up)?\b/i,   "Connected"],
  [/^reset\b/i,      "Reset"],
  [/^seed\b/i,       "Loaded"],
  [/^seeds\b/i,      "Loaded"],
  [/^seeded\b/i,     "Loaded"],
  [/^harden\b/i,     "Strengthened"],
  [/^expose\b/i,     "Surfaced"],
  [/^surface\b/i,    "Surfaced"],
  [/^hide\b/i,       "Hid"],
  [/^show\b/i,       "Showed"],
  [/^restrict\b/i,   "Restricted"],
];

/**
 * Strip noise: scoped versions, hashes, GitHub refs, parenthetical
 * commentary that adds nothing for end-users.
 */
function stripNoise(text: string): string {
  return text
    // Strip leading commit hash + space
    .replace(/^[a-f0-9]{7,40}\s+/i, "")
    // Strip pull request references "(#15)"
    .replace(/\s*\(#\d+\)\s*$/, "")
    // Strip generic "Co-Authored-By:" trailers
    .replace(/Co-Authored-By:[^\n]*/gi, "")
    // Strip generated-by trailers
    .replace(/🤖 Generated with[^\n]*/g, "")
    // Strip Wave Z10/Wave Y/etc internal labels
    .replace(/\bWave [A-Z]\d*\b:?\s*/g, "")
    // Strip TS-error codes
    .replace(/\bTS\d+\b/g, "")
    // Strip technical line-references "(line 1265)"
    .replace(/\(line\s+\d+\)/gi, "")
    // Strip "(commit 0c2224c)"
    .replace(/\(commit\s+[a-f0-9]{7,}\)/gi, "")
    // Strip "X..Y" version diffs
    .replace(/\b[a-f0-9]{7,40}\.\.[a-f0-9]{7,40}\b/g, "")
    // Convert any remaining underscores to spaces (rule: no underscores)
    .replace(/_/g, " ")
    .trim();
}

/**
 * Capitalize first letter while preserving the rest.
 */
function capFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface ParsedLine {
  section: string;
  action: string;
}

function parseLine(raw: string): ParsedLine | null {
  let line = stripNoise(raw);
  if (!line || line.length < 5) return null;

  // Extract subject prefix (everything before the first colon)
  const colonIdx = line.indexOf(":");
  let section = "Other improvements";
  let action = line;

  if (colonIdx > 0 && colonIdx < 40) {
    const subject = line.slice(0, colonIdx).trim();
    action = line.slice(colonIdx + 1).trim();
    const matched = SUBJECT_TO_SECTION.find(([re]) => re.test(subject));
    if (matched) {
      section = matched[1];
    } else {
      // Subject didn't match a known section — fold it back into the action.
      action = subject + " " + action;
    }
  }

  // Apply phrase replacements + verb rewrites
  for (const [re, replacement] of PHRASE_REPLACEMENTS) {
    action = action.replace(re, replacement);
  }
  let rewroteVerb = false;
  for (const [re, replacement] of VERB_REWRITES) {
    if (re.test(action)) {
      action = action.replace(re, replacement);
      rewroteVerb = true;
      break;
    }
  }
  // If no verb prefix, prepend "Updated" to keep voice consistent
  if (!rewroteVerb && !/^(Added|Removed|Fixed|Updated|Improved|Cleaned|Enabled|Disabled|Renamed|Made|Introduced|Migrated|Connected|Deleted|Loaded|Reset|Strengthened|Surfaced|Hid|Showed|Restricted)\b/.test(action)) {
    action = "Updated " + action.charAt(0).toLowerCase() + action.slice(1);
  }

  action = capFirst(action.replace(/\s{2,}/g, " ").trim());
  // Strip trailing period; we'll add one ourselves
  action = action.replace(/[.!]+$/, "");

  if (action.length < 4) return null;
  return { section, action };
}

const SECTION_ORDER: string[] = [
  "Highlights",
  "lifeOS",
  "Invitations",
  "Hierarchy",
  "Carriers",
  "Founders Lounge",
  "Agent HCMS",
  "CRM",
  "Lead Distribution",
  "Commissions",
  "Clients",
  "Policies",
  "Onboarding",
  "Guided Tours",
  "Heritage",
  "Covenant",
  "Sign-in & Security",
  "Email",
  "Messaging",
  "Documents",
  "Analytics & Reporting",
  "Settings",
  "Other improvements",
];

/**
 * Generate a release-notes draft from raw commit log text.
 *
 * `versionGuess` is optional — if provided, it's stamped into the title.
 * The output's `title`/`summary`/`bodyMarkdown` slot directly into the
 * LifeOSAdminPage editor fields.
 */
export function generateDraftFromCommits(rawCommits: string, versionGuess?: string): ParsedDraft {
  const lines = rawCommits.split(/\r?\n/);
  const grouped = new Map<string, string[]>();
  let recognized = 0;
  let total = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Skip merge commits and other noise
    if (/^Merge\b/.test(trimmed)) continue;
    if (/^commit [a-f0-9]{40}/.test(trimmed)) continue;
    if (/^Author:|^Date:|^\s*$/.test(trimmed)) continue;

    total++;
    const parsed = parseLine(trimmed);
    if (!parsed) continue;
    recognized++;

    const arr = grouped.get(parsed.section) ?? [];
    arr.push(parsed.action);
    grouped.set(parsed.section, arr);
  }

  // Build the body in fixed section order; unknown sections come last
  const orderedSections: string[] = SECTION_ORDER.filter((s) => grouped.has(s));
  for (const s of Array.from(grouped.keys())) {
    if (!orderedSections.includes(s)) orderedSections.push(s);
  }

  const bodyParts: string[] = [];
  for (const section of orderedSections) {
    const items = grouped.get(section) ?? [];
    if (items.length === 0) continue;
    bodyParts.push(`## ${section}\n`);
    for (const item of items) {
      bodyParts.push(`- ${item}.`);
    }
    bodyParts.push(""); // blank line between sections
  }

  // Title: derive from the largest section or use a generic
  const sortedBySize = orderedSections
    .map((s) => [s, (grouped.get(s) ?? []).length] as const)
    .sort((a, b) => b[1] - a[1]);
  const topSection = sortedBySize[0]?.[0];

  const titleArea = topSection && topSection !== "Other improvements" ? topSection : "Improvements";
  const title = versionGuess
    ? `lifeOS ${versionGuess} — ${titleArea}`
    : `${titleArea} update`;

  // Summary: one sentence describing what's in this release
  const sectionsCount = orderedSections.length;
  const itemsCount = recognized;
  const summary =
    itemsCount === 0
      ? "A round of quality improvements across the platform."
      : sectionsCount === 1
        ? `${itemsCount} ${itemsCount === 1 ? "change" : "changes"} in ${titleArea}.`
        : `${itemsCount} ${itemsCount === 1 ? "change" : "changes"} across ${sectionsCount} areas, including ${titleArea}.`;

  const bodyMarkdown = bodyParts.length > 0
    ? bodyParts.join("\n")
    : "## Improvements\n\n- General fixes and improvements.\n";

  return {
    title,
    summary,
    bodyMarkdown: ensureNoUnderscores(bodyMarkdown),
    recognizedCount: recognized,
    totalCount: total,
  };
}

/**
 * Final safety net — strip any straggler underscores that slipped through.
 * Rule: zero underscores in the user-facing notes, ever.
 */
function ensureNoUnderscores(s: string): string {
  return s.replace(/_/g, " ");
}
