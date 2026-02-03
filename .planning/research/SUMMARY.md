# Research Summary: Stacks Skills v1.1

**Project:** stacks-skills
**Date:** 2026-02-03
**Purpose:** Rendezvous fuzz testing integration + trigger expansion for broader auto-invocation

## Executive Summary

Version 1.1 adds two focused enhancements to the existing 5-phase TDD workflow: **Rendezvous property-based fuzz testing** and **expanded skill trigger keywords** for improved auto-invocation. The research reveals that Rendezvous integration requires minimal stack additions - the `@stacks/rendezvous` CLI (v0.13.1) is a standalone tool that complements rather than replaces existing Vitest unit tests. Critically, fuzz testing should be integrated as a **parallel validation track within Phase 4 (Verification)**, not as a separate phase, to maintain workflow simplicity while adding property-based invariant testing alongside unit test coverage.

The recommended approach treats fuzz testing as an additional quality signal: unit tests verify specific scenarios (example-based testing), while fuzz tests verify universal properties (invariant testing). Both run after implementation, both inform the quality gate, and both must pass before frontend integration. The key architectural insight is that fuzz tests live in `.tests.clar` files alongside contracts (not in the `tests/` directory with unit tests), creating clean separation while maintaining a unified verification step.

For trigger expansion, the critical risk is **over-generalization** - adding generic terms like "blockchain" or "smart contract" causes false positives on Ethereum/Solana/Cosmos questions. The research strongly recommends conservative expansion: keep triggers Stacks-specific ("Stacks blockchain", "Clarity smart contracts") and test against non-Stacks prompts before deployment. The current 163-character description has room for targeted additions without sacrificing specificity.

## Key Findings

### Recommended Stack Additions

**Minimal integration for Rendezvous fuzz testing:**

The existing v1.0 stack (Vitest + Clarinet SDK + @stacks/transactions) requires **only one addition**:

- **@stacks/rendezvous v0.13.1** - Standalone CLI for property-based fuzz testing
  - Purpose: Execute property tests and invariant tests defined in Clarity
  - Integration: Runs independently via `npx rv` commands
  - Dependencies: Bundles fast-check ^4.3.0, @stacks/clarinet-sdk ^3.12.0, @stacks/transactions ^7.2.0 internally
  - No conflicts: All dependencies are bundled, not peer dependencies

**What NOT to add:**
- fast-check (bundled within Rendezvous)
- Separate test runner configuration (Rendezvous is a CLI tool, not a plugin)
- TypeScript type definitions (Rendezvous is CLI-only)
- Coverage reporter integration (fuzz tests measure property satisfaction, not line coverage)

**Installation:**
```bash
npm install -D @stacks/rendezvous
```

**Node.js compatibility:** Requires Node.js 20, 22, or 24 (already compatible with existing v1.0 stack).

### Expected Features

**Table Stakes (Must Have for fuzz testing):**

| Feature | Rationale | Complexity |
|---------|-----------|------------|
| Property-based test execution | Core feature - verifies function behavior across random inputs | Medium |
| Invariant test execution | Core feature - verifies state consistency across random call sequences | Medium |
| Seed-based replay | Critical for debugging - enables deterministic reproduction of failures | Low |
| Shrinking | Essential for debugging - reduces failing inputs to minimal counterexample | High (use Rendezvous built-in) |
| Test discarding | Efficiency - skip tests with invalid inputs via `(ok false)` | Low |
| Context tracking | Record function call history for sophisticated invariants | Medium |
| Basic type generation | Generate random values for Clarity primitives (uint, int, bool, principal, etc.) | Medium |

**Differentiators (High Value):**

| Feature | Value Proposition | Complexity |
|---------|------------------|------------|
| Dialers (pre/post hooks) | Execute JavaScript for event verification, SIP compliance testing | High |
| Custom manifest support | Use test doubles for contracts with restrictive dependencies | Medium |
| Trait reference handling | Automatically select trait implementations for testing | Medium |
| Bail on first failure | Faster feedback during debugging (skip shrinking) | Low |
| Stateful fuzzing | Maintain contract state across function call sequences (invariant testing) | Medium |

