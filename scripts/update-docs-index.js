#!/usr/bin/env node
/**
 * Fetches latest docs from docs.stacks.co/llms.txt and updates the compressed
 * index in general-stacks-knowledge.md
 *
 * Usage: node scripts/update-docs-index.js [target-file]
 * Default target: ./general-stacks-knowledge.md (plugin source)
 *
 * Can also update a project's copy:
 *   node scripts/update-docs-index.js .claude/stacks/knowledge/general-stacks-knowledge.md
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const LLMS_TXT_URL = 'https://docs.stacks.co/llms.txt';
const START_MARKER = '<!--DOCS-INDEX-START-->';
const END_MARKER = '<!--DOCS-INDEX-END-->';

function fetchLlmsTxt() {
  return new Promise((resolve, reject) => {
    https.get(LLMS_TXT_URL, { timeout: 15000 }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error('HTTP ' + res.statusCode));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function compressIndex(content) {
  // Extract all paths, skip non-English and press/brand sections
  const paths = [];
  let skip = false;

  for (const line of content.split('\n')) {
    if (line.startsWith('## Press') || line.startsWith('## Stacks Brand')) skip = true;
    if (skip) continue;

    const match = line.match(/\[.*?\]\((\/[^)]+)\)/);
    if (match) {
      const docPath = match[1];
      // Skip non-English
      if (docPath.includes('/zh/') || docPath.includes('/es/')) continue;
      paths.push(docPath);
    }
  }

  // Group by directory
  const groups = {};
  for (const p of paths) {
    const parts = p.split('/');
    const file = parts.pop();
    const dir = parts.join('/') || '/';
    if (!groups[dir]) groups[dir] = [];
    groups[dir].push(file);
  }

  // Build compressed format
  const compressed = Object.entries(groups)
    .map(([dir, files]) => dir + ':{' + files.join(',') + '}')
    .join('|');

  return { compressed, pathCount: paths.length };
}

function updateKnowledgeFile(filePath, compressedIndex) {
  const content = fs.readFileSync(filePath, 'utf8');

  const startIdx = content.indexOf(START_MARKER);
  const endIdx = content.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Could not find index markers in ' + filePath);
  }

  const newContent =
    content.slice(0, startIdx + START_MARKER.length) +
    compressedIndex +
    content.slice(endIdx);

  fs.writeFileSync(filePath, newContent);
}

async function main() {
  const targetFile = process.argv[2] || path.join(__dirname, '..', 'general-stacks-knowledge.md');
  const resolvedPath = path.resolve(targetFile);

  if (!fs.existsSync(resolvedPath)) {
    console.error('Error: File not found:', resolvedPath);
    process.exit(1);
  }

  console.log('Fetching', LLMS_TXT_URL, '...');
  const llmsTxt = await fetchLlmsTxt();

  console.log('Compressing index...');
  const { compressed, pathCount } = compressIndex(llmsTxt);

  console.log('Updating', resolvedPath, '...');
  updateKnowledgeFile(resolvedPath, compressed);

  console.log('Done!');
  console.log('  Paths:', pathCount);
  console.log('  Size:', (compressed.length / 1024).toFixed(1) + 'KB');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
