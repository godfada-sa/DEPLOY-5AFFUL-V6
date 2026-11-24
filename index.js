#!/usr/bin/env node
'use strict';

// Upload this one file on a fresh Node.js panel: node index.js is already the


// ==========================================================================
//  YOUR SESSION IDS (optional)
//
//  Pair each number at https://fiveafful-pair.onrender.com and paste the IDs
//  between the backticks, one per line. The first one is the main bot.
//  For a second number write a name first:  shop=TFX-XXXX-XXXX-XXXX
//  (without a name it becomes account2). Example:
//
//     const SESSION_IDS = `
//     TFX-K7M2-9QXA-4BNP
//     TFX-AB2C-DE3F-GH4J // for 2nd device
//     `;
//
//  Paste and start within 5 minutes: the site's IDs expire after 5 minutes.
//  On start these IDs are copied into session_id.txt; IDs already there are
//  kept, and only the missing ones are added. Leave this empty to use only
//  session_id.txt.
// ==========================================================================
const SESSION_IDS = `

`;

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

const ARCHIVE_URL = (process.env.BOT_ARCHIVE_URL || 'https://github.com/godfada-sa/5AFFUL-BOT-V6').trim();
const PAIR_SITE = (process.env.PAIR_SITE_URL || 'https://fiveafful-pair.onrender.com').trim();
const ROOT = __dirname;
const MARKER = path.join(ROOT, 'data', '.installed.json');
const FORCE = process.argv.includes('--update') || process.argv.includes('--reinstall') || process.env.BOT_FORCE_INSTALL === '1';
const NO_START = process.env.BOT_NO_START === '1';
const SKIP_NPM = process.env.BOT_SKIP_NPM === '1';
const CHILD = process.env.FLASH_CHILD === '1';
const MAX_DOWNLOAD = 200 * 1024 * 1024;
const MAX_UNPACKED = 500 * 1024 * 1024;

// What must be on disk before the bot can start.
const CORE_FILES = [
  'package.json',
  'supervisor.js',
  'launcher.js',
  path.join('commands', 'menu.js'),
  path.join('whatsapp', 'audiosticker.js'),
];

// Files that belong to the panel user, never to the download.
const PROTECTED = [
  /^config\.env$/i,
  /^\.env$/i,
  /^session(\/|$)/i,
  /^data(\/|$)/i,
  /^accounts(\/|$)/i,
  /^accounts\.json$/i,
  /^session_id\.txt$/i,
  /\.log$/i,
];

const log = (text) => console.log(`[install] ${text}`);
const fail = (text) => {
  console.error(`\n[install] ${text}\n`);
  process.exit(1);
};

// ----- session IDs pasted in SESSION_IDS above (same rules as core/sessionid.js) -----
const ID_RE = /^TFX-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
const SESSION_FILE = path.join(ROOT, 'session_id.txt');

function normalizeId(raw) {
  let id = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (id.startsWith('TFX')) id = id.slice(3);
  if (id.length !== 12) return null;
  const full = `TFX-${id.slice(0, 4)}-${id.slice(4, 8)}-${id.slice(8, 12)}`;
  return ID_RE.test(full) ? full : null;
}