**Anti-Features (Explicitly Avoid):**

- **Mainnet fuzz testing** - Use Simnet only (matches v1.0 devnet focus)
- **Automatic invariant generation** - Developers must define domain-specific invariants
- **Embedded fuzzer implementation** - Use Rendezvous CLI exclusively
- **GUI/visual test runner** - Terminal-based workflow only
- **JavaScript test authoring** - Fuzz tests written in Clarity, not TypeScript
- **Mutation testing** - Out of scope (different testing methodology)

**Property Testing Patterns (documented in research):**

1. Symmetric operations (reversibility)
2. State transition invariants (balance consistency, supply conservation)
3. Context-based invariants (execution history)
4. Comparison with reference implementation
5. Boundary value testing
6. Idempotency checks
7. Postcondition verification
8. Test discarding with preconditions
9. Event emission verification (via dialers)
10. Cross-contract interaction testing (via test doubles)

### Architecture Approach

**Recommended Integration: Parallel Validation Track in Phase 4**

Fuzz testing should be added **within Phase 4 (Verification)** as a parallel track alongside unit tests, NOT as a separate phase.

**Current Phase 4 workflow:**
```
1. Run unit tests (vitest run)
2. Generate coverage report (vitest --coverage)
3. Check 90% threshold
4. User security review
→ Proceed to Phase 5 or return to Phase 3
```

**Enhanced Phase 4 workflow:**
```
1. Run unit tests (vitest run)
   └── Validates specific scenarios with predetermined inputs

2. Run fuzz tests (npx rv) - PARALLEL track
   ├── Property-based tests (npx rv . contract test)
   └── Invariant tests (npx rv . contract invariant)

3. Aggregate results
   ├── Unit test results (pass/fail)
   ├── Fuzz test results (pass/fail, seed if failure)
   └── Combined coverage (Vitest tracks unit tests)

4. Check 90% coverage threshold
   └── If failed: Identify gaps, suggest tests (unit or fuzz)

5. User security review
   └── Present both unit and fuzz findings

→ Proceed to Phase 5 or return to Phase 2/3
```

**Why NOT a separate phase:**

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Phase 4.5 (between Verification and Frontend)** | Preserves existing numbering | Creates unnecessary proliferation; frontend waits for fuzz tests | REJECTED |
| **Phase 6 (new final phase)** | Clean separation | Quality gate too late; wastes frontend effort if bugs found | REJECTED |
| **Enhanced Phase 4 (RECOMMENDED)** | Unified verification concept; parallel execution; single quality gate | Slightly more complex Phase 4 | SELECTED |

**Component Boundaries:**

| Component | File Location | Purpose | Execution |
|-----------|---------------|---------|-----------|
| Unit tests | `tests/*.test.ts` | Specific scenario validation | Vitest |
| Fuzz tests | `contracts/*.tests.clar` | Property/invariant validation | Rendezvous |
| Coverage | `coverage/` directory | Line coverage metrics | Vitest |

**Key architectural insight:** Fuzz tests live alongside contracts (`.tests.clar`), not in `tests/` directory. This separation is intentional and clean.

**Phase 2 clarification:**

Rename "Phase 2: Tests" to "Phase 2: Unit Tests" to clarify scope. Add forward reference: "Fuzz tests are added later in Phase 4 for property verification."

**SKILL.md modifications required:**

- Update workflow overview (Phase 4 description)
- Clarify Phase 2 scope (unit tests only)
- Major rewrite of Phase 4 (split into Unit + Fuzz subsections)
- Add Quick Reference commands for Rendezvous
- Create new reference file: `clarity-fuzz.md` (~200-250 lines)

