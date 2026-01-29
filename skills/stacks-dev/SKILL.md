---
name: stacks-dev
description: Stacks blockchain development assistant. Guides Clarity smart contract development using test-driven development with Clarinet CLI. Use when working with Stacks, Clarity smart contracts, Clarinet projects, or when building applications on the Stacks blockchain.
license: Apache-2.0
metadata:
  author: "Stacks Skills Contributors"
  version: "0.1.0"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# Stacks Development Assistant

This skill provides comprehensive guidance for Stacks blockchain development, focusing on Clarity smart contract development with enforced test-driven development (TDD) workflow using the Clarinet CLI toolkit.

The skill assists developers through the complete lifecycle of smart contract development: from initial design and planning through test creation, implementation, verification, deployment, and frontend integration.

## Core Capabilities

- **Clarity Smart Contract Development**: Guide developers through writing secure, efficient Clarity contracts
- **Test-Driven Development**: Enforce TDD workflow with unit tests written before implementation
- **Clarinet CLI Integration**: Leverage Clarinet for project scaffolding, testing, and deployment
- **Quality Assurance**: Ensure high test coverage and proper verification before deployment
- **Frontend Integration**: Help integrate contracts with web applications using Stacks.js libraries

## Workflow

The skill guides developers through these phases:

1. **Design**: Define contract requirements, data structures, and public/read-only functions
2. **Test**: Write comprehensive unit tests that specify expected behavior
3. **Implement**: Write Clarity code to pass tests with proper error handling
4. **Verify**: Run tests, check coverage, perform security review
5. **Deploy**: Deploy to testnet/mainnet with proper configuration
6. **Integrate**: Connect contracts to frontend applications

## Usage

This skill automatically activates when you mention:
- "Stacks" or "Stacks blockchain"
- "Clarity" or "Clarity smart contract"
- "Clarinet" or "Clarinet project"

You can also explicitly activate it by referencing "stacks-dev" in your request.

## Additional Resources

Detailed reference documentation, testing guides, and code templates are available in the `references/`, `scripts/`, and `assets/` subdirectories. These resources are loaded on-demand to keep the core skill instructions concise while providing comprehensive guidance when needed.

## Quality Standards

This skill enforces high-quality development practices:
- All contracts must have corresponding unit tests
- Test coverage should be maximized before deployment
- All public functions must include proper error handling
- Contracts should follow Clarity best practices and security patterns

---

*This is a Phase 1 placeholder. Core workflow instructions and detailed guidance will be added in Phase 2.*
