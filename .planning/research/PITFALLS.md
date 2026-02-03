# Pitfalls Research: v1.1 Features

**Project:** stacks-skills v1.1 - Rendezvous Fuzz Testing & Trigger Expansion
**Domain:** Adding property-based fuzz testing to existing TDD workflow + expanding Claude Code skill auto-invocation
**Researched:** 2026-02-03
**Confidence:** MEDIUM-HIGH (based on official Rendezvous docs, Claude Code skill patterns, and 2026 community fuzz testing practices)

## Summary

Adding Rendezvous fuzz testing to an existing TDD-enforced workflow introduces two critical integration challenges: (1) **workflow sequencing** - where fuzz tests belong in the 5-phase TDD cycle, and (2) **test philosophy conflicts** - property-based testing requires different thinking than example-based unit tests. Expanding skill trigger keywords risks false positives where non-Stacks prompts incorrectly activate the skill, polluting context and degrading user experience. The key risks are: **forcing fuzz testing too early** in the workflow before unit tests stabilize properties, **conflating unit and fuzz test purposes**, **trigger keyword over-generalization** causing activation on generic blockchain/smart contract mentions, and **documentation bloat** from trying to explain both testing approaches in one skill.

## Critical Pitfalls

| Pitfall | Warning Signs | Prevention | Phase |
|---------|---------------|------------|-------|
| **Fuzz-Before-Design** - Running Rendezvous before properties are clearly defined, generating meaningless random tests | Fuzz tests that don't check meaningful invariants; "test everything" property definitions; confused users asking "what should I test?" | Define properties during Design phase (Phase 1). Document "table stakes" invariants (balance >= 0, supply constant). Fuzz tests come AFTER unit tests prove basic behavior. | Phase 1 (Design) + Phase 2 (Tests) integration |
| **TDD Confusion** - Treating fuzz tests as replacement for unit tests, breaking the RED-GREEN-REFACTOR cycle | Users skip unit tests and go straight to fuzzing; no concrete examples of expected behavior; implementation lacks clear requirements | **Fuzz tests complement, not replace unit tests.** Unit tests = concrete examples. Fuzz tests = universal properties. Always write unit tests first (TDD), then add fuzz tests for invariants. | Phase 2 (Tests) |
| **Trigger Over-Generalization** - Expanding keywords to include "blockchain" or "smart contract" causes false positives on Ethereum, Solana, other chains | Skill activates on "help me with Ethereum contract" or "Solana smart contract tutorial"; context pollution from irrelevant skill loading; users disable skill | Keep triggers **Stacks-specific**: "Stacks", "Clarity", "Clarinet". Add context: "Stacks blockchain", "Clarity smart contracts". Test against non-Stacks prompts. | Trigger expansion (v1.1 milestone) |
| **Property Definition Failure** - Writing properties that are too weak (always pass) or too strong (always fail), making fuzz tests useless | Rendezvous reports 100% success but properties test nothing; or 100% failure because property is impossible | Include property examples in documentation. Start with simple invariants: "balance never negative", "total supply constant after initialization". Test properties manually before fuzzing. | Phase 2 (Tests) + Phase 4 (Verification) |

## Moderate Pitfalls

