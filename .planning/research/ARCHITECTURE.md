# Architecture Research: Fuzz Testing Integration

**Project:** Stacks Skills v1.1 - Rendezvous Fuzz Testing
**Researched:** 2026-02-03
**Confidence:** HIGH

## Summary

Rendezvous fuzz testing should integrate as a **parallel validation track** within the existing Phase 4 (Verification), not as a separate phase. Fuzz tests complement unit tests by exploring randomized inputs and verifying invariants, while unit tests verify specific scenarios. Both run after implementation, and both inform the coverage gate.

## Workflow Integration

### Current 5-Phase Workflow

```
Phase 1: Design → Phase 2: Tests → Phase 3: Implementation → Phase 4: Verification → Phase 5: Frontend
```

### Recommended Integration: Phase 4 Enhancement

**Fuzz testing fits within Phase 4 (Verification) as a parallel validation track:**

```
Phase 4: Verification (Enhanced)
├── Unit Test Execution (existing - Vitest + Clarinet SDK)
│   └── Validates specific scenarios with predetermined inputs
│
├── Fuzz Test Execution (NEW - Rendezvous)
│   └── Validates invariants with randomized inputs
│
└── Coverage Analysis (existing - Vitest)
    └── Aggregates coverage from both unit and fuzz tests
    └── Enforces 90% gate before proceeding
```

### Why Not a Separate Phase?

**Considered alternatives:**
1. **Phase 2.5 (between Tests and Implementation)** - REJECTED: Fuzz tests require implemented contract code to execute
2. **Phase 4.5 (between Verification and Frontend)** - REJECTED: Creates unnecessary phase proliferation; fuzz testing is validation
3. **Phase 6 (new final phase)** - REJECTED: Frontend integration shouldn't wait for fuzz testing

**Rationale for Phase 4 enhancement:**
- Fuzz tests and unit tests serve the same quality goal: verify contract correctness
- Both require completed implementation (Phase 3)
- Both contribute to coverage metrics
- Both must pass before deployment
- Running in parallel reduces total validation time

## Phase Impact

| Phase | Change | Rationale |
|-------|--------|-----------|
| **Phase 1: Design** | No change | Design remains implementation-agnostic |
| **Phase 2: Tests** | Rename to "Unit Tests" | Clarifies distinction from fuzz tests |
| **Phase 3: Implementation** | No change | Implementation serves both unit and fuzz tests |
| **Phase 4: Verification** | **MAJOR: Add parallel fuzz track** | Fuzz tests run alongside unit tests; both inform coverage gate |
| **Phase 5: Frontend** | No change | Proceeds after combined validation passes |

### Phase 2 Clarification

**Current:** "Phase 2/5: Tests"
**Proposed:** "Phase 2/5: Unit Tests"

This clarifies the TDD workflow focuses on **unit tests** (specific scenarios), while **fuzz tests** (randomized invariants) are added later in Phase 4.

### Phase 4 Detailed Flow

**Current Phase 4:**
```
1. Run unit tests (clarinet test / vitest run)
2. Generate coverage report (vitest --coverage)
3. Check 90% threshold
4. User security review
→ Proceed to Phase 5 or return to Phase 3
```

**Enhanced Phase 4:**
```
1. Run unit tests (vitest run)
   └── Specific scenario validation

2. Run fuzz tests (npx rv) - PARALLEL track
   ├── Property-based tests (rv test)
   └── Invariant tests (rv invariant)

3. Aggregate results
   ├── Unit test results (pass/fail)
   ├── Fuzz test results (pass/fail, seed if failure)
   └── Combined coverage (Vitest tracks both)

4. Check 90% coverage threshold
   └── If failed: Identify gaps, suggest tests (unit or fuzz)

5. User security review
   └── Present both unit and fuzz findings

→ Proceed to Phase 5 or return to Phase 2/3
```

## New Components

### Reference File: clarity-fuzz.md

**Location:** `skills/stacks-dev/references/clarity-fuzz.md`

**Purpose:** Progressive disclosure for fuzz testing patterns (loaded on-demand in Phase 4)

**Contents:**
- Property-based testing concepts
- Writing Rendezvous tests (`.tests.clar` files)
- Property vs. invariant tests
- Interpreting fuzz failures
- Seed-based reproduction
- Integration with TDD workflow

**Size estimate:** 200-250 lines (similar to clarity-tdd.md)

### SKILL.md Updates

**Sections requiring modification:**

1. **Workflow Overview** (line 40-57)
   - Update Phase 4 description: "Verification & Fuzzing"

