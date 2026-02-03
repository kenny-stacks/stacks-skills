# Phase 7: Stack Integration - Research

**Researched:** 2026-02-03
**Domain:** npm package integration and Node.js compatibility validation
**Confidence:** HIGH

## Summary

Phase 7 adds @stacks/rendezvous v0.13.1 to the project stack as a development dependency for fuzz testing capability. This is a straightforward npm package installation task with minimal integration complexity. Rendezvous is a standalone CLI tool that bundles all required dependencies internally (fast-check, @stacks/clarinet-sdk, @stacks/transactions), preventing version conflicts with the existing v1.0 Vitest-based unit testing stack. The package supports Node.js 20, 22, and 24 (LTS versions), aligning with current best practices for 2026 development environments.

Installation requires a single `npm install -D @stacks/rendezvous` command. Verification involves running `npx rv --version` to confirm the CLI is accessible and returns version 0.13.1. The phase establishes installation foundation only - actual fuzz testing workflow guidance is deferred to Phase 9.

**Primary recommendation:** Install as devDependency using `npm install -D @stacks/rendezvous@0.13.1` with explicit version pinning for reproducibility.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @stacks/rendezvous | 0.13.1 | Property-based fuzz testing CLI for Clarity contracts | Official Stacks ecosystem tool, maintained by stacks-network org, only Clarity-specific fuzzer available |
| Node.js | 20/22/24 LTS | Runtime environment for npm tooling | These are the current LTS versions with support through 2026-2027, required by Rendezvous |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| npm | 8.3.0+ | Package manager | Already installed with Node.js, needed for dependency resolution and overrides feature |
| npx | 7.0.0+ | Package executor | Bundled with npm 7+, executes Rendezvous CLI without global install |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @stacks/rendezvous | fast-check directly | Would require custom Clarity integration, lose Simnet support, and miss Clarity-specific features (context tracking, invariants). Not recommended. |
| npm install | Global install with `npm install -g` | Makes version management harder, not reflected in package.json, violates project-scoped dependency best practice |
| Explicit version | Range like `^0.13.0` | Allows minor version updates automatically, but risks breaking changes. Pin for reproducibility in testing tools. |

**Installation:**
```bash
# Recommended: Install as devDependency with explicit version
npm install -D @stacks/rendezvous@0.13.1

# Alternative: Install latest (not recommended for reproducibility)
npm install -D @stacks/rendezvous
```

## Architecture Patterns

### Recommended Project Structure
```
stacks-skills/
├── package.json              # Add @stacks/rendezvous to devDependencies
├── package-lock.json         # Locked dependency tree (auto-updated)
├── node_modules/
│   └── @stacks/
│       └── rendezvous/       # Installed package with bundled deps
└── skills/
    └── stacks-dev/
        └── SKILL.md          # Phase 9 will add fuzz testing guidance
```

**Note:** No Clarinet project structure changes needed. Rendezvous operates on existing Clarinet.toml projects.

### Pattern 1: DevDependency Installation
**What:** Install testing/development tools as devDependencies, not dependencies
**When to use:** For packages used only during development (testing, linting, building)
**Example:**
```json
{
  "devDependencies": {
    "@stacks/rendezvous": "0.13.1",
    "vitest": "^2.1.8",
    "@vitest/coverage-v8": "^2.1.8"
  }
}
```
**Why:** Keeps production dependencies lean, signals package purpose, excludes from production builds.

### Pattern 2: Version Pinning for Testing Tools
**What:** Use exact versions (no ^ or ~) for testing and fuzzing tools
**When to use:** Critical testing infrastructure where reproducibility matters
**Example:**
```json
{
  "devDependencies": {
    "@stacks/rendezvous": "0.13.1"  // Exact version, no caret
  }
}
```
**Why:** Ensures deterministic test behavior across environments, prevents unexpected breaking changes in CI/CD.

