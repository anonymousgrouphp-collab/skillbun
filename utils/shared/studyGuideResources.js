const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const PLAYLIST_ID = /^[A-Za-z0-9_-]+$/;

function parseResourceUrl(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed) || /[\\\u0000-\u0020\u007f]/.test(trimmed)) return null;

  try {
    const url = new URL(trimmed);
    if (!url.hostname || url.username || url.password) return null;
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

function getYoutubeIdentity(url) {
  if (!YOUTUBE_HOSTS.has(url.host)) return null;

  const path = url.pathname.replace(/\/$/, '');
  let videoId = null;
  let playlistId = null;

  if (url.hostname === 'youtu.be') {
    videoId = path.slice(1);
  } else if (path === '/watch') {
    videoId = url.searchParams.get('v');
    if (!videoId) playlistId = url.searchParams.get('list');
  } else if (path === '/playlist' || path === '/embed/videoseries') {
    playlistId = url.searchParams.get('list');
  } else {
    videoId = path.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1];
  }

  if (VIDEO_ID.test(videoId || '')) {
    return { key: `youtube:video:${videoId}`, embedUrl: `https://www.youtube.com/embed/${videoId}` };
  }
  if (PLAYLIST_ID.test(playlistId || '')) {
    return { key: `youtube:playlist:${playlistId}`, embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}` };
  }
  return null;
}

/** Normalize display resources without widening the exact-URL embed allowlist. */
export function getStudyGuideResources(resources = [], verifiedVideos = []) {
  const videos = new Map();
  const links = new Map();
  const verified = new Set(Array.isArray(verifiedVideos) ? verifiedVideos : []);

  for (const resource of Array.isArray(resources) ? resources : []) {
    if (!resource || typeof resource !== 'object' || Array.isArray(resource)) continue;
    const url = parseResourceUrl(resource.url);
    if (!url) continue;

    const isVideo = typeof resource.type === 'string' && resource.type.trim().toLowerCase() === 'video';
    const youtube = isVideo ? getYoutubeIdentity(url) : null;
    const entry = {
      url: url.href,
      title: typeof resource.title === 'string' && resource.title.trim() ? resource.title.trim() : url.hostname,
      host: url.hostname,
      key: youtube?.key || url.href,
      ...(isVideo ? { embedUrl: youtube && verified.has(resource.url) ? youtube.embedUrl : null } : {}),
    };
    const collection = isVideo ? videos : links;
    const existing = collection.get(entry.key);
    if (!existing || (!existing.embedUrl && entry.embedUrl)) collection.set(entry.key, entry);
  }

  return { videos: [...videos.values()], links: [...links.values()] };
}