2. **Phase 2: Tests** (line 120-201)
   - Clarify scope: "Unit Tests (TDD)"
   - Add note: "Fuzz tests are added later in Phase 4"

3. **Phase 4: Verification** (line 287-378)
   - **MAJOR REWRITE:** Split into Unit Tests + Fuzz Tests subsections
   - Add parallel execution description
   - Update coverage analysis to include both sources
   - Add fuzz failure interpretation guide
   - Add reference to clarity-fuzz.md

4. **Quick Reference** (line 541-571)
   - Add fuzz testing commands:
     ```bash
     npx rv <project> <contract> test       # Property tests
     npx rv <project> <contract> invariant  # Invariant tests
     ```

**Estimated changes:** +80 lines in Phase 4, +10 lines elsewhere = ~90 lines total (within 600-line budget: 595 + 90 = 685, need to compress ~85 lines elsewhere)

### Package Dependencies

**Add to installation instructions:**
```bash
npm install @stacks/rendezvous
```

**Node.js requirement:** Already compatible (project uses Node.js 20+, Rendezvous supports 20, 22, 24)

## Build Order

### Suggested Implementation Sequence

**Phase A: Foundation (Week 1)**
1. Create `references/clarity-fuzz.md` reference file
   - Document property-based testing concepts
   - Show example `.tests.clar` files
   - Explain test vs. invariant modes

2. Update `SKILL.md` Phase 4 section
   - Split verification into Unit + Fuzz subsections
   - Add parallel execution flow
   - Reference clarity-fuzz.md for details

3. Add installation instructions
   - Update setup steps with `npm install @stacks/rendezvous`
   - Add to Quick Reference commands table

**Phase B: Workflow Integration (Week 2)**
4. Implement parallel execution in Phase 4
   - Run `vitest run` for unit tests
   - Run `npx rv . <contract> test` for property tests
   - Run `npx rv . <contract> invariant` for invariants
   - Collect results from both tracks

5. Update coverage aggregation
   - Verify Vitest captures fuzz test execution
   - If not, document separate tracking
   - Maintain 90% gate across combined coverage

6. Add fuzz failure handling
   - Extract failure seed from rv output
   - Suggest reproduction command: `npx rv . <contract> test --seed <seed>`
   - Guide user through failure diagnosis

**Phase C: Documentation & Polish (Week 3)**
7. Update Phase 2 (Tests) section
   - Rename to "Unit Tests" for clarity
   - Add forward reference to fuzz tests in Phase 4
   - Clarify TDD scope (unit tests only)

8. Update Workflow Overview diagram
   - Show Phase 4 with dual validation tracks
   - Update gate descriptions

9. Update examples
   - Add example fuzz test scenarios
   - Show property test syntax
   - Show invariant test syntax

### Dependencies

```
clarity-fuzz.md (reference file)
    ↓
SKILL.md Phase 4 updates
    ↓
Parallel execution implementation
    ↓
Coverage aggregation updates
    ↓
Fuzz failure handling
    ↓
Phase 2 clarifications
```

**Critical path:** Reference file → Phase 4 rewrite → Parallel execution

**Can be done in parallel:**
- Documentation examples
- Quick reference updates
- Installation instructions

## Integration Points

### 1. Test File Structure

**Unit tests (existing):**
```
tests/
└── my-contract.test.ts          # Vitest + Clarinet SDK
```

**Fuzz tests (new):**
```
contracts/
├── my-contract.clar             # Contract implementation
└── my-contract.tests.clar       # Rendezvous fuzz tests
```

**Key insight:** Fuzz tests live alongside contracts (`.tests.clar`), not in `tests/` directory. This matches Rendezvous conventions.

### 2. Test Execution Flow

**Sequential approach (simpler, slower):**
```bash
# Phase 4: Verification
vitest run                              # Unit tests
npx rv . my-contract test              # Property tests
npx rv . my-contract invariant         # Invariant tests
vitest run --coverage                  # Coverage report
```

**Parallel approach (recommended, faster):**
```bash
# Phase 4: Verification (parallel)
vitest run & npx rv . my-contract test & npx rv . my-contract invariant
wait
vitest run --coverage                  # Aggregate coverage
```

### 3. Coverage Aggregation

**Key question:** Does Vitest coverage capture Rendezvous fuzz test execution?

**Likely answer:** No (separate execution contexts)

**Solution:**
- Track unit test coverage via Vitest (existing)
- Track fuzz test coverage via Rendezvous (if available)
- Report both metrics separately
- Gate requires: unit coverage >= 90% AND fuzz tests pass

