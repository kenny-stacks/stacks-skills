# /stacks:update-docs

Refresh the compressed documentation index by fetching the latest from docs.stacks.co/llms.txt.

## When to Use

- When the plugin suggests documentation may be outdated
- When you notice missing documentation paths
- Periodically to ensure the index is current

## Instructions

### Step 1: Run the Update Script

Run the update script to fetch and compress the latest docs index:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/update-docs-index.js" "${CLAUDE_PROJECT_ROOT}/.claude/stacks/knowledge/general-stacks-knowledge.md"
```

If the project knowledge file doesn't exist yet, update the plugin source instead:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/update-docs-index.js"
```

### Step 2: Confirm Update

Tell the user the results shown by the script (path count and size).

## Notes

- The script fetches from https://docs.stacks.co/llms.txt
- Non-English docs (zh, es) are filtered out
- Press/brand sections are excluded (not useful for development)
- The index is compressed into Vercel's format: `dir:{file1.md,file2.md,...}|dir2:{...}`