Estimated changes: +90 lines total (within 600-line budget with compression elsewhere).

### Critical Pitfalls

**From Fuzz Testing Integration:**

1. **Fuzz-Before-Design (CRITICAL)** - Running Rendezvous before properties are defined generates meaningless tests
   - **Prevention:** Define invariants during Design phase (Phase 1). Document "table stakes" invariants (balance >= 0, supply constant). Fuzz tests come AFTER unit tests prove basic behavior.
   - **Phase Impact:** Phase 1 (Design) + Phase 2 (Tests)

2. **TDD Confusion (CRITICAL)** - Treating fuzz tests as replacement for unit tests breaks RED-GREEN-REFACTOR cycle
   - **Prevention:** Fuzz tests complement, not replace unit tests. Unit tests = concrete examples. Fuzz tests = universal properties. Always write unit tests first (TDD), then add fuzz tests.
   - **Phase Impact:** Phase 2 (Tests)

3. **Property Definition Failure (CRITICAL)** - Writing properties too weak (always pass) or too strong (always fail) makes fuzz tests useless
   - **Prevention:** Include property examples in `clarity-fuzz.md`. Start with simple invariants: "balance never negative", "total supply constant". Test properties manually before fuzzing.
   - **Phase Impact:** Phase 2 (Tests) + Phase 4 (Verification)

4. **Workflow Integration Ambiguity (MODERATE)** - Unclear when to run Rendezvous vs Vitest causes confusion
   - **Prevention:** Document clear workflow: Phase 2 = unit tests (Vitest), Phase 4 = coverage (Vitest) + fuzz testing (Rendezvous). Fuzz tests are verification, not TDD.
   - **Phase Impact:** All phases (workflow clarity)

5. **Resource Consumption Shock (MODERATE)** - Fuzz tests take minutes vs seconds for unit tests; CI pipelines timeout
   - **Prevention:** Document expected runtime. Default `--runs 100` for development, `--runs 1000+` for CI. Run fuzz tests separately from unit tests. Consider `--bail` for faster failure.
   - **Phase Impact:** Phase 4 (Verification) + CI integration

6. **Coverage Interpretation Conflict (MODERATE)** - Conflating Vitest code coverage with fuzz test coverage
   - **Prevention:** Clarify: Vitest coverage = lines executed. Fuzz coverage = state space explored. Both are needed. 90% Vitest coverage doesn't mean fuzz tests are comprehensive.
   - **Phase Impact:** Phase 4 (Verification)

**From Trigger Expansion:**

7. **Trigger Over-Generalization (CRITICAL)** - Expanding keywords to "blockchain" or "smart contract" causes false positives on other chains
   - **Prevention:** Keep triggers **Stacks-specific**: "Stacks", "Clarity", "Clarinet". Add context: "Stacks blockchain", "Clarity smart contracts". Test against non-Stacks prompts.
   - **Test against:** "Help me deploy an Ethereum smart contract" (should NOT trigger), "How do I test Solidity contracts?" (should NOT trigger)
   - **Phase Impact:** Trigger expansion milestone (v1.1)

8. **"Testing" Keyword Ambiguity (MODERATE)** - Adding standalone "testing" or "TDD" activates on general testing questions
   - **Prevention:** Combine testing terms with Stacks context: "Clarity contract testing with Clarinet". Don't use standalone "TDD" or "testing".
   - **Test against:** "How do I write unit tests for my API?" (should NOT trigger)
   - **Phase Impact:** Trigger expansion milestone (v1.1)

9. **Overly Broad File Extension Triggers (MODERATE)** - Triggering on `.test.ts` alone activates on any TypeScript test file
   - **Prevention:** Don't trigger on `.test.ts` alone. DO trigger on `.clar` files (Clarity-specific) and `Clarinet.toml` presence.
   - **Phase Impact:** Trigger expansion milestone (v1.1)

