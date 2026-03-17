// ─── Shared Agent Slug Utilities ─────────────────────────────────────────────
// Used by: AgentSite, AgentWebsite, BookAppointment, RecruitmentPage

const commonFirstNames = [
  'gaetano', 'john', 'jane', 'michael', 'sarah', 'david', 'jennifer', 'robert', 'maria',
  'james', 'mary', 'william', 'patricia', 'richard', 'linda', 'joseph', 'elizabeth',
  'thomas', 'barbara', 'charles', 'susan', 'christopher', 'jessica', 'daniel', 'karen',
  'matthew', 'nancy', 'anthony', 'betty', 'mark', 'margaret', 'donald', 'sandra',
  'steven', 'ashley', 'paul', 'dorothy', 'andrew', 'kimberly', 'joshua', 'emily',
  'kenneth', 'donna', 'kevin', 'michelle', 'brian', 'carol', 'george', 'amanda',
  'edward', 'melissa', 'ronald', 'deborah', 'timothy', 'stephanie', 'jason', 'rebecca',
  'jeffrey', 'laura', 'ryan', 'sharon', 'jacob', 'cynthia', 'gary', 'kathleen',
  'nicholas', 'amy', 'eric', 'angela', 'jonathan', 'shirley', 'stephen', 'anna',
  'larry', 'brenda', 'justin', 'pamela', 'scott', 'emma', 'brandon', 'nicole',
  'benjamin', 'helen', 'samuel', 'samantha', 'raymond', 'katherine', 'gregory', 'christine',
  'frank', 'debra', 'alexander', 'rachel', 'patrick', 'carolyn', 'raymond', 'janet',
  'jack', 'catherine', 'dennis', 'maria', 'jerry', 'heather', 'tyler', 'diane',
  'aaron', 'ruth', 'jose', 'julie', 'adam', 'olivia', 'nathan', 'joyce', 'henry', 'virginia',
  'douglas', 'victoria', 'zachary', 'kelly', 'peter', 'lauren', 'kyle', 'christina',
  'noah', 'joan', 'ethan', 'evelyn', 'jeremy', 'judith', 'walter', 'megan', 'christian',
  'andrea', 'keith', 'cheryl', 'roger', 'hannah', 'terry', 'jacqueline', 'austin', 'martha',
  'sean', 'gloria', 'gerald', 'teresa', 'carl', 'ann', 'harold', 'sara', 'dylan', 'madison',
  'arthur', 'frances', 'lawrence', 'kathryn', 'jordan', 'janice', 'jesse', 'jean', 'bryan',
  'abigail', 'billy', 'alice', 'bruce', 'judy', 'gabriel', 'sophia', 'joe', 'grace',
  'logan', 'denise', 'albert', 'amber', 'willie', 'doris', 'alan', 'marilyn', 'eugene',
  'danielle', 'vincent', 'beverly', 'russell', 'isabella', 'elijah', 'theresa', 'randy',
  'diana', 'philip', 'natalie', 'harry', 'brittany', 'vincent', 'charlotte', 'bobby', 'marie',
  'johnny', 'kayla', 'bradley', 'alexis', 'roy', 'lori', 'admin', 'test', 'demo'
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function parseAgentSlug(slug: string): { name: string; firstName: string; lastName: string; initials: string } {
  const namePart = slug.replace(/^agent-/, '').toLowerCase();

  let firstName = '';
  let lastName = '';

  for (const name of commonFirstNames) {
    if (namePart.startsWith(name) && namePart.length > name.length) {
      firstName = name;
      lastName = namePart.slice(name.length);
      break;
    }
  }

  if (!firstName) {
    const camelMatch = namePart.match(/^([a-z]+)([A-Z][a-z]+.*)$/);
    if (camelMatch) {
      firstName = camelMatch[1];
      lastName = camelMatch[2].toLowerCase();
    } else if (namePart.length > 6) {
      firstName = namePart.slice(0, 6);
      lastName = namePart.slice(6);
    } else {
      firstName = namePart;
      lastName = '';
    }
  }

  const fullName = lastName
    ? `${capitalize(firstName)} ${capitalize(lastName)}`
    : capitalize(firstName);

  const initials = lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : firstName.slice(0, 2).toUpperCase();

  return { name: fullName, firstName: capitalize(firstName), lastName: lastName ? capitalize(lastName) : '', initials };
}

export function generateAgentSlug(name: string): string {
  return 'agent-' + name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

export function getAgentWebsiteUrl(name: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://heritagels.org';
  return `${baseUrl}/a/${generateAgentSlug(name)}`;
}
