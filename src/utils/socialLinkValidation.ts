import { ErrorType } from './ErrorType.js';
import logger from './logger.js';

export const MAX_SOCIAL_LINKS = 15;
export const MAX_URL_LENGTH = 2048;
export const MAX_DISPLAY_NAME_LENGTH = 100;

export type SocialLinkPlatform =
  | 'linkedin'
  | 'x'
  | 'youtube'
  | 'github'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'website';

type PlatformConfig = {
  displayName: string;
  hosts: string[];
  userNamePattern: RegExp;
};

export const SOCIAL_PLATFORMS: Record<SocialLinkPlatform, PlatformConfig> = {
  linkedin: {
    displayName: 'LinkedIn',
    hosts: ['linkedin.com'],
    userNamePattern: /^[A-Za-z0-9-]{3,100}$/,
  },
  x: {
    displayName: 'X',
    hosts: ['x.com', 'twitter.com'],
    userNamePattern: /^[A-Za-z0-9_]{1,15}$/,
  },
  youtube: {
    displayName: 'YouTube',
    hosts: ['youtube.com', 'youtu.be'],
    userNamePattern: /^[A-Za-z0-9._-]{3,100}$/,
  },
  github: {
    displayName: 'GitHub',
    hosts: ['github.com'],
    userNamePattern: /^[A-Za-z0-9-]{1,39}$/,
  },
  instagram: {
    displayName: 'Instagram',
    hosts: ['instagram.com'],
    userNamePattern: /^[A-Za-z0-9._]{1,30}$/,
  },
  facebook: {
    displayName: 'Facebook',
    hosts: ['facebook.com', 'fb.com'],
    userNamePattern: /^[A-Za-z0-9.]{5,50}$/,
  },
  tiktok: {
    displayName: 'TikTok',
    hosts: ['tiktok.com'],
    userNamePattern: /^[A-Za-z0-9._]{1,24}$/,
  },
  website: {
    displayName: 'Website',
    hosts: [],
    userNamePattern: /^.{0,100}$/,
  },
};

export const isSocialPlatform = (platform: string): platform is SocialLinkPlatform =>
  Object.prototype.hasOwnProperty.call(SOCIAL_PLATFORMS, platform);

export type SocialLinkPayload = {
  platform: string;
  user_name?: string | null;
  url: string;
  display_name?: string | null;
  is_primary?: boolean;
};

export type NormalizedSocialLink = {
  platform: SocialLinkPlatform;
  user_name: string | null;
  url: string;
  display_name: string | null;
  is_primary: boolean;
};

export type ValidatedSocialLinksResult =
  | { valid: true; links: NormalizedSocialLink[] }
  | { valid: false; error: ErrorType; detail?: string };

/**
 * Validates a full social-links submission before it reaches the database:
 * - at most {@link MAX_SOCIAL_LINKS} links (anti-abuse ceiling);
 * - exact duplicate rows are silently de-duplicated;
 * - every platform must be allow-listed;
 * - every URL must be https, parseable, length-capped and host-match its
 *   platform (`website` accepts any https host);
 * - `user_name`, when present, is stripped of a leading `@` and must match the
 *   platform's pattern.
 */
export const validateSocialLinks = (
  links: Array<SocialLinkPayload>,
): ValidatedSocialLinksResult => {
  if (!Array.isArray(links)) {
    return { valid: false, error: ErrorType.INVALID_INPUT, detail: 'Links must be an array' };
  }

  if (links.length > MAX_SOCIAL_LINKS) {
    return {
      valid: false,
      error: ErrorType.INVALID_INPUT,
      detail: `At most ${MAX_SOCIAL_LINKS} social links are allowed`,
    };
  }

  const seen = new Set<string>();
  const normalized: NormalizedSocialLink[] = [];

  for (const link of links) {
    const invalid = (detail: string) => ({
      valid: false as const,
      error: ErrorType.INVALID_INPUT,
      detail,
    });

    if (!link || typeof link !== 'object') {
      return invalid('Each link must be an object');
    }

    if (!isSocialPlatform(link.platform)) {
      return invalid(`Unsupported platform: ${link.platform}`);
    }

    const config = SOCIAL_PLATFORMS[link.platform];

    let url: URL;
    try {
      url = new URL(link.url);
    } catch {
      return invalid(`Malformed URL: ${link.url}`);
    }

    if (url.protocol !== 'https:') {
      return invalid(`Only https URLs are allowed: ${link.url}`);
    }

    if (url.href.length > MAX_URL_LENGTH) {
      return invalid('URL exceeds the maximum length of 2048 characters');
    }

    // Normalize away a single trailing slash so `.../user` and `.../user/`
    // are treated (and stored) as the same link.
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    if (
      config.hosts.length > 0 &&
      !config.hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
    ) {
      return invalid(`URL does not match platform ${link.platform}: ${url.hostname}`);
    }

    let userName: string | null = null;
    if (typeof link.user_name === 'string') {
      userName = link.user_name.trim().replace(/^@/, '') || null;

      if (userName !== null && !config.userNamePattern.test(userName)) {
        return invalid(`Invalid username for platform ${link.platform}: ${userName}`);
      }
    }

    let displayName: string | null = null;
    if (typeof link.display_name === 'string') {
      displayName = link.display_name.trim() || null;

      if (displayName !== null && displayName.length > MAX_DISPLAY_NAME_LENGTH) {
        return invalid(
          `Display name exceeds the maximum length of ${MAX_DISPLAY_NAME_LENGTH} characters`,
        );
      }
    }

    const key = `${link.platform}|${userName ?? ''}|${displayName ?? ''}|${url.href}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    normalized.push({
      platform: link.platform,
      user_name: userName,
      url: url.href,
      display_name: displayName,
      is_primary: link.is_primary === true,
    });
  }

  // At most one primary link per account: last primary submission wins.
  let primarySeen = false;
  for (let i = normalized.length - 1; i >= 0; i--) {
    if (normalized[i].is_primary) {
      if (primarySeen) {
        logger.debug({ index: i }, 'Dropping duplicate primary flag on earlier social link');
        normalized[i].is_primary = false;
      } else {
        primarySeen = true;
      }
    }
  }

  return { valid: true, links: normalized };
};