10. **Description Length Explosion (MODERATE)** - Adding many keywords pushes skill over 1024 char limit
    - **Prevention:** Keep description under 1024 chars (spec limit). Focus on 3-5 key trigger phrases. Use natural language, not keyword stuffing.
    - **Current status:** 163 chars - room to grow, but prioritize clarity over coverage
    - **Phase Impact:** Trigger expansion milestone (v1.1)

## Implications for Roadmap

### Recommended Phase Structure for v1.1

Version 1.1 is an **enhancement milestone**, not a ground-up rebuild. The existing 5-phase workflow remains intact, with targeted additions.

#### Phase 1: Stack Integration
**Duration:** 1-2 days
**Delivers:** Rendezvous package added to project, installation documented

**Tasks:**
- Add `@stacks/rendezvous` to package.json
- Update installation instructions in SKILL.md
- Verify Node.js version compatibility (20/22/24)

**Dependencies:** None (isolated change)

**Research needs:** SKIP (stack research complete)

#### Phase 2: Reference Documentation
**Duration:** 2-3 days
**Delivers:** `clarity-fuzz.md` reference file with property testing patterns

**Tasks:**
- Create `skills/stacks-dev/references/clarity-fuzz.md`
- Document 10 property testing patterns (from FEATURES-FUZZ-TESTING.md)
- Include examples for property tests vs invariant tests
- Add seed-based reproduction workflow
- Document common invariants (balance consistency, supply conservation)

**Dependencies:** Phase 1 (installation context)

**Research needs:** SKIP (patterns documented in FEATURES-FUZZ-TESTING.md)

**Size estimate:** 200-250 lines

#### Phase 3: SKILL.md Workflow Integration
**Duration:** 3-4 days
**Delivers:** Updated SKILL.md with Phase 4 enhancement and Phase 2 clarifications

**Tasks:**
- Rename Phase 2: "Tests" → "Unit Tests"
- Add forward reference in Phase 2 to fuzz tests
- **Major rewrite:** Phase 4 (Verification)
  - Split into Unit Tests + Fuzz Tests subsections
  - Add parallel execution description
  - Add fuzz failure interpretation guide
  - Reference clarity-fuzz.md for patterns
- Update workflow overview diagram
- Add Rendezvous commands to Quick Reference

**Dependencies:** Phase 2 (reference file must exist)

**Research needs:** SKIP (architecture research complete)

**Estimated changes:** +90 lines (requires compression elsewhere to stay under 600-line target)

#### Phase 4: Trigger Expansion
**Duration:** 2-3 days
**Delivers:** Updated skill description with improved auto-invocation coverage

**Tasks:**
- Expand description from 163 chars to ~250-300 chars
- Add targeted context phrases: "Use when working with Stacks blockchain contracts, Clarity smart contracts, or Clarinet projects"
- Add fuzz testing context: "property testing and invariant validation"
- Test against false positive scenarios (Ethereum, Solana, generic testing)
- Test against false negative scenarios (valid Stacks prompts)
- Iterate based on results

**Recommended approach:** Start conservative (Option A from PITFALLS.md):
> "Stacks blockchain development assistant. Guides Clarity smart contract development using test-driven development with Clarinet CLI. Use when working with Stacks, Clarity smart contracts, Clarinet projects, or when building applications on the Stacks blockchain."

**Dependencies:** None (isolated change)

**Research needs:** SKIP (trigger patterns documented in PITFALLS.md)

#### Phase 5: Testing & Validation
**Duration:** 2-3 days
**Delivers:** Verified v1.1 functionality with real Clarity contract

**Tasks:**
- Test enhanced Phase 4 workflow with sample contract
- Verify unit tests + fuzz tests run in parallel
- Verify coverage aggregation works correctly
- Test fuzz failure reproduction (seed-based replay)
- Test auto-invocation with expanded triggers
- Validate no false positives/negatives

**Dependencies:** Phase 3 + Phase 4 (all changes integrated)

