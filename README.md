# Stacks Skills

Claude Code skill for Stacks blockchain development with enforced test-driven development (TDD) workflow.

## Installation

```bash
npx skills add kenny-stacks/stacks-skills
```

## What's Included

**stacks-dev** - A development assistant that guides you through Clarity smart contract development using the Clarinet CLI toolkit.

### Features

- **Design-First Approach**: Define contract requirements, data structures, and public interfaces before coding
- **Test-Driven Development**: Write comprehensive tests before implementation (enforced)
- **Clarinet Integration**: Project scaffolding, testing, coverage analysis, and deployment
- **Quality Assurance**: 90%+ coverage verification and security review
- **Frontend Integration**: Connect contracts to web applications using Stacks.js

### Development Workflow

The skill enforces a 5-phase workflow:

1. **Design** - Define requirements, data structures, and function signatures
2. **Tests** - Write tests before implementation (TDD)
3. **Implementation** - Write Clarity code to pass tests
4. **Verification** - Coverage analysis and security review
5. **Frontend** - Web application integration with Stacks.js

## Usage

Once installed, the skill activates automatically when you mention:
- "Stacks" or "Stacks blockchain"
- "Clarity" or "Clarity smart contract"
- "Clarinet" or "Clarinet project"
- Working with `.clar` files or `Clarinet.toml`

## Requirements

- [Clarinet](https://github.com/hirosystems/clarinet) - Install via `brew install clarinet` (macOS) or download from releases
- Node.js for running tests with Vitest

## License

Apache-2.0
