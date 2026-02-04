#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const prompt = (input.prompt || '').toLowerCase();
const cwd = input.cwd;

// Check if this is a Stacks project (same logic as check-stacks-init.js)
function isStacksProject(dir) {
  if (fs.existsSync(path.join(dir, 'Clarinet.toml'))) return true;
  const patterns = ['clarity', 'contracts', 'packages/contracts', 'packages/clarity'];
  for (const pattern of patterns) {
    if (fs.existsSync(path.join(dir, pattern, 'Clarinet.toml'))) return true;
  }
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        if (fs.existsSync(path.join(dir, entry.name, 'Clarinet.toml'))) return true;
      }
    }
  } catch (err) { /* ignore */ }
  return false;
}

// Check if knowledge file exists
function getKnowledgePath(dir) {
  const knowledgePath = path.join(dir, '.claude', 'stacks', 'knowledge', 'general-stacks-knowledge.md');
  return fs.existsSync(knowledgePath) ? knowledgePath : null;
}

// Detect Stacks-related prompts
const stacksKeywords = [
  'clarity', 'contract', '.clar', 'stacks', 'clarinet',
  'stx', 'sip-010', 'sip-009', 'devnet', 'testnet',
  'post-condition', 'principal', 'define-public', 'define-read-only'
];

const isStacksRelatedPrompt = stacksKeywords.some(kw => prompt.includes(kw));
const isStacksProjectDir = isStacksProject(cwd);
const knowledgePath = getKnowledgePath(cwd);

// Only inject if: it's a Stacks project OR prompt mentions Stacks keywords, AND knowledge file exists
if ((isStacksProjectDir || isStacksRelatedPrompt) && knowledgePath) {
  const result = {
    additionalContext: `STACKS PROJECT DETECTED - MANDATORY FIRST STEP:

Before planning or executing ANY work in this Stacks project, you MUST read the knowledge file:
.claude/stacks/knowledge/general-stacks-knowledge.md

This file contains:
- Current Clarity best practices (your training data may be outdated)
- Testing patterns with Clarinet SDK
- Common mistakes and how to avoid them
- Frontend integration patterns

If you are creating a plan, include "Read Stacks knowledge file" as Step 1.
If you are executing, read this file before writing any code.

DO NOT SKIP THIS STEP - the knowledge file contains critical information that differs from your training data.`
  };
  console.log(JSON.stringify(result));
}

process.exit(0);