### Pattern 3: npx for CLI Execution
**What:** Execute CLI tools via `npx` instead of global installation
**When to use:** Any npm package that exposes a CLI binary
**Example:**
```bash
# Correct: Use npx to execute local package binary
npx rv . my-contract test

# Avoid: Global installation
npm install -g @stacks/rendezvous  # Not recommended
rv . my-contract test
```
**Why:** Uses project-scoped version, reflected in package.json, works in CI without manual global installs.

### Pattern 4: Post-Install Verification
**What:** Verify CLI accessibility after npm install
**When to use:** After installing any package that provides CLI commands
**Example:**
```bash
npm install -D @stacks/rendezvous@0.13.1
npx rv --version  # Should output: 0.13.1
```
**Why:** Confirms binary is correctly linked, detects installation issues early, validates npx resolution.

### Anti-Patterns to Avoid
- **Adding bundled dependencies separately:** Don't install fast-check, @stacks/clarinet-sdk, or @stacks/transactions again. Rendezvous bundles these internally to prevent version conflicts.
- **Range dependencies for fuzz tools:** Don't use `^0.13.0` or `~0.13.0`. Fuzz testing requires deterministic behavior across environments. Pin exact version.
- **Global installation:** Don't install globally with `-g` flag. Makes version management per-project impossible and violates modern npm best practices.
- **Production dependencies:** Don't add to `dependencies` section. Fuzz testing is development-only activity.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Verifying package installation | Custom scripts checking file existence | `npx rv --version` command | Standard npm/npx behavior, tests actual CLI execution path not just file presence |
| Node.js version validation | Manual version parsing | Document required versions in README, rely on package.json engines field | Node.js and npm have built-in version checking, manual validation fragile |
| Dependency conflict resolution | Manual package.json editing | npm's built-in conflict resolution, --legacy-peer-deps flag if needed | npm v8.3.0+ has overrides feature, better than manual intervention |
| Version locking | Committing node_modules | Use package-lock.json (npm) | Lock files capture full dependency tree deterministically, node_modules too large for git |

**Key insight:** npm ecosystem has mature tooling for dependency management. Hand-rolling validation or conflict resolution introduces fragility and maintenance burden.

## Common Pitfalls

### Pitfall 1: Installing Wrong Package Name
**What goes wrong:** Developers search for "rendezvous npm" and find `rendezvous` or `node-rendezvous` packages instead of `@stacks/rendezvous`
**Why it happens:** Generic "rendezvous" term has multiple npm packages (WebRTC signaling, networking libraries)
**How to avoid:** Use exact package name with scope: `@stacks/rendezvous`
**Warning signs:** Package description mentions WebRTC, networking, or non-Stacks topics. Check author is `stacks-network`.

### Pitfall 2: npx Command Not Found After Install
**What goes wrong:** Running `npx rv --version` returns "command not found" even after successful install
**Why it happens:** npx not installed (Node.js < 5.2.0), PATH issues, or package doesn't expose `rv` binary correctly
**How to avoid:**
- Verify npx exists: `npx --version` (should return 7.0.0+)
- Verify package installed: `ls node_modules/@stacks/rendezvous`
- Check package.json bin field exposes rv command
**Warning signs:** npm install succeeds with no errors, but npx can't find command

### Pitfall 3: Node.js Version Incompatibility
**What goes wrong:** Installation succeeds but `npx rv` fails with cryptic errors or doesn't run
**Why it happens:** Running unsupported Node.js version (< 20 or odd-numbered versions)
**How to avoid:**
- Verify Node.js version: `node --version`
- Ensure using LTS version (20, 22, or 24)
- Document Node.js requirement in installation instructions
**Warning signs:** "SyntaxError: Unexpected token", native module build failures, or runtime errors when executing rv

### Pitfall 4: Dependency Conflicts with Existing Stack
**What goes wrong:** npm install fails with ERESOLVE error about @stacks/transactions or clarinet-sdk version conflicts
**Why it happens:** Rendezvous bundles specific versions that conflict with existing package.json entries
**How to avoid:**
- Rendezvous bundles dependencies internally - conflicts should be rare
- If conflicts occur, use `npm install --legacy-peer-deps` or `npm install --force` flags
- Check if existing packages can upgrade to match Rendezvous requirements
**Warning signs:** npm shows peer dependency warnings, installation hangs on dependency resolution

