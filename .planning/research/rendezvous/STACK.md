# Stack Research: Rendezvous Fuzz Testing

**Project:** Stacks Skills v1.1 - Fuzz Testing Integration
**Researched:** 2026-02-03
**Confidence:** HIGH

## Summary

Rendezvous fuzz testing requires minimal stack additions. The `@stacks/rendezvous` package (v0.13.1) is a standalone CLI tool that integrates directly with existing Clarinet projects. It bundles all required dependencies including fast-check, @stacks/clarinet-sdk, and @stacks/transactions. No changes to the existing Vitest-based unit testing stack are required - fuzz tests run independently via `npx rv` commands and complement rather than replace unit tests.

## Stack Additions

| Component | Version | Purpose | Integration Point |
|-----------|---------|---------|-------------------|
| `@stacks/rendezvous` | 0.13.1 | Property-based fuzz testing CLI for Clarity contracts | Standalone CLI, uses existing Clarinet project structure |
| fast-check | ^4.3.0 | Property-based testing framework (bundled dependency) | Automatically included, no direct installation needed |
| Node.js | 20, 22, or 24 | Runtime requirement for Rendezvous | Existing Node.js installation (already required for Vitest) |

## Installation

```bash
# Add as dev dependency (recommended for skill guidance)
npm install -D @stacks/rendezvous

# Or use directly via npx (no installation needed)
npx @stacks/rendezvous <clarinet-project> <contract-name> <type>
```

**Recommendation:** Install as dev dependency for consistency with existing Vitest/testing workflow and to lock version for reproducibility.

## Integration Notes

### Complementary to Existing Stack

Rendezvous adds a NEW testing capability without modifying the existing stack:

**Existing Unit Testing (unchanged):**
- Vitest v8+ with @vitest/coverage-v8
- @hirosystems/clarinet-sdk ^3.x
- @stacks/transactions ^7.x
- Tests in `.test.ts` files
- 90% coverage gate enforcement

**New Fuzz Testing (added):**
- Rendezvous CLI via `npx rv`
- Property-based tests defined in `.tests.clar` files
- Invariant tests defined as read-only functions in contracts
- Separate execution workflow from unit tests

### Project Structure Integration

Rendezvous expects standard Clarinet project structure (already validated in v1.0):

```
my-clarinet-project/
├── Clarinet.toml              # Existing
├── contracts/                 # Existing
│   ├── my-contract.clar       # Existing contract
│   └── my-contract.tests.clar # NEW - Rendezvous property tests
├── tests/                     # Existing
│   └── my-contract.test.ts    # Existing Vitest unit tests
└── settings/
    └── Devnet.toml            # Existing
```

**Key insight:** Fuzz tests live alongside contracts in `.tests.clar` files, NOT in the `tests/` directory with unit tests. This separation is intentional and clean.

### Workflow Integration

Rendezvous fits into the existing TDD workflow as an ADDITIONAL verification step:

1. **Design Phase** (existing) - Define contract interface
2. **Tests Phase** (existing) - Write Vitest unit tests
3. **Implementation** (existing) - Write Clarity contract
4. **Verification Phase** (existing) - Enforce 90% coverage with Vitest
5. **Fuzz Testing Phase** (NEW) - Add property-based tests with Rendezvous
6. **Frontend Phase** (existing) - React/Next.js integration

### CLI Usage Pattern

```bash
# Unit tests (existing)
npm run test:coverage

# Property-based fuzz tests (new)
npx rv . my-contract test

# Invariant fuzz tests (new)
npx rv . my-contract invariant
```

### Dependency Overlap (No Conflicts)

Rendezvous bundles its own dependencies, preventing version conflicts:

| Package | Vitest Stack | Rendezvous Stack | Conflict? |
|---------|--------------|------------------|-----------|
| @stacks/transactions | ^7.2.0+ | ^7.2.0 (bundled) | NO - compatible versions |
| @stacks/clarinet-sdk | ^3.x | ^3.12.0 (bundled) | NO - compatible versions |
| fast-check | Not used | ^4.3.0 (bundled) | NO - new dependency |

**Result:** Zero conflicts. Rendezvous dependencies are bundled, not peer dependencies.

### Node.js Version Requirements

Rendezvous supports Node.js 20, 22, and 24 (other versions untested). This aligns with existing Vitest requirements which support similar versions.

**Validation:** No stack changes needed for Node.js compatibility.

## What NOT to Add

### Do NOT Add: fast-check as Direct Dependency