**Research needs:** SKIP (validation phase)

#### Phase 6: Documentation & Release
**Duration:** 1-2 days
**Delivers:** Updated README, examples, release notes

**Tasks:**
- Update README with v1.1 features
- Add example fuzz test scenarios
- Document Phase 4 workflow changes
- Create release notes highlighting fuzz testing and trigger improvements
- Tag v1.1 release

**Dependencies:** Phase 5 (validation complete)

**Research needs:** SKIP (documentation phase)

### Phase Ordering Rationale

1. **Stack Integration first** - Foundation for all fuzz testing work
2. **Reference file before SKILL.md** - clarity-fuzz.md must exist before SKILL.md can reference it
3. **SKILL.md before triggers** - Core functionality before discoverability improvements
4. **Testing after integration** - Validate all changes together, not piecemeal
5. **Documentation last** - Document what's been validated, not what's planned

### Research Flags

**Phases requiring NO additional research:**
- All phases - v1.1 research is complete and comprehensive
- Stack integration patterns are well-documented
- Fuzz testing patterns are catalogued (10 patterns in FEATURES-FUZZ-TESTING.md)
- Trigger expansion risks are identified with mitigation strategies

**Phases that might need validation during implementation:**
- **Phase 4 (Trigger Expansion)** - Test against live Claude Code to verify false positive/negative rates
- **Phase 5 (Testing)** - Validate that Vitest coverage captures fuzz test execution (likely answer: no, but needs confirmation)

### Build Order Dependencies

```
Phase 1 (Stack Integration)
    ↓
Phase 2 (Reference Documentation) ← Must complete before Phase 3
    ↓
Phase 3 (SKILL.md Integration) ← Depends on clarity-fuzz.md existing
    ↓
Phase 4 (Trigger Expansion) ← Can run parallel with Phase 3
    ↓
Phase 5 (Testing & Validation) ← Requires Phase 3 + Phase 4 complete
    ↓
Phase 6 (Documentation & Release)
```

**Parallel tracks:**
- Phase 4 (Trigger Expansion) can run in parallel with Phase 3 (SKILL.md Integration)
- Both must complete before Phase 5 (Testing)

**Critical path:** Phase 1 → Phase 2 → Phase 3 → Phase 5 → Phase 6

### Quality Gates

| Phase | Gate | Criteria |
|-------|------|----------|
| Phase 1 | Installation verified | `npx rv --version` returns 0.13.1; npm install succeeds |
| Phase 2 | Reference complete | clarity-fuzz.md contains all 10 patterns with examples |
| Phase 3 | SKILL.md enhanced | Phase 4 rewrite complete; file under 600 lines; clarity-fuzz.md referenced correctly |
| Phase 4 | Triggers validated | No false positives on Ethereum/Solana prompts; still activates on Stacks prompts |
| Phase 5 | End-to-end verified | Sample contract passes unit tests + fuzz tests; coverage gate works; auto-invocation works |
| Phase 6 | Documentation complete | README updated; examples added; release notes written; v1.1 tagged |

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack (Rendezvous integration)** | HIGH | Official Rendezvous docs (v0.13.1), npm registry data, GitHub repository verified |
| **Features (property testing patterns)** | HIGH | 10 patterns documented from official Rendezvous docs + domain research; table stakes vs differentiators clearly defined |
| **Architecture (Phase 4 enhancement)** | HIGH | Parallel validation track is well-supported by research; alternative approaches evaluated and rejected with rationale |
| **Pitfalls (integration risks)** | HIGH | Comprehensive coverage of fuzz testing integration + trigger expansion risks from official docs and community best practices |
| **Trigger Expansion** | MEDIUM-HIGH | Trigger patterns documented; false positive scenarios identified; needs live testing for validation |
| **Roadmap (phase structure)** | HIGH | Clear dependencies; research complete; no gaps requiring additional research |

**Overall confidence:** HIGH