| Pitfall | Prevention |
|---------|------------|
| **Workflow Integration Ambiguity** - Unclear when to run Rendezvous vs Vitest; users confused about phase transitions | Document clear workflow: **Phase 2: unit tests (Vitest)** → **Phase 3: implementation** → **Phase 4: coverage (Vitest) + fuzz testing (Rendezvous)**. Fuzz tests are verification, not TDD. |
| **Resource Consumption Shock** - Fuzz tests take minutes/hours vs seconds for unit tests; CI pipelines timeout; developers frustrated by slow feedback | Document expected runtime. Default `--runs 100` for development, `--runs 1000+` for CI. Run fuzz tests separately from unit tests. Consider `--bail` flag for faster failure. |
| **Seed Management Neglect** - Failing fuzz tests can't be reproduced because seed wasn't captured | Capture `--seed` value on failure. Document reproduction steps. Add to verification checklist: "Can you reproduce this fuzz failure?" |
| **Coverage Interpretation Conflict** - Conflating Vitest code coverage (90% threshold) with fuzz test coverage (input space exploration) | Clarify: **Vitest coverage** = lines executed. **Fuzz coverage** = state space explored. Both are needed. 90% Vitest coverage doesn't mean fuzz tests are comprehensive. |
| **Node.js Version Mismatch** - Rendezvous requires Node 20/22/24; users on Node 18 get cryptic errors | Check Node version in skill: "Rendezvous requires Node.js 20+. Current: [version]". Document version requirement in SKILL.md and reference files. |
| **Test File Organization Chaos** - Mixing unit tests and fuzz tests in same file; unclear separation of concerns | Separate files: `contract.test.ts` (unit tests), `contract.fuzz.clar` (fuzz properties). Document file naming convention. Load on-demand based on phase. |
| **Property Language Confusion** - Fuzz properties written in Clarity (runs on-chain) vs unit tests in TypeScript (off-chain); users mix syntax | Document clearly: **Unit tests = TypeScript/Vitest**. **Fuzz properties = Clarity read-only functions**. Show side-by-side examples. Reference files should be separate. |
| **False Positive Trigger on "test" Keyword** - Expanding triggers to "test smart contracts" activates on any testing question | Don't use generic testing keywords. Keep "Clarity", "Clarinet", "Stacks". Add negative context if needed. Test against: "how do I test this JavaScript function?" |
| **CLI Command Proliferation** - Adding `npx rv` alongside `clarinet test` and `npm run test:coverage`; users confused about which to run | Document command flow clearly. Create npm scripts: `test:unit`, `test:fuzz`, `test:all`. Show in verification checklist what each command validates. |

## Trigger Expansion Pitfalls

Specific risks when expanding skill description keywords to improve auto-invocation coverage.

### Pitfall: Generic Blockchain Keywords

**What goes wrong:** Adding "blockchain" or "smart contract" to skill description causes skill to activate on Ethereum, Solana, Cosmos questions.

**Why it happens:** Desire to catch users who say "I want to build a blockchain app" without mentioning Stacks specifically.

**Consequences:**
- Skill loads into context for irrelevant blockchain questions
- Stacks-specific guidance applied to wrong chains
- Context pollution (15,000 char budget wasted on wrong skill)
- User confusion: "Why is it talking about Clarity when I asked about Solidity?"
- Users disable skill permanently

**Prevention:**
- **Always pair generic terms with Stacks-specific context**
- Good: "Stacks blockchain development", "Clarity smart contracts on Stacks"
- Bad: "blockchain development", "smart contract testing"
- Test description against: "Help me deploy an Ethereum smart contract" (should NOT trigger)
- Test against: "How do I test Solidity contracts?" (should NOT trigger)

**Detection:**
- Users report skill activating on non-Stacks questions
- Context shows skill loaded for Ethereum/Solana/other chains
- High rate of skill load without skill usage
- Users explicitly ask: "Why are you talking about Stacks?"

**Phase:** Trigger expansion milestone (v1.1)

---

### Pitfall: "Testing" Keyword Ambiguity

**What goes wrong:** Adding "testing" or "test-driven development" to description causes activation on general testing questions.

**Why it happens:** Wanting to catch "how do I test my Stacks app?" prompts.

**Consequences:**
- Activates on "how to test React components", "Python unit testing", "TDD for microservices"
- Provides Clarinet-specific guidance for unrelated testing scenarios
- Users lose trust in auto-activation

**Prevention:**
- Combine testing terms with Stacks context: "Clarity contract testing with Clarinet"
- Don't use standalone "TDD" or "testing" in description
- Test against: "How do I write unit tests for my API?" (should NOT trigger)
- Current description is good: "test-driven development with Clarinet CLI"

**Detection:**
- Skill loads when user asks about testing non-Stacks code
- Clarinet commands suggested for non-Clarity projects