**Why:** Fast-check ^4.3.0 is bundled within @stacks/rendezvous. Adding it separately:
- Creates version conflict risk if Rendezvous updates its bundled version
- Adds unnecessary package.json noise
- Provides no benefit (Rendezvous abstracts fast-check usage)

**Instead:** Use Rendezvous CLI exclusively. If developers need custom fast-check arbitraries, define them in `.tests.clar` files using Clarity syntax, not TypeScript.

### Do NOT Add: Separate Test Runner Configuration

**Why:** Rendezvous is a standalone CLI tool, not a test runner plugin. It:
- Doesn't integrate with Vitest/Jest/Mocha
- Doesn't share configuration files
- Runs independently via `npx rv` commands

**Instead:** Document two separate testing workflows (unit tests via Vitest, fuzz tests via Rendezvous) and clarify when to use each.

### Do NOT Add: @stacks/clarinet-sdk or @stacks/transactions Again

**Why:** These packages are already installed for Vitest unit testing. Rendezvous bundles its own copies internally. Adding them again:
- Is redundant (already in package.json)
- Risks version drift if updated separately
- Provides no benefit

**Instead:** Use existing installations. Rendezvous accesses Clarinet project structure via filesystem, not package imports.

### Do NOT Add: TypeScript Type Definitions for Rendezvous

**Why:** Rendezvous is a CLI tool, not a library. There are no TypeScript APIs to type. Fuzz tests are written in Clarity (`.tests.clar`), not TypeScript.

**Instead:** Document Clarity test syntax and provide examples of property-based test patterns in Clarity.

### Do NOT Add: Coverage Reporter Integration

**Why:** Rendezvous measures "shrinking" (minimal failing examples) and property satisfaction, NOT code coverage. Attempting to integrate with Vitest coverage:
- Measures wrong metrics (fuzz tests measure property compliance, not line coverage)
- Creates false confidence (high coverage ≠ property satisfaction)
- Conflicts with Rendezvous' output format

**Instead:** Maintain separate quality gates - 90% coverage for unit tests (Vitest), property satisfaction for fuzz tests (Rendezvous).

### Do NOT Add: Jest or Other Test Frameworks

**Why:** The project already uses Vitest for unit tests. Adding Jest because Rendezvous' internal tests use Jest:
- Is a misunderstanding (Rendezvous uses Jest internally to test itself, not for Clarity contract testing)
- Creates framework fragmentation
- Provides no value to end users

**Instead:** Continue using Vitest for unit tests. Rendezvous is a black box CLI tool - its internal test framework is irrelevant.

## Dependencies Bundled by Rendezvous

For reference, these are ALREADY included in @stacks/rendezvous and should NOT be added separately:

```json
{
  "@iarna/toml": "^2.2.5",
  "@stacks/clarinet-sdk": "^3.12.0",
  "@stacks/transactions": "^7.2.0",
  "ansicolor": "^2.0.3",
  "fast-check": "^4.3.0",
  "yaml": "^2.8.1"
}
```

## Current fast-check Version Check

Latest fast-check (as of 2026-02-03): 4.5.3
Rendezvous bundles: ^4.3.0

**Analysis:** Minor version lag is acceptable. Rendezvous will update fast-check in future releases. No action needed - the bundled version supports all current property-based testing features.

## Validation

Verified via official sources:

- [x] Package name and version confirmed via `npm view @stacks/rendezvous`
- [x] Dependencies extracted via `npm view @stacks/rendezvous dependencies`
- [x] Node.js requirements confirmed via GitHub README
- [x] Integration pattern verified via Rendezvous documentation
- [x] No peer dependencies confirmed via `npm view @stacks/rendezvous peerDependencies`

## Sources

### Primary Sources (HIGH Confidence)

- [Rendezvous GitHub Repository](https://github.com/stacks-network/rendezvous) - Official source code, README, version 0.13.1 release notes (Dec 24, 2025)
- [Rendezvous Official Documentation](https://stacks-network.github.io/rendezvous/) - Authoritative guide to property-based testing with Rendezvous
- npm registry query results - Live package data via `npm view @stacks/rendezvous` (0.13.1, dependencies, metadata)

### Secondary Sources (MEDIUM Confidence)

- [Clarity Property-Based Testing Primer](https://blog.nikosbaxevanis.com/2022/03/05/clarity-property-based-testing-primer/) - Early conceptual overview of property-based testing for Clarity
- Stacks ecosystem documentation references - General integration patterns

### Search Context

- WebSearch queries performed with year "2026" for currency
- All technical specifications verified against npm registry and GitHub repository
- No deprecated or outdated sources consulted