### Gaps to Address During Implementation

1. **Vitest coverage integration with fuzz tests** - Research suggests Vitest coverage will NOT capture Rendezvous execution (separate processes). Needs validation during Phase 5. Likely solution: report fuzz test pass/fail separately from unit test coverage %.

2. **Trigger false positive rate** - Description expansions need live testing with Claude Code to measure actual false positive/negative rates. Phase 4 should iterate based on real-world results.

3. **Phase 4 complexity management** - Adding parallel fuzz track increases Phase 4 complexity. Phase 5 testing should validate that UX remains clear and workflow is intuitive.

4. **Context budget impact** - clarity-fuzz.md adds ~200-250 lines of reference content. Monitor `/context` during Phase 5 to ensure no context window issues.

5. **Property definition guidance** - The 10 patterns in clarity-fuzz.md should be tested with real contracts during Phase 5. Gather feedback on which patterns are most useful; consider prioritizing top 5 if content needs compression.

## Sources

### Primary Sources (HIGH Confidence)

**Rendezvous/Fuzz Testing:**
- [Rendezvous GitHub Repository](https://github.com/stacks-network/rendezvous) - Official source code, README, v0.13.1 release notes (Dec 24, 2025)
- [Rendezvous Official Documentation](https://stacks-network.github.io/rendezvous/) - Authoritative guide to property-based testing
- [Stacks Documentation - Fuzz Testing](https://docs.stacks.co/guides-and-tutorials/testing-smart-contracts/fuzz-testing) - Official integration guide
- npm registry query results - Live package data via `npm view @stacks/rendezvous`

**Skill Development:**
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills) - Official skill specification
- [Skill Authoring Best Practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices) - Official design patterns

### Secondary Sources (MEDIUM Confidence)

**Property-Based Testing Domain:**
- [Property-Based Testing Comprehensive Guide](https://dev.to/keploy/property-based-testing-a-comprehensive-guide-lc2)
- [Choosing properties for property-based testing](https://fsharpforfunandprofit.com/posts/property-based-testing-2/)
- [Fuzz / Invariant Tests - Patrick Collins](https://patrickalphac.medium.com/fuzz-invariant-tests-the-new-bare-minimum-for-smart-contract-security-87ebe150e88c)

**Trigger Expansion:**
- [How to Make Claude Code Skills Activate Reliably](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably)
- [Claude Skills and CLAUDE.md: A Practical 2026 Guide](https://www.gend.co/blog/claude-skills-claude-md-guide)

**Clarity-Specific:**
- [Clarity Property-Based Testing Primer](https://blog.nikosbaxevanis.com/2022/03/05/clarity-property-based-testing-primer/) - Early patterns (2022, some concepts may be outdated)
- [Testing Your Contract - Clarity Book](https://book.clarity-lang.org/ch07-04-testing-your-contract.html) - Official testing philosophy

### Tertiary Sources (LOW-MEDIUM Confidence)

- [Testing smart contracts - Ethereum.org](https://ethereum.org/developers/docs/smart-contracts/testing/) - General smart contract testing concepts
- [Testing and Auditing Strategies for DeFi Smart Contracts](https://medium.com/@jitendersingh389/testing-and-auditing-strategies-for-defi-smart-contracts-b64a81449631) - DeFi-specific patterns

---

## Ready for Roadmap

**Status:** Research synthesis complete
**Next step:** v1.1 roadmap creation (all research complete, no additional research needed)
**Key recommendation:** Proceed with 6-phase enhancement approach. Start with Phase 1 (Stack Integration).

**Critical success factors:**
1. Keep Phase 4 enhancement simple - parallel validation track, not separate phase
2. Keep triggers Stacks-specific - test against false positives before deployment
3. Create clarity-fuzz.md before updating SKILL.md (dependency)
4. Validate end-to-end with real contract in Phase 5

**Confidence level:** HIGH - ready to proceed with implementation.