**Phase:** Trigger expansion milestone (v1.1)

---

### Pitfall: Overly Broad File Extension Triggers

**What goes wrong:** Suggesting skill auto-loads when user works with `.test.ts` files, causing activation on any TypeScript test file.

**Why it happens:** Rendezvous/Clarinet tests use TypeScript; want to activate when user edits test files.

**Consequences:**
- Skill loads for React tests, Node.js tests, any TS test file
- Clarinet/Stacks context pollutes non-Stacks projects
- Multi-project developers forced to disable skill

**Prevention:**
- Don't trigger on `.test.ts` alone - too generic
- DO trigger on `.clar` files (Clarity-specific)
- DO trigger on `Clarinet.toml` presence (Clarinet-specific)
- Consider: trigger on `.test.ts` files ONLY if `Clarinet.toml` exists in project
- Document in skill: "Auto-activates in Clarinet projects"

**Detection:**
- Skill loads in non-Clarinet projects with TypeScript tests
- Users working on multiple projects report unwanted activation

**Phase:** Trigger expansion milestone (v1.1)

---

### Pitfall: Activation on "Deploy" or "Production"

**What goes wrong:** Adding deployment keywords causes skill to load for any deployment question.

**Why it happens:** Want to help with Stacks contract deployment to mainnet/testnet.

**Consequences:**
- Activates on "deploy to AWS", "production database setup", "deploy Next.js app"
- Clarinet deployment patterns suggested for unrelated infrastructure

**Prevention:**
- Use "Stacks contract deployment", not "deployment"
- Current description doesn't include deployment - good
- If adding Phase 5 deployment triggers, be specific

**Detection:**
- Skill suggests Clarinet devnet for Vercel deployment
- AWS/Docker deployment prompts incorrectly trigger skill

**Phase:** Trigger expansion milestone (v1.1)

---

### Pitfall: Description Length Explosion

**What goes wrong:** Adding many keywords/phrases to description pushes skill over 1024 char limit or makes description too noisy.

**Why it happens:** Trying to cover every possible user phrasing.

**Consequences:**
- Description truncated or rejected by Claude Code
- Noise in `/help` output
- Claude can't parse trigger conditions clearly

**Prevention:**
- Keep description under 1024 chars (spec limit)
- Focus on 3-5 key trigger phrases
- Use natural language, not keyword stuffing: "Guides Clarity smart contract development using test-driven development with Clarinet CLI" beats "Clarity, Stacks, blockchain, smart contract, TDD, testing, Clarinet, devnet, deployment, coverage"
- Current description (163 chars) has room to grow, but prioritize clarity over coverage

**Detection:**
- Description feels like SEO spam
- `/help` shows truncated description
- Skill validation fails

**Phase:** Trigger expansion milestone (v1.1)

---

## Rendezvous-Specific Integration Pitfalls

### Pitfall: GPL-3.0 License Confusion

**What goes wrong:** Rendezvous uses GPL-3.0, which has viral copyleft requirements. Users/enterprises concerned about license compatibility.

**Why it happens:** Not clearly documenting license implications for projects using Rendezvous.

**Consequences:**
- Enterprise adoption blocked by legal review
- Users avoid fuzz testing feature due to license fear
- License violation if Rendezvous code incorporated into MIT-licensed skill

**Prevention:**
- Document clearly: Rendezvous is a **development tool**, not incorporated into your contract code
- Running `npx rv` for testing doesn't affect your contract's license
- Skill remains Apache-2.0; Rendezvous is separate dependency
- Note in documentation: "Rendezvous (GPL-3.0) is a testing tool, not compiled into contracts"

**Detection:**
- Enterprise users ask about license compatibility
- Legal teams flag GPL dependency
- Users avoid fuzz testing feature

**Phase:** Documentation phase (v1.1 milestone)

---

### Pitfall: Missing Invariant Documentation

**What goes wrong:** Users add Rendezvous but don't know what properties to test. Skill provides TDD guidance but not property-based testing patterns.

