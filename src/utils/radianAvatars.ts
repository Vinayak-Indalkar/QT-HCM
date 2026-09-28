/**
 * Radian UI Avatars Library
 * Sourced directly from https://radianui.com/resources/avatar (Radian OS Open Source Avatar Pack)
 * Official Radian OS jsDelivr CDN endpoint:
 * https://cdn.jsdelivr.net/gh/Radian-os/radian-resources@v1.0.2/packages/avatars/src/{1..216}.png
 */

export const RADIAN_AVATAR_CDN_BASE =
  'https://cdn.jsdelivr.net/gh/Radian-os/radian-resources@v1.0.2/packages/avatars/src';

export const RADIAN_UNCOMPRESSED_CDN_BASE =
  'https://cdn.jsdelivr.net/gh/Radian-os/radian-resources@v1.0.2/packages/uncompressed-avatars/src';

export const TOTAL_RADIAN_AVATARS = 216;

/**
 * Curated professional avatars designated by Radian UI for enterprise & team dashboards
 */
export const RADIAN_PROFESSIONAL_IDS = [
  9, 11, 22, 27, 31, 32, 40, 41, 48, 52, 71, 72, 78, 79, 80, 83, 85, 89, 90, 91,
  92, 93, 100, 101, 105, 118, 125, 132, 133, 136, 139, 142, 144, 156, 158, 169,
  173, 182, 195, 196, 202, 208, 210
];

/**
 * Return avatar URL by index (1 to 216)
 */
export const getRadianAvatarUrl = (id: number, uncompressed = false): string => {
  const normalized = Math.max(1, Math.min(TOTAL_RADIAN_AVATARS, Math.floor(id)));
  const base = uncompressed ? RADIAN_UNCOMPRESSED_CDN_BASE : RADIAN_AVATAR_CDN_BASE;
  return `${base}/${normalized}.png`;
};

/**
 * Generate a consistent, deterministic Radian UI avatar based on user name or email string
 */
