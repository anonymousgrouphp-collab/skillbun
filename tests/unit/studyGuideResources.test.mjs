import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getStudyGuideResources } from '../../utils/shared/studyGuideResources.js';

const videoId = 'dQw4w9WgXcQ';
const playlistId = 'PL_test-123';
const video = (url, title = 'Video lesson') => ({ type: 'video', title, url });

test('video aliases deduplicate by ID and prefer an exactly verified original URL', () => {
  const verifiedUrl = `https://www.youtube.com/watch?v=${videoId}&t=30`;
  const resources = [
    video(`https://youtu.be/${videoId}?si=tracking&t=1`),
    video(`https://m.youtube.com/shorts/${videoId}?feature=share`),
    video(verifiedUrl, 'Verified lesson'),
    video(`https://youtube.com/embed/${videoId}#t=90`),
  ];
  const { videos, links } = getStudyGuideResources(resources, [verifiedUrl]);
  assert.equal(videos.length, 1);
  assert.deepEqual(links, []);
  assert.equal(videos[0].key, `youtube:video:${videoId}`);
  assert.equal(videos[0].url, verifiedUrl);
  assert.equal(videos[0].title, 'Verified lesson');
  assert.equal(videos[0].embedUrl, `https://www.youtube.com/embed/${videoId}`);
});

test('canonical matches never inherit verification from an absent alias or cleaned URL', () => {
  const canonical = `https://www.youtube.com/watch?v=${videoId}`;
  const resources = [video(`https://youtu.be/${videoId}`), video(`${canonical}&t=20`)];
  assert.equal(getStudyGuideResources(resources, [canonical]).videos[0].embedUrl, null);
  assert.equal(getStudyGuideResources([video(` ${canonical} `)], [canonical]).videos[0].embedUrl, null);
  assert.equal(getStudyGuideResources([video(canonical)], null).videos[0].embedUrl, null);
});

test('playlists deduplicate separately from videos carrying a playlist parameter', () => {
  const playlist = `https://youtube.com/playlist?list=${playlistId}`;
  const watch = `https://youtube.com/watch?v=${videoId}&list=${playlistId}`;
  const { videos } = getStudyGuideResources([
    video(playlist),
    video(`https://www.youtube.com/embed/videoseries?list=${playlistId}&index=2`),
    video(`https://m.youtube.com/watch?list=${playlistId}`),
    video(watch),
  ], [playlist, watch]);
  assert.equal(videos.length, 2);
  assert.equal(videos[0].key, `youtube:playlist:${playlistId}`);
  assert.equal(videos[0].embedUrl, `https://www.youtube.com/embed/videoseries?list=${playlistId}`);
  assert.equal(videos[1].key, `youtube:video:${videoId}`);
  assert.equal(videos[1].embedUrl, `https://www.youtube.com/embed/${videoId}`);
});

test('only trusted exact YouTube hosts can embed even when an attacker URL is allowlisted', () => {
  const urls = [
    `https://youtube.com.evil.example/watch?v=${videoId}`,
    `https://evil.example/youtube.com/watch?v=${videoId}`,
    `https://notyoutube.com/watch?v=${videoId}`,
    `https://www.youtu.be/${videoId}`,
    `https://youtube.com:444/watch?v=${videoId}`,
    `https://youtube.com./watch?v=${videoId}`,
  ];
  const { videos } = getStudyGuideResources(urls.map(url => video(url)), urls);
  assert.equal(videos.length, urls.length);
  for (const entry of videos) assert.equal(entry.embedUrl, null);
});

test('unsafe or malformed YouTube IDs remain external without producing iframe URLs', () => {
  const urls = [
    'https://youtube.com/watch?v=short',
    `https://youtube.com/embed/${videoId}/extra`,
    'https://youtube.com/playlist?list=PL%2Finvalid',
    'https://youtu.be/%22onload%3Devil',
    `https://youtube.com/anything?v=${videoId}`,
  ];
  const { videos } = getStudyGuideResources(urls.map(url => video(url)), urls);
  assert.equal(videos.length, urls.length);
  for (const entry of videos) assert.equal(entry.embedUrl, null);
});

test('non-YouTube videos stay accessible as external resources and deduplicate fragments', () => {
  const url = 'https://vimeo.com/123?quality=hd';
  const { videos, links } = getStudyGuideResources([video(`${url}#start`), video(`${url}#end`)], [url]);
  assert.deepEqual(links, []);
  assert.equal(videos.length, 1);
  assert.equal(videos[0].url, url);
  assert.equal(videos[0].key, url);
  assert.equal(videos[0].embedUrl, null);
});

test('articles preserve meaningful paths and queries, remove fragments, and keep their titles', () => {
  const resources = [
    { type: 'article', title: '  Installation guide  ', url: 'https://EXAMPLE.com:443/docs/install?language=en#first' },
    { type: 'article', title: 'Duplicate', url: 'https://example.com/docs/install?language=en#second' },
    { type: 'article', title: 'Spanish version', url: 'https://example.com/docs/install?language=es' },
    { url: 'http://example.com/reference', title: 12 },
  ];
  const { videos, links } = getStudyGuideResources(resources);
  assert.deepEqual(videos, []);
  assert.equal(links.length, 3);
  assert.deepEqual(links[0], {
    url: 'https://example.com/docs/install?language=en',
    title: 'Installation guide',
    host: 'example.com',
    key: 'https://example.com/docs/install?language=en',
  });
  assert.equal(links[1].url, 'https://example.com/docs/install?language=es');
  assert.equal(links[2].title, 'example.com');
});

test('malformed resources and non-HTTP URLs are ignored without throwing', () => {
  const resources = [null, undefined, false, [], 'https://example.com', {},
    { url: 12 }, { url: '' }, { url: '/relative' }, { url: '//example.com/path' },
    { url: 'javascript:alert(1)' }, { url: 'data:text/html,test' }, { url: 'ftp://example.com/file' },
    { url: 'https://' }, { url: 'http:example.com' }, { url: 'https://example.com/a b' },
    { url: 'https://example.com/\npath' }, { url: 'https://example.com\\path' },
    { url: 'https://youtube.com@evil.example/watch?v=dQw4w9WgXcQ' },
  ];
  assert.deepEqual(getStudyGuideResources(resources), { videos: [], links: [] });
  assert.deepEqual(getStudyGuideResources(null), { videos: [], links: [] });
  assert.deepEqual(getStudyGuideResources({}), { videos: [], links: [] });
});

test('normalizing resources does not mutate caller data or reorder unrelated items', () => {
  const url = `https://youtube.com/watch?v=${videoId}`;
  const resources = Object.freeze([
    Object.freeze(video(`https://youtu.be/${videoId}`)),
    Object.freeze(video('https://vimeo.com/456', 'External video')),
    Object.freeze(video(url, 'Verified video')),
  ]);
  const verified = Object.freeze([url]);
  const { videos } = getStudyGuideResources(resources, verified);
  assert.equal(videos[0].title, 'Verified video');
  assert.equal(videos[1].title, 'External video');
  assert.equal(resources[0].url, `https://youtu.be/${videoId}`);
});