**Why it happens:** Property-based testing is less familiar than example-based testing. Current skill has no fuzz testing reference.

**Consequences:**
- Users write weak properties: `(ok true)` - always passes
- Fuzz tests provide false confidence
- Time wasted fuzzing meaningless invariants
- Users abandon fuzz testing as "not useful"

**Prevention:**
- Create `clarity-fuzz.md` reference file with:
  - Common invariants (balance consistency, supply conservation, access control)
  - Property templates for different contract types (token, NFT, DeFi)
  - Anti-patterns: properties that test nothing
  - Examples: weak vs strong properties
- Load reference during Phase 2 (Tests) and Phase 4 (Verification)
- Propose invariants during test scenario collaboration

**Detection:**
- Users ask "what should I test with Rendezvous?"
- Fuzz tests always pass (weak properties)
- Fuzz tests always fail (impossible properties)
- No clear invariants defined in Design phase

**Phase:** Phase 2 (Tests) + Documentation

---

### Pitfall: Fuzz Test Flakiness

**What goes wrong:** Fuzz tests pass sometimes, fail others due to random seed variation. CI becomes unreliable.

**Why it happens:** Not controlling seed; not understanding deterministic replay.

**Consequences:**
- CI fails intermittently, blocking deployments
- Developers can't reproduce failures locally
- Team loses trust in fuzz tests
- Fuzz tests disabled in CI

**Prevention:**
- Document seed management: `npx rv --seed <value>` for reproduction
- Capture seed on failure: "Fuzz test failed with seed: 123456. Reproduce: npx rv --seed 123456"
- Consider deterministic seeds in CI (trade-off: less randomness, more reproducibility)
- Default to random seed in development, fixed seed in CI for baseline

**Detection:**
- CI shows intermittent fuzz test failures
- Users can't reproduce fuzz failures locally
- Team complains about "flaky tests"

**Phase:** Phase 4 (Verification) + CI integration

---

### Pitfall: Fuzz Test Configuration Overload

**What goes wrong:** Too many configuration options (`--runs`, `--seed`, `--bail`, `--dial`) confuse users. Skill doesn't provide defaults.

**Why it happens:** Rendezvous has flexible configuration; skill tries to document everything at once.

**Consequences:**
- Users paralyzed by choice
- Skill documentation becomes reference manual (context bloat)
- Users run with wrong settings (too few runs = false confidence)

**Prevention:**
- Provide opinionated defaults in skill:
  - Development: `npx rv . contract test --runs 100 --bail`
  - CI/Verification: `npx rv . contract invariant --runs 1000`
- Progressive disclosure: basic usage in SKILL.md, advanced options in `clarity-fuzz.md`
- Don't explain all flags upfront - provide them on-demand

**Detection:**
- Users ask "what flags should I use?"
- Skill explanation of flags fills screens
- Users run fuzz tests with `--runs 10` (insufficient)

**Phase:** Documentation + Phase 4 (Verification)

---

## Phase-Specific Warnings

Which phase should address each pitfall.

| Phase | Pitfall | Why This Phase | What to Do |
|-------|---------|----------------|------------|
| **Phase 1: Design** | Fuzz-Before-Design | Properties must be defined before fuzzing | Add step: "Define contract invariants" alongside data structures. Document 3-5 key properties that must always hold. |
| **Phase 2: Tests** | TDD Confusion, Property Language Confusion | Tests phase covers both unit and fuzz test creation | Split into 2 substeps: (2a) Unit tests (Vitest) for concrete examples, (2b) Fuzz properties (Clarity) for invariants. Clarify: unit tests first (TDD), then fuzz. |
| **Phase 2: Tests** | Test File Organization Chaos | File structure established during test creation | Document naming: `contract.test.ts` (unit), `contract.fuzz.clar` (properties). Show directory structure. |
| **Phase 3: Implementation** | (No new pitfalls) | Implementation phase unchanged | Existing best practices apply. Fuzz tests don't affect implementation phase. |
| **Phase 4: Verification** | Coverage Interpretation Conflict, Fuzz Test Flakiness, Resource Consumption Shock | Verification runs both Vitest coverage and Rendezvous | Add fuzz testing step: "After coverage >= 90%, run Rendezvous for invariant testing." Document expected runtime. Capture seed on failure. |
| **Phase 5: Frontend** | (No new pitfalls) | Frontend phase unchanged | Fuzz testing complete before frontend integration. |
| **Trigger Expansion** | All trigger-related pitfalls | v1.1 milestone adds trigger keywords | Test description changes against non-Stacks prompts. Iterate based on false positive/negative rates. |
| **Documentation** | Missing Invariant Documentation, GPL License Confusion | v1.1 adds fuzz testing reference | Create `clarity-fuzz.md` reference file. Document Rendezvous license. Show property examples. |

