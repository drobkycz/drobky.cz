import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, '../src/data/instagram.json');

const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
const userId = process.env.INSTAGRAM_USER_ID;
const apiVersion = process.env.INSTAGRAM_GRAPH_VERSION || 'v24.0';

const defaultPayload = {
  updatedAt: new Date().toISOString(),
  items: []
};

const readExisting = async () => {
  try {
    const file = await readFile(outputPath, 'utf-8');
    return JSON.parse(file);
  } catch {
    return defaultPayload;
  }
};

const writePayload = async (payload) => {
  await writeFile(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
};

if (!token) {
  const existing = await readExisting();
  await writePayload({
    ...existing,
    updatedAt: new Date().toISOString()
  });
  console.log('Instagram fetch skipped: missing INSTAGRAM_ACCESS_TOKEN');
  process.exit(0);
}

const fields = ['id', 'caption', 'media_type', 'media_url', 'thumbnail_url', 'permalink', 'timestamp'].join(',');
const endpoint = userId ? `${userId}/media` : 'me/media';
const urls = [
  `https://graph.instagram.com/${endpoint}?fields=${fields}&limit=12&access_token=${token}`,
  `https://graph.facebook.com/${apiVersion}/${endpoint}?fields=${fields}&limit=12&access_token=${token}`
];

try {
  const existing = await readExisting();
  let json = null;
  let lastError = '';

  for (const url of urls) {
    const response = await fetch(url);
    const raw = await response.text();
    const parsed = raw ? JSON.parse(raw) : {};

    if (response.ok && !parsed?.error?.message) {
      json = parsed;
      break;
    }

    lastError = parsed?.error?.message ?? `Instagram API failed with status ${response.status}`;
  }

  if (!json) {
    throw new Error(lastError || 'Instagram API request failed');
  }

  const items = (json.data ?? []).slice(0, 12).map((item) => ({
    id: item.id,
    caption: item.caption ?? '',
    image: item.thumbnail_url ?? item.media_url,
    url: item.permalink ?? '',
    mediaType: item.media_type ?? '',
    timestamp: item.timestamp ?? ''
  }));

  if (items.length === 0 && Array.isArray(existing.items) && existing.items.length > 0) {
    await writePayload({
      ...existing,
      updatedAt: new Date().toISOString()
    });
    console.log('Instagram API returned 0 items, keeping previous cache.');
    process.exit(0);
  }

  await writePayload({
    updatedAt: new Date().toISOString(),
    items
  });

  console.log(`Instagram cache updated: ${items.length} items`);
} catch (error) {
  const existing = await readExisting();
  await writePayload({
    ...existing,
    updatedAt: new Date().toISOString()
  });
  console.error('Instagram fetch failed, keeping previous cache.', error instanceof Error ? error.message : error);
  process.exit(0);
}
