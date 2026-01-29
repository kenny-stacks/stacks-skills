# Stacks Skills

## What This Is

A shareable Claude Code plugin for Stacks blockchain development. An orchestrator skill coordinates specialized skills that cover the entire development lifecycle: from contract design through TDD, fuzz testing, coverage enforcement, and React/Next.js frontend integration.

The skills enforce a rigorous quality workflow: pseudo code first, tests before implementation, property-based fuzzing, and a 90%+ coverage gate.

## Core Value

Enable developers to build high-quality Clarity smart contracts through enforced TDD workflow and comprehensive testing (unit + fuzz), with seamless frontend integration.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Orchestrator skill (`stacks`) that understands the full workflow and routes to appropriate specialized skills
- [ ] `clarity-design` skill for pseudo code, logic flow design, and best practices review
- [ ] `clarity-contract` skill for writing Clarity code following established patterns
- [ ] `clarity-unit-tests` skill for TDD with Clarinet SDK
- [ ] `clarity-fuzz` skill for Rendezvous property-based and invariant testing
- [ ] `clarity-coverage` skill for coverage analysis and 90%+ enforcement
- [ ] `clarinet` skill for CLI commands, project setup, devnet, and deployment
- [ ] `stacks-frontend` skill for React/Next.js + Stacks.js wallet and contract integration
- [ ] Skills reference Stacks docs, Clarity Book, and Rendezvous docs as authoritative sources
- [ ] Quality gates enforced at each phase transition

### Out of Scope

- Mobile app development — web-first with React/Next.js
- Specific token standards (SIP-009, SIP-010) as primary focus — general patterns first, standards can be added later
- Other frontend frameworks (Vue, Svelte) — React/Next.js only for v1
- Mainnet deployment automation — devnet and testnet focus for safety

## Context

### The Development Workflow

The skills enforce this rigorous workflow:

1. **Design Phase** — Understand best practices, write pseudo code to deeply understand logic flow
2. **Unit Tests First (TDD)** — Write comprehensive test suite using Clarinet SDK before any contract code
3. **Contract Implementation** — Write Clarity code to pass the tests
4. **Fuzz Testing** — Add property-based and invariant tests using Rendezvous
5. **Coverage Gate** — Verify 90%+ test coverage before proceeding
6. **Frontend Integration** — Connect contract to React/Next.js app with Stacks.js

### Key Technologies

**Clarity** — Smart contract language for Stacks
- Response types, principals, FT/NFT operations
- 128-bit integers (int/uint), buffers, strings
- Maps, data variables, traits

**Clarinet** — Development toolkit
- `clarinet new` — project scaffolding
- `clarinet contracts new` — add contracts
- `clarinet check` — syntax and type validation
- `clarinet console` — interactive REPL
- `clarinet devnet start` — local development network
- `clarinet deployments` — deployment management

**Rendezvous** — Fuzz testing framework
- Property-based tests (`test-` prefix, return `(ok true)`)
- Invariant tests (`invariant-` prefix, read-only, return bool)
- Automatic input generation and shrinking
- Dialers for custom pre/post execution logic

**Stacks.js** — Frontend libraries
- `@stacks/connect` — wallet integration
- `@stacks/transactions` — transaction building
- `@stacks/network` — network configuration

### Best Practices (from Clarity Book)

**Coding Style:**
- Eliminate unnecessary `begin` blocks (runtime cost)
- Use sequential `let` bindings effectively
- Prefer meaningful error codes over `unwrap-panic`
- Replace nested conditionals with `asserts!` or `try!`
- Simplify unnecessary `match` expressions

**Storage:**
- Store hashes, not voluminous data
- Use `at-block` for historical queries instead of storing snapshots
- Minimize storage — users pay per byte

**Upgradability:**
- Modular architecture — separate logic from data storage
- Stateless logic contracts
- Dynamic principal references (data vars, not constants)
- Privileged owner pattern for authorization
- Multi-principal authorization for safety

### Authoritative Sources

- **Stacks Docs**: https://docs.stacks.co/ — Clarity reference, Clarinet CLI, Stacks.js
- **Clarity Book**: https://book.clarity-lang.org/ — patterns, best practices, tutorials
- **Rendezvous Docs**: https://stacks-network.github.io/rendezvous/ — fuzz testing

## Constraints

- **Skill Format**: Must follow Claude Code skill specification (SKILL.md + supporting files)
- **Plugin Structure**: Shareable as a Claude Code plugin others can install
- **Source of Truth**: Skills reference official docs, don't duplicate large reference material
- **Coverage Gate**: 90%+ test coverage required before frontend integration phase

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Orchestrator + specialized skills | Allows automatic invocation of right skill for each phase | — Pending |
| React/Next.js only for frontend | Most common Stacks frontend stack, reduces scope | — Pending |
| General patterns over specific standards | More broadly applicable, standards can layer on top | — Pending |
| 90% coverage gate | Enforces quality without being unreachable | — Pending |

---
*Last updated: 2026-01-29 after initialization*
