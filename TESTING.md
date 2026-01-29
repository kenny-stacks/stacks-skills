# Manual Verification Steps

After plugin installation, verify the following in a new Claude Code session:

## Installation

Install the plugin locally:
```bash
claude plugins add /Users/kenny/Code/stacks-skills
```

Or after git push, install from GitHub:
```bash
claude plugins add https://github.com/username/stacks-skills
```

## Verification Steps

1. **Plugin appears in help menu:**
   - Type `/help` in Claude Code
   - Verify `stacks-skills:stacks-dev` appears in the skills list

2. **Skill auto-activates on keywords:**
   - Start a new message with: "I want to build a Clarity contract"
   - Verify the skill automatically loads (Claude should respond with Stacks/Clarity-specific guidance)

3. **Skill can be invoked directly:**
   - Type `/stacks-skills:stacks-dev`
   - Verify the skill activates and provides guidance

## Expected Behavior

- **Name:** stacks-dev
- **Description:** Shows guidance for Clarity smart contract development using TDD
- **Allowed tools:** Read, Write, Edit, Bash, Grep, Glob
- **Auto-activation keywords:** Stacks, Clarity, Clarinet

## Plugin Structure

```
stacks-skills/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
└── skills/
    └── stacks-dev/
        ├── SKILL.md          # Skill entrypoint with YAML frontmatter
        ├── references/       # Progressive disclosure references
        ├── scripts/          # Executable scripts
        └── assets/           # Templates and static files
```

## Validation

The plugin has been validated with `skills-ref`:
```bash
skills-ref validate ./skills/stacks-dev
# Output: Valid skill: ./skills/stacks-dev
```

All required YAML frontmatter fields are present:
- name: stacks-dev
- description: Stacks blockchain development assistant...
- license: Apache-2.0
- allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
- metadata: {author, version}
