import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, '../src/data/instagram.json');

const token = process.env.INSTAGRAM_ACCESS_TOKEN;
const userId = process.env.INSTAGRAM_USER_ID;

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

if (!token || !userId) {
  const existing = await readExisting();
  await writePayload({
    ...existing,
    updatedAt: new Date().toISOString()
  });
  console.log('Instagram fetch skipped: missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID');
  process.exit(0);
}

const fields = ['id', 'caption', 'media_type', 'media_url', 'thumbnail_url', 'permalink', 'timestamp'].join(',');
const url = `https://graph.instagram.com/${userId}/media?fields=${fields}&access_token=${token}`;

try {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Instagram API failed with status ${response.status}`);
  }

  const json = await response.json();
  const items = (json.data ?? []).slice(0, 12).map((item) => ({
    id: item.id,
    caption: item.caption ?? '',
    image: item.thumbnail_url ?? item.media_url,
    url: item.permalink ?? '',
    mediaType: item.media_type ?? '',
    timestamp: item.timestamp ?? ''
  }));

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