### Pitfall 5: Forgetting to Document Node.js Compatibility
**What goes wrong:** Developers using older Node.js versions (16, 18) hit installation or runtime errors
**Why it happens:** Rendezvous requires Node.js 20+ but documentation doesn't clearly state this
**How to avoid:**
- Add Node.js version requirements prominently in installation instructions
- Consider adding engines field to package.json: `"engines": { "node": ">=20" }`
- Reference official Node.js LTS schedule for support timelines
**Warning signs:** Installation works on dev machine (Node 22) but fails in CI (Node 18)

### Pitfall 6: Version Mismatch Between Installation and Verification
**What goes wrong:** `npm install @stacks/rendezvous` installs latest (e.g., 0.14.0) but documentation expects 0.13.1
**Why it happens:** Not pinning version in install command, package updates between documentation writing and execution
**How to avoid:**
- Always specify exact version: `npm install -D @stacks/rendezvous@0.13.1`
- Use package-lock.json to lock all transitive dependencies
- Verify installed version matches expectation: `npx rv --version`
**Warning signs:** Success criteria check fails, version output doesn't match expected value

## Code Examples

Verified patterns from official sources:

### Installation with Verification
```bash
# Source: npm documentation + Rendezvous README
# Step 1: Install as devDependency with exact version
npm install -D @stacks/rendezvous@0.13.1

# Step 2: Verify installation succeeded
npx rv --version
# Expected output: 0.13.1

# Step 3: Verify package.json updated correctly
cat package.json | grep rendezvous
# Expected: "@stacks/rendezvous": "0.13.1" in devDependencies section
```

### Node.js Version Check (Pre-Installation)
```bash
# Source: Node.js documentation
# Check current Node.js version
node --version
# Expected: v20.x.x, v22.x.x, or v24.x.x

# If wrong version, use nvm to switch (if installed)
nvm use 22  # or 20, or 24
```

### Handling Dependency Conflicts (If They Occur)
```bash
# Source: npm CLI documentation
# Attempt normal installation first
npm install -D @stacks/rendezvous@0.13.1

# If ERESOLVE error occurs, try legacy peer deps mode
npm install -D @stacks/rendezvous@0.13.1 --legacy-peer-deps

# Last resort: force installation (use cautiously)
npm install -D @stacks/rendezvous@0.13.1 --force
```

### package.json Structure After Installation
```json
{
  "name": "stacks-skills",
  "version": "1.1.0",
  "devDependencies": {
    "@stacks/rendezvous": "0.13.1",
    "vitest": "^2.1.8",
    "@vitest/coverage-v8": "^2.1.8"
  }
}
```
**Note:** Existing Vitest entries remain unchanged. Rendezvous is additive, not replacing anything.

