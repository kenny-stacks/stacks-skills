# Stacks Claude Code Plugin

A Claude Code plugin that provides an optimal experience developing Clarity smart contracts and full-stack apps on the Stacks blockchain through curated access to docs, testing workflows, and best practices.

*Plugin structure inspired by [wasp-lang/claude-plugins](https://github.com/wasp-lang/claude-plugins)*

> **Starting a new project?** Use [stacks-starter](https://github.com/kenny-stacks/stacks-starter) — a template with Clarinet, Vitest, and Next.js pre-configured.

## Features

- **Stacks Documentation**: A compressed index of 270+ doc paths is always in context, ensuring Claude fetches current documentation before writing Clarity code. Updated on init, with staleness warnings after 30 days.
- **Stacks Knowledge**: Best practices, conventions, and common pitfalls imported to your project's CLAUDE.md
- **Testing Support**: Run Clarinet SDK + Vitest tests with automatic error diagnosis and coverage reporting
- **Deployment Guidance**: Guided deployment to testnet or mainnet with pre-flight checks and safety prompts
- **Development Environment**: Start Clarinet devnet and frontend dev servers with Chrome DevTools integration for full debugging visibility

## Installation

### Add the Stacks marketplace

```bash
/plugin marketplace add kenny-stacks/stacks-claude-plugin
```

### Install the Stacks plugin

```bash
/plugin install stacks@kenny-stacks-stacks-claude-plugin --scope project
```

> [!NOTE]
> We suggest installing the plugin at the `project` scope (`settings.json` are committed to git).
> Or by using the `local` scope (`settings.local.json` are not committed to git).

### Configure and Initialize the plugin

After installing, in an active session, run:
```bash
/stacks:init
```
- This will add Stacks knowledge to your project's CLAUDE.md file.

```
Run the 'start-dev-server' skill.
```
- This will start Clarinet devnet and your frontend dev server as background tasks so Claude can have full insight into both blockchain and frontend while developing/debugging.

Finally, to access more information about the plugin and its features, run:
```bash
/stacks:help
```
- This will show the plugin's features, commands, and skills.

## Commands

| Command | Description |
|---------|-------------|
| `/stacks:init` | Initialize the plugin - copies knowledge file, fetches fresh docs, updates CLAUDE.md |
| `/stacks:help` | Show available commands and features |
| `/stacks:expert-advice` | Get expert review of your Clarity contracts |
| `/stacks:update-docs` | Refresh the documentation index from docs.stacks.co |

### Skills

| Skill | When It Activates |
|-------|-------------------|
| **run-tests** | When you want to run tests or debug test failures |
| **deploy-contract** | When deploying contracts to testnet or mainnet |
| **start-dev-server** | When starting Clarinet devnet and frontend servers |

See [commands](./commands) and [skills](./skills) for full details.

## Recommended Permissions

For the best experience, add these permissions to your project or user settings:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(clarinet:*)",
      "Skill(stacks:*)",
      "WebFetch(domain:docs.stacks.co)",
      "WebFetch(domain:raw.githubusercontent.com)",
      "mcp__plugin_stacks_chrome-devtools__*"
    ]
  }
}
```

## Requirements

- **Clarinet**: `brew install clarinet` (macOS) or [download from releases](https://github.com/hirosystems/clarinet/releases)
- **Docker**: Required for running devnet
- **Node.js**: For running tests with Vitest

## License

MIT