## Workflow Sequencing Recommendations

How to integrate Rendezvous into existing 5-phase TDD workflow WITHOUT breaking TDD principles or confusing users.

### Recommended Integration: Add to Phase 4 (Verification)

**Current Phase 4 workflow:**
1. Run `npm run test:coverage`
2. Verify >= 90% coverage
3. Security review
4. User confirmation to proceed

**Modified Phase 4 workflow:**
1. Run `npm run test:coverage`
2. Verify >= 90% coverage
3. **Run Rendezvous fuzz testing: `npx rv . [contract] invariant --runs 1000`**
4. **Verify all invariants hold (no failures)**
5. Security review (existing)
6. User confirmation to proceed

**Rationale:**
- Fuzz testing is **verification**, not TDD
- Properties can only be tested after implementation exists
- Running after unit tests ensures basic behavior is correct
- Fits existing "automated + user confirmation" gate model
- Doesn't disrupt TDD RED-GREEN-REFACTOR cycle

**Phase 2 modification (prepare for fuzz testing):**
- After unit test scenarios approved, ask: "Should we define invariant properties for fuzz testing?"
- If yes, guide user to define 3-5 key invariants during test design
- Document properties in design notes
- Write property functions alongside unit tests (but don't run Rendezvous yet)

### Alternative: Optional "Phase 4.5" - Deep Verification

For high-security contracts, offer extended verification phase:
- Standard verification: 90% coverage + security review
- Deep verification: 95% coverage + fuzz testing (1000+ runs) + manual security audit

This avoids forcing fuzz testing on every project while making it available for critical contracts.

## Testing Checklist for Trigger Changes

Before deploying expanded skill description, verify against these prompts (should NOT activate):

- [ ] "Help me deploy an Ethereum smart contract"
- [ ] "How do I test my React components?"
- [ ] "I want to build a Solana program"
- [ ] "Test-driven development for Python APIs"
- [ ] "Deploy my Next.js app to Vercel"
- [ ] "Smart contract security best practices" (too generic)
- [ ] "How do blockchain transactions work?" (educational, not development)

Should STILL activate on:

- [ ] "Help me build a Stacks contract"
- [ ] "How do I test Clarity smart contracts?"
- [ ] "Set up Clarinet project for NFT contract"
- [ ] "I'm working on a Stacks blockchain app"
- [ ] "Test my `.clar` contract"
- [ ] "Clarity contract development with TDD"

## Proposed Skill Description Expansions

Current (163 chars):
> "Stacks blockchain development assistant. Guides Clarity smart contract development using test-driven development with Clarinet CLI."

**Option A: Conservative (add usage hints)** - 253 chars:
> "Stacks blockchain development assistant. Guides Clarity smart contract development using test-driven development with Clarinet CLI. Use when working with Stacks, Clarity smart contracts, Clarinet projects, or when building applications on the Stacks blockchain."

**Pros:** Minimal risk, adds "use when" context for Claude's selection
**Cons:** Somewhat redundant with existing triggers
**Risk:** LOW

**Option B: Add fuzz testing context** - 312 chars:
> "Stacks blockchain development assistant. Guides Clarity smart contract development using test-driven development with Clarinet CLI and Rendezvous fuzz testing. Use when working with Stacks blockchain contracts, Clarity smart contracts, Clarinet projects, or testing Clarity contract properties and invariants."

**Pros:** Signals fuzz testing capability, improves matching for "test Clarity" prompts
**Cons:** Longer, adds "testing" keyword (may cause some false positives)
**Risk:** MEDIUM - test thoroughly against non-Stacks testing prompts

**Option C: Explicit negative triggers (if false positives emerge)** - 380 chars:
> "Stacks blockchain development assistant. Guides Clarity smart contract development using test-driven development with Clarinet CLI. Use when working with Stacks, Clarity smart contracts, Clarinet projects, or Stacks blockchain applications. NOT for Ethereum, Solana, or other blockchain platforms. NOT for general testing or deployment unrelated to Stacks."

**Pros:** Reduces false positives explicitly
**Cons:** Verbose, uses precious description budget on negatives
**Risk:** LOW - but wastes space

**Recommendation:** Start with Option A (conservative). Monitor false positive rate. Upgrade to Option B only if missing valid Clarity testing prompts.

## Sources

### Official Documentation (HIGH confidence)
- [Rendezvous GitHub Repository](https://github.com/stacks-network/rendezvous) - Setup, installation, command reference
- [Rendezvous Book](https://stacks-network.github.io/rendezvous/) - Official documentation for Clarity fuzzer
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills) - Skill specification and best practices
- [Skill Authoring Best Practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices) - Official skill design patterns

### Community Insights (MEDIUM confidence)
- [How to Make Claude Code Skills Activate Reliably](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably) - Trigger keyword patterns and false positive avoidance
- [Claude Skills and CLAUDE.md: A Practical 2026 Guide](https://www.gend.co/blog/claude-skills-claude-md-guide) - Skill description best practices
- [Claude Agent Skills: A First Principles Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/) - How skill selection works (pure LLM reasoning, no keyword matching)

### Fuzz Testing Best Practices (MEDIUM confidence)
- [Fuzz Testing 101: Strengthen Your Software Security](https://aqua-cloud.io/fuzz-testing/) - Integration challenges with existing test suites
- [How to Avoid Overfitting Your Test Suite - Rubrik](https://www.rubrik.com/blog/architecture/21/7/fuzz-testing-how-to-avoid-overfitting-your-test-suite) - Property definition patterns
- [Developer's Guide to Fuzz Testing - DevOps.com](https://devops.com/developers-guide-to-fuzz-testing/) - Workflow integration and resource management
- [Fuzz Testing: A Beginner's Guide - Better Stack](https://betterstack.com/community/guides/testing/fuzz-testing/) - Common mistakes and best practices

### Property-Based Testing (MEDIUM confidence)
- [Property-based TDD - Pluralsight](https://www.pluralsight.com/tech-blog/property-based-tdd/) - Integrating properties into TDD workflow
- [Introduction to Properties-Driven Development](https://dev.to/meeshkan/introduction-to-properties-driven-development-547g) - Property definition philosophy
- [Property-Based Testing for Reliable Software](https://www.softwaretestingmagazine.com/knowledge/how-to-master-property-based-testing-for-reliable-software/) - Complementing unit tests with property tests

### Clarity Testing (LOW-MEDIUM confidence)
- [Clarity Property-Based Testing Primer](https://blog.nikosbaxevanis.com/2022/03/05/clarity-property-based-testing-primer/) - Early patterns for Clarity properties (2022, may be outdated)
- [Testing Your Contract - Clarity Book](https://book.clarity-lang.org/ch07-04-testing-your-contract.html) - Official testing philosophy

---

**Research confidence assessment:**
- **Rendezvous integration:** MEDIUM (official docs available, but limited community battle-testing as of early 2026)
- **Trigger expansion risks:** HIGH (well-documented in Claude Code community, tested patterns)
- **TDD + Fuzz workflow:** MEDIUM-HIGH (general fuzz testing practices are mature, Clarity-specific patterns are emerging)
- **Property definition:** MEDIUM (property-based testing is well-understood, Clarity-specific invariants need more examples)
