#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const toolInput = input.tool_input || {};
const filePath = toolInput.file_path || '';

// Only trigger for Clarity files
if (!filePath.endsWith('.clar')) {
  process.exit(0);
}

const FUNCTIONS_URL = 'https://docs.stacks.co/reference/clarity/functions.md';

// Try to fetch the Clarity functions reference
let functionsDoc = '';
try {
  functionsDoc = execSync(`curl -s "${FUNCTIONS_URL}"`, {
    encoding: 'utf8',
    timeout: 5000
  });
} catch (err) {
  // If fetch fails, proceed with a warning
  functionsDoc = '';
}

let additionalContext;

if (functionsDoc && functionsDoc.length > 100) {
  additionalContext = `CLARITY FILE EDIT DETECTED - FUNCTION VERIFICATION REQUIRED:

You are editing a Clarity smart contract. ONLY use functions that exist in the official Clarity reference below.

RULES:
1. ONLY use functions documented below - do NOT invent functions
2. Verify argument types and order match the documentation
3. If a function you want doesn't exist below, it doesn't exist in Clarity

=== OFFICIAL CLARITY FUNCTIONS REFERENCE ===

${functionsDoc}

=== END REFERENCE ===

Use ONLY the functions documented above.`;
} else {
  additionalContext = `CLARITY FILE EDIT DETECTED - FUNCTION VERIFICATION REQUIRED:

You are editing a Clarity smart contract. Before proceeding:

1. Fetch the official Clarity functions reference: ${FUNCTIONS_URL}
2. ONLY use functions documented in that reference
3. Do NOT invent or assume functions exist
4. Verify argument types and order match the documentation

If a function you want to use is not in the official docs, it does not exist in Clarity.`;
}

const result = { additionalContext };
console.log(JSON.stringify(result));
process.exit(0);
