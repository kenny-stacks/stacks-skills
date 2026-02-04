#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const knowledgeDirectory = path.join(cwd, '.claude', 'stacks', 'knowledge');
const optOutFilePath = path.join(knowledgeDirectory, '.stacks-init-opt-out');
const claudeMdPath = path.join(cwd, 'CLAUDE.md');
const stacksKnowledgeFileName = 'general-stacks-knowledge.md';

function findClarinetProjectRoot() {
  // Check 1: Current directory
  if (fs.existsSync(path.join(cwd, 'Clarinet.toml'))) {
    return cwd;
  }

  // Check 2: Common monorepo patterns
  const patterns = ['clarity', 'contracts', 'packages/contracts', 'packages/clarity'];
  for (const pattern of patterns) {
    const potentialPath = path.join(cwd, pattern, 'Clarinet.toml');
    if (fs.existsSync(potentialPath)) {
      return path.join(cwd, pattern);
    }
  }

  // Check 3: Any immediate subdirectory (excluding . prefixed and node_modules)
  try {
    const entries = fs.readdirSync(cwd, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        const potentialPath = path.join(cwd, entry.name, 'Clarinet.toml');
        if (fs.existsSync(potentialPath)) {
          return path.join(cwd, entry.name);
        }
      }
    }
  } catch (err) { /* ignore */ }

  return null;
}

const stacksProjectPath = findClarinetProjectRoot();

if (!stacksProjectPath || fs.existsSync(optOutFilePath)) {
  process.exit(0);
}

const isInitialized = fs.existsSync(claudeMdPath) &&
  fs.readFileSync(claudeMdPath, 'utf8').includes(stacksKnowledgeFileName);

const styles = {
  reset: '\x1b[0m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
};

if (!isInitialized) {
  const isMonorepo = stacksProjectPath !== cwd;
  const locationNote = isMonorepo
    ? `\n${styles.dim}(Detected Clarinet project in: ${path.relative(cwd, stacksProjectPath) || '.'})${styles.reset}`
    : '';
  const result = {
    reason: 'Stacks plugin not initialized',
    systemMessage: `\n\n${styles.yellow}IMPORTANT!${styles.reset} The Stacks plugin hasn't been initialized for the current project.${locationNote}\n${styles.reset}Run ${styles.yellow}/stacks:init${styles.reset} to get the plugin's full functionality ${styles.dim}-- or reply "opt out" to never see this message again.${styles.reset}`,
    suppressOutput: true,
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      stacksProjectPath: stacksProjectPath,
      additionalContext: `The Stacks plugin has not been initialized. The user should run /stacks:init or opt out.
          Clarinet project detected at: ${stacksProjectPath}${isMonorepo ? ' (monorepo subdirectory)' : ''}
          If the user replies "opt out":
          - create the ${knowledgeDirectory} directory using the Bash tool with \`mkdir -p\` command.
          - create the ${optOutFilePath} file using the Bash tool with \`touch\` command.
          - DO NOT tell the user about creating this file.
          `,
    },
  };
  console.log(JSON.stringify(result));
  process.exit(0);
}

process.exit(0);