export const getRadianAvatarByName = (nameOrEmail: string, uncompressed = false): string => {
  if (!nameOrEmail) return getRadianAvatarUrl(11, uncompressed);
  let hash = 0;
  for (let i = 0; i < nameOrEmail.length; i++) {
    hash = (hash << 5) - hash + nameOrEmail.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % RADIAN_PROFESSIONAL_IDS.length;
  return getRadianAvatarUrl(RADIAN_PROFESSIONAL_IDS[index], uncompressed);
};

export const MALE_AVATAR_IDS = [11, 72, 101, 105, 158, 196, 27, 31, 80, 89, 91, 92, 136, 139];
export const FEMALE_AVATAR_IDS = [32, 48, 83, 90, 133, 182, 208, 210, 9, 22, 41, 79, 85, 93];
export const NEUTRAL_AVATAR_IDS = [40, 52, 71, 78, 100, 118, 125, 132, 142, 144, 156, 169, 173];

/**
 * Return an avatar based on selected gender, deterministically hashed by employee name or seed
 */
export const getAvatarByGender = (gender?: string, nameOrSeed: string = 'Alex Mercer', uncompressed = false): string => {
  const g = (gender || '').toLowerCase().trim();
  let pool = RADIAN_PROFESSIONAL_IDS;

  if (g === 'female' || g === 'woman' || g === 'f') {
    pool = FEMALE_AVATAR_IDS;
  } else if (g === 'male' || g === 'man' || g === 'm') {
    pool = MALE_AVATAR_IDS;
  } else if (g === 'non-binary' || g === 'other') {
    pool = NEUTRAL_AVATAR_IDS;
  }

  let hash = 0;
  for (let i = 0; i < nameOrSeed.length; i++) {
    hash = (hash << 5) - hash + nameOrSeed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;
  return getRadianAvatarUrl(pool[index], uncompressed);
};

/**
 * Return random Radian UI avatar from the professional collection
 */
export const getRandomRadianAvatar = (uncompressed = false): string => {
  const randomIndex = Math.floor(Math.random() * RADIAN_PROFESSIONAL_IDS.length);
  return getRadianAvatarUrl(RADIAN_PROFESSIONAL_IDS[randomIndex], uncompressed);
};

/**
 * Dedicated Radian UI personas for primary portal roles & demo characters
 */
export const RADIAN_PERSONA_AVATARS = {
  // Core system users
  johnDoe: getRadianAvatarUrl(11),          // Primary candidate & employee
  alexChen: getRadianAvatarUrl(11),
  eleanorVance: getRadianAvatarUrl(32),     // HR Lead / Operations
  marcusBrody: getRadianAvatarUrl(72),      // VP of Engineering / Manager
  devinThorne: getRadianAvatarUrl(101),     // IT Infrastructure Specialist
  alexandraWright: getRadianAvatarUrl(48),  // Super Admin / Principal Administrator
  sophiaChen: getRadianAvatarUrl(83),       // Senior Architect & Onboarding Buddy

  // Team & directory candidates
  sarahJenkins: getRadianAvatarUrl(90),
  michaelChang: getRadianAvatarUrl(105),
  emilyRodriguez: getRadianAvatarUrl(133),
  davidKim: getRadianAvatarUrl(158),
  jessicaTaylor: getRadianAvatarUrl(182),
  jamesWilson: getRadianAvatarUrl(196),
  oliviaMartinez: getRadianAvatarUrl(208),
  rachelGreen: getRadianAvatarUrl(210)
} as const;

/**
 * Return the authoritative profile avatar for an employee or candidate across all personas.
 * Precedence:
 * 1. Explicit custom uploaded photo in localStorage for this specific employee / candidate ID
 * 2. Candidate role shared uploaded photo in localStorage
 * 3. person.avatarUrl or person.avatar (if valid data/URL)
 * 4. Deterministic gender-based Radian avatar hashed by employee name
 */
export const getEffectiveAvatar = (
  person?: {
    id?: string;
    employeeId?: string;
    gender?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    avatarUrl?: string;
    avatar?: string;
  } | null,
  fallbackGender?: string,
  fallbackName?: string
): string => {
  if (!person) {
    return getAvatarByGender(fallbackGender, fallbackName || 'Alex Mercer');
  }

  const id = person.id || person.employeeId || '';
  const fullName = person.name || `${person.firstName || ''} ${person.lastName || ''}`.trim() || fallbackName || 'Alex Mercer';
  const gender = person.gender || fallbackGender;

  try {
    if (id) {
      const stored = localStorage.getItem(`quantira_avatar_${id}`) || localStorage.getItem(`quantira_profile_photo_${id}`);
      if (stored) return stored;
    }
    if (id === 'cand-1' || id === 'emp-1' || id === 'EMP-2024-0847' || id === 'usr-emp-john-doe' || !id) {
      const storedCandidate =
        localStorage.getItem('quantira_profile_photo_CANDIDATE') ||
        localStorage.getItem('quantira_avatar_CANDIDATE') ||
        localStorage.getItem('quantira_avatar_EMPLOYEE') ||
        localStorage.getItem('quantira_profile_photo_cand-1') ||
        localStorage.getItem('quantira_avatar_cand-1');
      if (storedCandidate) return storedCandidate;
    }
  } catch {}

  if (person.avatarUrl && (person.avatarUrl.startsWith('data:') || person.avatarUrl.startsWith('blob:') || person.avatarUrl.includes('jsdelivr.net') || person.avatarUrl.includes('http'))) {
    return person.avatarUrl;
  }
  if (person.avatar && (person.avatar.startsWith('data:') || person.avatar.startsWith('blob:') || person.avatar.includes('jsdelivr.net') || person.avatar.includes('http'))) {
    return person.avatar;
  }

  return getAvatarByGender(gender, fullName);
};