### Documentation Template for Node.js Requirements
```markdown
## Requirements

- [Clarinet](https://github.com/hirosystems/clarinet) - Install via `brew install clarinet` (macOS) or download from releases
- Node.js 20, 22, or 24 (LTS versions) - Verify with `node --version`
- npm 8.3.0 or higher - Verify with `npm --version`

**Note:** Node.js versions 20, 22, and 24 are Long Term Support (LTS) releases with active maintenance through 2026-2027. Other versions may work but are untested.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Global npm installations (`npm install -g`) | Project-scoped devDependencies with npx execution | npm 5.2.0 (2017) introduced npx | Better version control, reproducibility, no PATH pollution |
| Manual dependency resolution | npm overrides feature in package.json | npm 8.3.0 (2021) | Native solution for forcing dependency versions without external tools |
| Range versions for all dependencies | Exact versions for testing tools, ranges for libraries | Best practice evolution (2020s) | Testing tools need determinism, libraries benefit from patch updates |
| Node.js 16/18 as default | Node.js 20/22/24 LTS as recommended | Node 20 became LTS Oct 2023, Node 24 became LTS Oct 2025 | Modern features, longer support windows, better performance |

**Deprecated/outdated:**
- `npm install` without version specification: While still functional, best practice is explicit versioning for testing tools
- Node.js odd-numbered versions (21, 23, 25): Never recommended for production use, short support cycles
- `npm install -g` for project tools: Use project-scoped dependencies instead

## Open Questions

Things that couldn't be fully resolved:

1. **Does @stacks/rendezvous expose a --version flag?**
   - What we know: Standard npm CLI convention is to support --version flag
   - What's unclear: Rendezvous documentation doesn't explicitly document this flag
   - Recommendation: Test empirically after installation. If `npx rv --version` doesn't work, use `npm list @stacks/rendezvous` as fallback verification.

2. **Will there be dependency conflicts with existing v1.0 stack?**
   - What we know: Rendezvous bundles @stacks/transactions ^7.2.0 and @stacks/clarinet-sdk ^3.12.0 internally
   - What's unclear: If v1.0 project has these packages, will npm flag peer dependency conflicts?
   - Recommendation: Assume no conflicts (bundled deps are isolated). If conflicts occur during testing, document resolution strategy using --legacy-peer-deps flag.

3. **Should package.json include engines field for Node.js requirement?**
   - What we know: Rendezvous requires Node 20/22/24, but we don't control the project's package.json (it's a plugin)
   - What's unclear: Whether to recommend users add engines field in their Clarinet projects
   - Recommendation: Document Node.js requirements in installation instructions only. Don't modify project structure in Phase 7 - keep scope minimal.

4. **Is npm vs yarn vs pnpm compatibility guaranteed?**
   - What we know: Rendezvous likely targets npm (most common in Stacks ecosystem)
   - What's unclear: Whether yarn or pnpm users will encounter issues
   - Recommendation: Document npm-specific instructions. If users report yarn/pnpm issues in future, add alternative instructions then (YAGNI principle).

## Sources

### Primary (HIGH confidence)
- [GitHub - stacks-network/rendezvous](https://github.com/stacks-network/rendezvous) - Official repository, README with installation instructions
- [Rendezvous: The Clarity Fuzzer](https://stacks-network.github.io/rendezvous/) - Official documentation site
- [npm documentation - devDependencies](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file/) - Authoritative npm behavior
- [npm documentation - npx](https://docs.npmjs.com/cli/v8/commands/npx/) - npx command reference
- [Node.js Release Schedule](https://endoflife.date/nodejs) - LTS version support timelines
- [Node.js v22 to v24 Migration Guide](https://nodejs.org/en/blog/migrations/v22-to-v24) - Version compatibility information
- Local research: `/Users/kenny/Code/stacks-skills/.planning/research/rendezvous/STACK.md` - Prior v1.1 research confirming package details

### Secondary (MEDIUM confidence)
- [Understanding and Resolving npm Dependency Conflicts](https://dev.to/gentritbiba/understanding-and-resolving-npm-dependency-conflicts-a-developers-guide-3c33) - Dependency conflict patterns (2024)
- [A Developer's Guide to package.json Best Practices](https://www.encora.com/interface/a-developers-guide-to-package.json-best-practices-from-basics-to-mastery) - DevDependencies best practices (2025)
- [How to Fix npx Command Not Found](https://linuxhint.com/fix-npx-command-not-found/) - Troubleshooting npx issues
- WebSearch results for Rendezvous package name, installation commands, Node.js requirements (verified against official sources)

### Tertiary (LOW confidence)
- WebSearch results for general npm dependency conflicts - contextual background only, not Rendezvous-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Package name, version, and installation command verified via official GitHub README and npm registry
- Architecture: HIGH - npm devDependency patterns are well-established best practices with official documentation
- Pitfalls: MEDIUM - Common npm pitfalls derived from general experience, not Rendezvous-specific known issues (LOW documented issues suggest stable package)

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable package with infrequent updates, Node.js LTS stable through 2026)

**Notes:**
- Rendezvous 0.13.1 released Dec 24, 2025 (recent and stable)
- Phase 7 scope is intentionally minimal: just installation foundation
- Full fuzz testing workflow guidance deferred to Phase 9
- No code changes to existing skills/, only package.json modification