**Alternative:** Require fuzz tests to exercise uncovered branches from unit tests, using them as gap-fillers.

### 4. User Experience

**Current Phase 4 user experience:**
```
Phase 4/5: Verification
Running tests... ✓ 12/12 passed
Checking coverage... 94% ✓
Security review: [summary]
Ready to proceed? [Y/n]
```

**Enhanced Phase 4 user experience:**
```
Phase 4/5: Verification
Running unit tests... ✓ 12/12 passed
Running fuzz tests... ✓ 100 iterations passed (seed: abc123)
Checking coverage... 94% ✓
Security review: [summary]
Ready to proceed? [Y/n]
```

**If fuzz test fails:**
```
Phase 4/5: Verification
Running unit tests... ✓ 12/12 passed
Running fuzz tests... ✗ Failed after 47 iterations
  Property violated: balance-never-negative
  Seed: def456
  Reproduce: npx rv . token test --seed def456

Fix needed. Review fuzz failure and update contract.
Returning to Phase 3 (Implementation).
```

### 5. Progressive Disclosure

**When to load clarity-fuzz.md:**
- User reaches Phase 4 (Verification) for the first time
- User requests "How do I write fuzz tests?"
- Fuzz test fails and user needs interpretation guidance

**What's included:**
- Property-based testing primer
- Writing `.tests.clar` files
- Test vs. invariant mode differences
- Seed-based reproduction workflow
- Common invariants (balance non-negative, total supply constant, etc.)

## Comparison: New Phase vs. Enhanced Phase

| Aspect | Option A: New Phase 4.5 | Option B: Enhanced Phase 4 (RECOMMENDED) |
|--------|-------------------------|------------------------------------------|
| **Phase count** | 6 phases | 5 phases (unchanged) |
| **User experience** | Additional phase transition, more gates | Single verification phase, one gate |
| **Cognitive load** | Higher (new concept to learn) | Lower (fuzz tests are "more validation") |
| **Parallelization** | Sequential by default | Natural parallel execution |
| **Coverage gating** | Two separate gates (unit, fuzz) | Single combined gate |
| **TDD workflow** | Disrupts existing pattern | Fits naturally after TDD loop |
| **Documentation scope** | Major restructure | Incremental enhancement |
| **Implementation effort** | High (new phase scaffolding) | Medium (enhance existing phase) |

**Verdict:** Enhanced Phase 4 is superior for this use case.

## Testing Types Comparison

| Aspect | Unit Tests (Phase 2) | Fuzz Tests (Phase 4) |
|--------|---------------------|---------------------|
| **Purpose** | Verify specific scenarios | Verify invariants across randomized inputs |
| **Input strategy** | Predetermined, hand-crafted | Generated, randomized |
| **When written** | Before implementation (TDD) | After implementation (verification) |
| **Test file format** | `.test.ts` (TypeScript + Vitest) | `.tests.clar` (Clarity + Rendezvous) |
| **Execution** | `vitest run` | `npx rv . <contract> test` |
| **Coverage tracking** | Via Vitest | Via Rendezvous (separate) |
| **Typical count** | 10-50 tests per contract | 2-10 properties + invariants |
| **Failure output** | Specific assertion failure | Property violation with seed |
| **Reproduction** | Re-run test | Re-run with seed: `--seed <seed>` |

## Architecture Rationale

### Why Parallel Tracks in Phase 4?

**1. Both require implemented code**
- Unit tests can be written first (TDD), but execute after implementation
- Fuzz tests require code to exist before they can generate inputs
- Both validate the same implemented artifact

**2. Both serve quality assurance**
- Unit tests: "Does it work for these specific cases?"
- Fuzz tests: "Does it uphold these invariants across all cases?"
- Both answer: "Is this contract safe to deploy?"

**3. Coverage is complementary**
- Unit tests cover known edge cases
- Fuzz tests discover unknown edge cases
- Combined coverage provides stronger quality signal

**4. User workflow is clearer**
- Phase 2: Write tests (TDD mindset)
- Phase 3: Implement (make tests pass)
- Phase 4: Validate (run everything, check coverage)
- Phase 5: Integrate (frontend)

Adding Phase 4.5 would disrupt the "validate then integrate" mental model.

### Why Not Part of Phase 2 (Tests)?

**Considered:** Writing fuzz tests during TDD phase alongside unit tests.