// one ID per line:  TFX-...,  SESSION_ID=TFX-...,  shop=TFX-...,  SESSION_ID_SHOP=TFX-...
// lines starting with # or // are notes; doubles are ignored
function sessionIdsFrom(text) {
  const out = [];
  const seen = new Set();
  for (const line of String(text || '').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('//')) continue;
    const m = /^(?:export\s+)?([A-Za-z0-9_-]+)\s*[=:]\s*(.+)$/.exec(t);
    const id = normalizeId(m ? m[2].replace(/^["'`]+|["'`]+$/g, '').trim() : t);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    let label = '';
    if (m) {
      const key = m[1].toLowerCase();
      const fromVar = /^session_id_([a-z0-9_-]+)$/.exec(key);
      if (fromVar) label = fromVar[1];
      else if (key !== 'session_id' && key !== 'sessionid' && key !== 'id') label = key;
    }
    out.push({ id, label: label && label !== 'main' ? label : '' });
  }
  return out;
}

function sessionFileHeader() {
  return [
    '# 5AFFUL V6 SESSION ID',
    '# One session ID per line. The first line is the main bot.',
    '# A second number: write a name first, e.g.  shop=TFX-XXXX-XXXX-XXXX',
    '# (without a name the bot calls it account2).',
    `# Get the IDs at ${PAIR_SITE} - they expire after 5 minutes.`,
    '',
  ].join('\n');
}

function readSessionFile() {
  try {
    return fs.readFileSync(SESSION_FILE, 'utf8');
  } catch (err) {
    return '';
  }
}

// the IDs from SESSION_IDS go into session_id.txt: kept as they are, only new ones are added
function portSessionIds() {
  const ids = typeof SESSION_IDS === 'undefined' ? [] : sessionIdsFrom(SESSION_IDS);
  if (!ids.length) return;
  const current = readSessionFile();
  const there = new Set(sessionIdsFrom(current).map((e) => e.id));
  const missing = ids.filter((e) => !there.has(e.id));
  if (!missing.length) {
    log(`the ${ids.length} session ID(s) in ${path.basename(__filename)} are already in session_id.txt`);
    return;
  }
  const lines = missing.map((e) => `${e.label ? `${e.label}=` : 'SESSION_ID='}${e.id}`);
  const text = there.size ? `${current.replace(/\s*$/, '')}\n${lines.join('\n')}\n` : `${sessionFileHeader()}${lines.join('\n')}\n`;
  try {
    fs.mkdirSync(ROOT, { recursive: true });
    fs.writeFileSync(SESSION_FILE, text);
    log(`wrote ${missing.length} session ID(s) from ${path.basename(__filename)} to session_id.txt`);
  } catch (err) {
    log(`could not write session_id.txt: ${err.message}`);
  }
}


function readMarker() {
  try {
    return JSON.parse(fs.readFileSync(MARKER, 'utf8'));
  } catch (err) {
    return null;
  }
}

function writeMarker(data) {
  try {
    fs.mkdirSync(path.dirname(MARKER), { recursive: true });
    fs.writeFileSync(MARKER, JSON.stringify(data, null, 2));
  } catch (err) {
    log(`could not write ${MARKER}: ${err.message}`);
  }
}

function installed() {
  return CORE_FILES.every((file) => fs.existsSync(path.join(ROOT, file)));
}

function candidates(url) {
  const repo = url.match(/^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/?#]+)\/?$/);
  if (!repo) return [url];
  const base = `https://codeload.github.com/${repo[1]}/${repo[2]}/tar.gz/refs/heads`;
  return [`${base}/main`, `${base}/master`];
}

function download(url, redirects = 0) {
  if (url.startsWith('file://')) {
    try {
      return Promise.resolve(fs.readFileSync(new URL(url)));
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const request = client.get(url, { headers: { 'user-agent': '5afful-bootstrap', 'accept-encoding': 'identity' } }, (response) => {
      const location = response.headers.location;
      if (response.statusCode >= 300 && response.statusCode < 400 && location) {
        response.resume();
        if (redirects > 6) return reject(new Error('too many redirects'));
        resolve(download(new URL(location, url).toString(), redirects + 1));
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      let total = 0;
      response.on('data', (chunk) => {
        total += chunk.length;
        if (total > MAX_DOWNLOAD) {
          request.destroy();
          reject(new Error('the archive is too large'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    request.on('error', reject);
    request.setTimeout(120000, () => request.destroy(new Error('download timed out')));
  });
}

async function fetchArchive(url) {
  let last = null;
  for (const candidate of candidates(url)) {
    try {
      return await download(candidate);
    } catch (err) {
      last = err;
    }
  }
  throw last || new Error('download failed');
}

function text(buffer, start, length) {
  const end = buffer.indexOf(0, start);
  const stop = end === -1 || end > start + length ? start + length : end;
  return buffer.toString('utf8', start, stop);
}

function paxPath(payload) {
  const lines = payload.toString('utf8').split('\n');
  let found = null;
  for (const line of lines) {
    const match = line.match(/^\d+ path=(.*)$/);
    if (match) found = match[1];
  }
  return found;
}

function octal(buffer, start, length) {
  const raw = text(buffer, start, length).trim();
  return raw ? parseInt(raw, 8) || 0 : 0;
}

function parseTar(raw) {
  const buffer = raw[0] === 0x1f && raw[1] === 0x8b
    ? zlib.gunzipSync(raw, { maxOutputLength: MAX_UNPACKED })
    : raw;
  const entries = [];
  let offset = 0;
  let extended = null;
  let longName = null;

  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const size = octal(header, 124, 12);
    if (offset + 512 + size > buffer.length) break;
    const payload = buffer.subarray(offset + 512, offset + 512 + size);
    const type = String.fromCharCode(header[156] || 48);
    offset += 512 + Math.ceil(size / 512) * 512;

    if (type === 'x' || type === 'X') {
      extended = paxPath(payload) || extended;
      continue;
    }
    if (type === 'g') continue;
    if (type === 'L') {
      longName = text(payload, 0, payload.length);
      continue;
    }
    if (type === 'K') continue;

    const name = text(header, 0, 100);
    const prefix = text(header, 345, 155);
    const full = extended || longName || (prefix ? `${prefix}/${name}` : name);
    extended = null;
    longName = null;

    if (type !== '0' && type !== '\0') continue;
    entries.push({ name: full, data: payload });
  }
  return entries;
}

function parseZip(buffer) {
  let end = -1;
  for (let index = buffer.length - 22; index >= Math.max(0, buffer.length - 65558); index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) {
      end = index;
      break;
    }
  }
  if (end < 0) throw new Error('not a tar.gz and not a readable zip');
  const count = buffer.readUInt16LE(end + 10);
  const start = buffer.readUInt32LE(end + 16);
  if (start === 0xffffffff || count === 0xffff) throw new Error('zip64 archives are not supported; use tar.gz');

  const entries = [];
  let pointer = start;
  for (let index = 0; index < count; index += 1) {
    if (buffer.readUInt32LE(pointer) !== 0x02014b50) throw new Error('broken zip directory');
    const method = buffer.readUInt16LE(pointer + 10);
    const compressed = buffer.readUInt32LE(pointer + 20);
    const plain = buffer.readUInt32LE(pointer + 24);
    const nameLength = buffer.readUInt16LE(pointer + 28);
    const extraLength = buffer.readUInt16LE(pointer + 30);
    const commentLength = buffer.readUInt16LE(pointer + 32);
    const local = buffer.readUInt32LE(pointer + 42);
    const name = buffer.toString('utf8', pointer + 46, pointer + 46 + nameLength);
    pointer += 46 + nameLength + extraLength + commentLength;
    if (name.endsWith('/')) continue;
    if (plain > MAX_UNPACKED) throw new Error(`${name} is too large`);

    if (buffer.readUInt32LE(local) !== 0x04034b50) throw new Error('broken zip entry');
    const localName = buffer.readUInt16LE(local + 26);
    const localExtra = buffer.readUInt16LE(local + 28);
    const data = buffer.subarray(local + 30 + localName + localExtra, local + 30 + localName + localExtra + compressed);
    if (method === 0) entries.push({ name, data });
    else if (method === 8) entries.push({ name, data: zlib.inflateRawSync(data, { maxOutputLength: MAX_UNPACKED }) });
    else throw new Error(`${name}: unsupported zip compression`);
  }
  return entries;
}

function normalizeName(name) {
  let out = String(name || '').replace(/\\/g, '/').replace(/^\.\/+/, '');
  while (out.startsWith('/')) out = out.slice(1);
  if (!out || out.endsWith('/')) return null;
  if (out.split('/').includes('..')) return null;
  if (/^[a-zA-Z]:/.test(out)) return null;
  return out;
}

function unpack(entries) {
  const named = entries
    .map((entry) => ({ name: normalizeName(entry.name), data: entry.data }))
    .filter((entry) => entry.name);

  const first = named.length ? named[0].name.split('/')[0] : '';
  const singleRoot = first && named.every((entry) => entry.name.startsWith(`${first}/`)) && !named.some((entry) => !entry.name.includes('/'));

  const written = [];
  const kept = [];
  for (const entry of named) {
    const name = singleRoot ? entry.name.slice(first.length + 1) : entry.name;
    if (!name) continue;
    if (PROTECTED.some((rule) => rule.test(name))) {
      kept.push(name);
      continue;
    }
    const target = path.join(ROOT, name);
    if (target !== ROOT && !target.startsWith(ROOT + path.sep)) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, entry.data);
    written.push(name);
  }
  return { written, kept };
}

function lockHash() {
  try {
    return require('crypto').createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'package-lock.json'))).digest('hex');
  } catch (err) {
    return null;
  }
}

function runNpm() {
  return new Promise((resolve, reject) => {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn(npm, ['install', '--omit=dev', '--no-audit', '--no-fund', '--loglevel=error'], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`npm install stopped with code ${code}`))));
  });
}

async function install() {
  const marker = readMarker();
  const present = installed();
  const needsFiles = FORCE || !present;

  if (!needsFiles) {
    // already installed: nothing to download, the bot starts right away
  } else {
    const link = ARCHIVE_URL;
    if (!/^https?:\/\//i.test(link) && !/^file:\/\//i.test(link)) {
      if (present) {
        log('no archive link set; using the installed files');
      } else {
        fail(
          'No download link yet.\n'
          + `   Open ${path.basename(__filename)} and put the link to 5afful-v6.tar.gz (or .zip)\n`
          + '   in ARCHIVE_URL, or run: BOT_ARCHIVE_URL=https://your-link node index.js'
        );
      }
    } else {
      log(`downloading ${link}`);
      const raw = await fetchArchive(link);
      log(`downloaded ${(raw.length / 1024 / 1024).toFixed(1)} MB`);
      const entries = raw[0] === 0x50 && raw[1] === 0x4b ? parseZip(raw) : parseTar(raw);
      if (!entries.length) fail('the archive is empty');
      const { written, kept } = unpack(entries);
      log(`installed ${written.length} files`);
      if (kept.length) log(`kept your own ${kept.length} file(s) (session, data, config)`);
      if (!installed()) fail('the archive did not contain the bot files (supervisor.js, package.json, commands/...)');
    }
  }

  const lock = lockHash();
  const modules = fs.existsSync(path.join(ROOT, 'node_modules'));
  const changed = lock && marker && marker.lock && marker.lock !== lock;
  if (!SKIP_NPM && (!modules || changed)) {
    log('installing dependencies (this can take a few minutes)');
    await runNpm();
    log('dependencies are ready');
  }

  writeMarker({
    installedAt: new Date().toISOString(),
    source: ARCHIVE_URL,
    lock,
    version: (() => {
      try {
        return require(path.join(ROOT, 'package.json')).version;
      } catch (err) {
        return null;
      }
    })(),
  });
}

function startBot() {
  process.chdir(ROOT);
  require(path.join(ROOT, 'supervisor.js'));
}

(async () => {
  const major = Number(process.versions.node.split('.')[0]);
  if (!Number.isFinite(major) || major < 20) {
    fail(`Node.js 20 or newer is required (this panel has ${process.versions.node}).`);
  }

  // a bot process started by the supervisor never installs anything: the files are already there
  if (CHILD) {
    startBot();
    return;
  }

  // IDs pasted in SESSION_IDS above go to session_id.txt first, so they survive
  // a failed download and the install never has to touch them again
  portSessionIds();

  await install();

  if (NO_START) {
    log('install finished; start it with: node index.js');
    return;
  }

  log('starting the bot');
  startBot();
})().catch((err) => {
  fail(err && err.message ? err.message : String(err));
});