**Rejected because:**
1. **TDD loop is tight:** Write test → implement → verify cycle is fast for unit tests, but fuzz tests run 100+ iterations (slower feedback)
2. **Different mindset:** Unit tests think "what scenarios to test," fuzz tests think "what invariants must hold"
3. **Sequential dependency:** Fuzz tests are more valuable after unit tests expose the primary scenarios
4. **Complexity budget:** Phase 2 is already teaching TDD, Vitest, Clarinet SDK; adding fuzz testing overloads learning

**Better:** Let Phase 2 focus on TDD mastery, introduce fuzz testing in Phase 4 as "another validation layer."

### Why Not Separate Phase 6?

**Considered:** Phase 6 after Frontend integration for "advanced validation."

**Rejected because:**
1. **Quality gate too late:** Can't deploy to devnet without quality assurance
2. **Wasted frontend effort:** If fuzz tests find bugs, frontend work may need rework
3. **User expectation:** "Verification" implies all validation types, not just unit tests

**Better:** Complete all validation before offering deployment/frontend integration.

## Advanced: Coverage Gap Filling Strategy

**Challenge:** Unit tests reach 85% coverage, fuzz tests pass, but 90% gate fails.

**Current approach (Phase 4):**
1. Identify uncovered lines from Vitest report
2. Suggest unit tests to cover gaps
3. User writes tests in Phase 2 (return to TDD)
4. Re-run Phase 3 (Implementation) to make new tests pass
5. Re-run Phase 4 (Verification)

**Enhanced approach with fuzz tests:**
1. Identify uncovered lines from Vitest report
2. Check if fuzz tests could cover gaps
3. If yes: Write targeted fuzz property tests
4. If no: Suggest unit tests
5. Re-run Phase 4 (both unit and fuzz tests)

**Implementation note:** This requires understanding which coverage gaps are "fuzzable" (branches with different input values) vs. "unit-testable" (specific scenarios like auth checks).

**Recommendation:** Start simple (treat fuzz tests as pass/fail, gaps filled by unit tests), evolve later if needed.

## Open Questions for Implementation

**Q1: Does Vitest coverage capture Rendezvous execution?**
- **Likely answer:** No (separate processes)
- **Implication:** Report fuzz test pass/fail separately from coverage %
- **Action:** Test during implementation, document findings

**Q2: Should fuzz tests be written before or after implementation?**
- **Current recommendation:** After (Phase 4)
- **Alternative:** Alongside unit tests (Phase 2)
- **Trade-off:** TDD purity vs. cognitive load
- **Decision:** Start with Phase 4, consider Phase 2 in v1.2 if users request it

**Q3: How many fuzz test iterations by default?**
- **Rendezvous default:** 100 iterations
- **Recommendation:** Keep default for MVP, expose `--runs` flag in docs for power users

**Q4: Should we enforce fuzz test coverage?**
- **Option A:** Fuzz tests are optional (encouraged but not gated)
- **Option B:** Fuzz tests are required (gate blocks without them)
- **Recommendation:** Required for contracts with financial logic (token transfers, vaults), optional for simple contracts (counters, registries)
- **Implementation:** Soft enforcement (suggest fuzz tests based on contract type, allow skip)

## Sources

**Official Documentation (HIGH confidence):**
- [Stacks Fuzz Testing Guide](https://docs.stacks.co/guides-and-tutorials/testing-smart-contracts/fuzz-testing) - Official integration guide (404 error, may be new content)
- [Rendezvous GitHub Repository](https://github.com/stacks-network/rendezvous) - Official source, installation, usage patterns
- [Rendezvous Documentation](https://stacks-network.github.io/rendezvous/) - Official docs (attempted but redirect failed)
- [Test-Driven Stacks Development with Clarinet](https://dev.to/stacks/test-driven-stacks-development-with-clarinet-2e4i) - TDD workflow context

**Research & Patterns (MEDIUM confidence):**
- [What is Fuzz Testing? 2026 Guide](https://www.orangemantra.com/blog/what-is-fuzz-testing/) - General fuzz testing concepts
- [Fuzz Testing Beginner's Guide](https://betterstack.com/community/guides/testing/fuzz-testing/) - Fuzz testing principles
- [Smart Fuzzing for TDD](https://huddle.eurostarsoftwaretesting.com/smart-fuzzing-for-test-driven-development-sftdd/) - TDD integration patterns

**Existing Project Context (HIGH confidence):**
- Current SKILL.md (595 lines, 5-phase workflow)
- Reference: clarity-tdd.md (unit testing patterns with Vitest + Clarinet SDK)
- Existing Phase 4: Verification (90% coverage gate, security review)
