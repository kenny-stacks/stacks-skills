# Features Research: Rendezvous Fuzz Testing

**Domain:** Property-based fuzz testing for Clarity smart contracts
**Researched:** 2026-02-03
**Confidence:** HIGH

## Summary

Rendezvous (rv) is a specialized fuzzer for Clarity contracts that supports two testing methodologies: property-based testing (verifying function behavior across random inputs) and invariant testing (ensuring state consistency across random function call sequences). Tests are written in Clarity alongside contract code, enabling direct state access and natural property expression. The tool uses fast-check for random generation, supports shrinking to minimal counterexamples, provides context tracking for execution history, and includes dialers for JavaScript pre/post-execution hooks.

## Table Stakes

Features users expect for basic fuzz testing capability. Missing these = feature feels incomplete.

| Feature | Description | Complexity | Dependency | Notes |
|---------|-------------|------------|------------|-------|
| Property-based test execution | Run `test-*` functions with random inputs generated from type signatures | Medium | Existing unit test infrastructure | Core feature - verifies function behavior across input space |
| Invariant test execution | Run `invariant-*` functions during random state transitions | Medium | Existing unit test infrastructure | Core feature - verifies state consistency |
| Test file discovery | Automatically find and load `*.tests.clar` files alongside contracts | Low | Clarinet project structure | Already standardized in v1.0 |
| Configurable run count | Allow users to specify number of test iterations (default 100) | Low | None | Standard fuzz testing configuration |
| Seed-based replay | Reproduce specific test failures using seed from failure report | Low | None | Critical for debugging - enables deterministic reproduction |
| Failure reporting | Display seed, counterexample, function name, arguments, and error details | Medium | None | Must match Rendezvous format for familiarity |
| Shrinking | Automatically reduce failing inputs to minimal counterexample | High | fast-check or equivalent | Essential for debugging - removes noise from failures |
| Test discarding | Skip tests with invalid inputs via `(ok false)` or `can-*` functions | Low | None | Efficiency feature - avoid wasting runs on invalid inputs |
| Context tracking | Record function call history in `context` map for invariant checks | Medium | None | Enables sophisticated invariants based on execution history |
| Basic type generation | Generate random values for primitives (uint, int, bool, string, buffer, principal) | Medium | None | Foundation for property testing |
| List generation | Generate random lists with appropriate max lengths | Medium | None | Common Clarity type requiring special handling |

## Differentiators

Features that set advanced fuzz testing apart. Not expected, but provide significant value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Dialers (pre/post hooks) | Execute JavaScript functions before/after contract calls for external verification | High | Enables testing event emissions, SIP compliance, cross-contract interactions |
| Custom manifest support | Use `Clarinet-<contract>.toml` for test doubles/mocks | Medium | Allows testing contracts with restrictive dependencies |
| Trait reference handling | Automatically select trait implementations from project for function arguments | Medium | Critical for testing contracts using traits without manual mocking |
| Bail on first failure | Stop immediately on first failure without shrinking | Low | Useful for debugging - faster feedback when shrinking not needed |
| Multiple discard patterns | Support both in-place discarding and separate `can-*` functions | Low | Flexibility in test organization |
| Test result categorization | Display PASS/FAIL/WARN for executed/failed/discarded tests | Low | Clear feedback on test execution patterns |
| Stateful fuzzing | Maintain contract state across function call sequence | Medium | Essential for invariant testing - not just isolated property tests |
| Integration with Clarinet devnet | Run tests against Simnet session matching Clarinet.toml dependencies | Medium | Realistic testing environment matching deployment |
| Coverage-aware test selection | Prioritize function call sequences that explore new state space (future) | High | Mentioned in docs as potential enhancement |
| Symbolic execution support | Exhaustive path verification instead of random sampling (future) | Very High | Mentioned in docs as potential enhancement with Clarity VM support |

## Anti-Features

Features to explicitly NOT build - common mistakes or out-of-scope capabilities.

| Anti-Feature | Why NOT to Build | What to Do Instead |
|--------------|------------------|-------------------|
| Mainnet fuzz testing | Running fuzz tests against mainnet is dangerous and expensive | Use Simnet only - matches v1.0 devnet focus |
| Automatic invariant generation | AI-generated invariants may not reflect actual business logic requirements | Require developers to define invariants - they understand domain |
| Embedded fuzzer implementation | Reimplementing fast-check in skill would be massive scope creep | Use Rendezvous CLI - it's the authoritative tool |
| GUI/visual test runner | Claude Code is terminal-based, visual tools break workflow | Stick to CLI output - parse and present textually |
| JavaScript test authoring | Writing fuzz tests in TypeScript/JS instead of Clarity | Keep tests in Clarity - "Clarity first" philosophy, direct state access |
| Parallel test execution | Running multiple fuzz campaigns simultaneously | Sequential execution - simpler, matches Rendezvous design |
| Custom generator DSL | Creating special syntax for defining input generators | Use Clarity types for generation - automatic, no learning curve |
| Test result persistence | Storing all test runs in database for analysis | Show current run only - keeps skill focused |
| Mutation testing | Automatically modifying contract to verify test quality | Out of scope - different testing methodology |
| Coverage-driven shrinking | Using coverage metrics to guide shrinking | Use fast-check's built-in shrinking - proven approach |

## Property Testing Patterns

Common patterns for Clarity contracts based on authoritative sources and domain analysis.

### Pattern 1: Symmetric Operations (Reversibility)

**What:** Operations that reverse each other should return to original state.

**Example:**
```clarity
(define-public (test-reverse-list (seq (list 127 uint)))
  (begin
    (asserts! (is-eq seq (reverse (reverse seq))) ERR_ASSERTION_FAILED)
    (ok true)))
```

**When to use:** Any operation with an inverse (encrypt/decrypt, encode/decode, add/subtract).

**Complexity:** Low - straightforward property definition.

### Pattern 2: State Transition Invariants

**What:** State properties that must hold after any operation sequence.

**Example:**
```clarity
(define-read-only (invariant-counter-never-negative)
  (>= (var-get counter) u0))

(define-read-only (invariant-balance-consistency)
  (let ((sum-of-balances (fold + (map get-balance all-users) u0)))
    (is-eq sum-of-balances (var-get total-supply))))
```

**When to use:** Testing state consistency, balance relationships, supply constraints.

**Complexity:** Medium - requires understanding domain invariants.

### Pattern 3: Context-Based Invariants

**What:** Properties based on execution history tracked in `context` map.

**Example:**
```clarity
(define-read-only (invariant-counter-gt-zero-when-increments-exceed-decrements)
  (let
    ((increment-calls (default-to u0 (get called (map-get? context "increment"))))
     (decrement-calls (default-to u0 (get called (map-get? context "decrement")))))
    (if (> increment-calls decrement-calls)
        (> (var-get counter) u0)
        true)))
```

**When to use:** Invariants that depend on function call history, not just current state.

**Complexity:** Medium - requires context map understanding.

### Pattern 4: Comparison with Reference Implementation

**What:** Compare contract output with known-good reference implementation.

**Example:**
```clarity
(define-public (test-arithmetic-matches-reference (a uint) (b uint))
  (begin
    (asserts! (is-eq (contract-add a b) (reference-add a b)) ERR_MISMATCH)
    (ok true)))
```

**When to use:** Optimized implementations, cryptographic operations, complex algorithms.

**Complexity:** High - requires reference implementation.

### Pattern 5: Boundary Value Testing

**What:** Ensure operations handle edge cases correctly.

**Example:**
```clarity
(define-public (test-transfer-handles-zero (amount uint))
  (if (<= amount u0)
      (ok false)  ;; Discard zero/negative
      (begin
        (asserts! (is-ok (transfer amount recipient)) ERR_TRANSFER_FAILED)
        (ok true))))
```

**When to use:** Operations with domain constraints (non-negative, max values).

**Complexity:** Low - combine with discard patterns.

### Pattern 6: Idempotency Checks

**What:** Operations that should produce same result when repeated.

**Example:**
```clarity
(define-public (test-normalize-idempotent (input (string-ascii 100)))
  (let ((normalized-once (normalize input)))
    (asserts! (is-eq normalized-once (normalize normalized-once)) ERR_NOT_IDEMPOTENT)
    (ok true)))
```

**When to use:** Normalization, canonicalization, status updates.

**Complexity:** Low - straightforward repetition test.

### Pattern 7: Postcondition Verification

**What:** Verify expected state changes after operations.

**Example:**
```clarity
(define-public (test-increment-increases-by-one)
  (let ((before (get-counter)))
    (try! (increment))
    (asserts! (is-eq (get-counter) (+ before u1)) ERR_POSTCONDITION_FAILED)
    (ok true)))
```

**When to use:** Any stateful operation with predictable effects.

**Complexity:** Low - fundamental testing pattern.

### Pattern 8: Test Discarding with Preconditions

**What:** Skip tests when preconditions aren't met.

**Example:**
```clarity
;; Option 1: In-place discarding
(define-public (test-divide (a uint) (b uint))
  (if (is-eq b u0)
      (ok false)  ;; Discard division by zero
      (begin
        (asserts! (is-ok (safe-divide a b)) ERR_DIVISION_FAILED)
        (ok true))))

;; Option 2: Separate discard function
(define-read-only (can-test-divide (a uint) (b uint))
  (> b u0))

(define-public (test-divide (a uint) (b uint))
  (begin
    (asserts! (is-ok (safe-divide a b)) ERR_DIVISION_FAILED)
    (ok true)))
```

**When to use:** Operations with domain constraints.

**Complexity:** Low - choose based on complexity of discard logic.

### Pattern 9: Event Emission Verification (via Dialers)

**What:** Verify SIP compliance and event correctness using JavaScript post-dialers.

**Example (JavaScript dialer):**
```javascript
async function postTransferSip010PrintEvent(context) {
  const { selectedFunction, functionCall, clarityValueArguments } = context;
  if (selectedFunction.name !== "transfer") return;

  const memoParameterIndex = 3;
  const memoGeneratedArgumentCV = clarityValueArguments[memoParameterIndex];
  if (memoGeneratedArgumentCV.type === "none") return;

  const sip010PrintEvent = functionCall.events.find(ev => ev.event === "print_event");
  if (!sip010PrintEvent) {
    throw new Error("SIP-010 requires print event with memo");
  }
}
```

**When to use:** Testing SIP compliance, event emissions, external side effects.

**Complexity:** High - requires JavaScript dialer integration.

### Pattern 10: Cross-Contract Interaction Testing (via Test Doubles)

**What:** Test contracts with restrictive dependencies using custom manifests.

**Example:**
```clarity
;; contracts/sbtc-registry-double.clar
(define-constant deployer tx-sender)

(define-read-only (is-protocol-caller (contract-flag (buff 1)) (contract principal))
  (begin
    (asserts! (is-eq tx-sender deployer) (err u1234567))
    (ok true)))
```

**Clarinet-sbtc-token.toml:**
```toml
[contracts.sbtc-registry]
path = 'contracts/sbtc-registry-double.clar'
```

**When to use:** Testing contracts with restrictive authorization checks.

**Complexity:** Medium - requires test double creation and manifest configuration.

## Dependencies on Existing v1.0 Features

Rendezvous fuzz testing builds on existing v1.0 Stacks development skill infrastructure:

| v1.0 Feature | How Fuzz Testing Uses It |
|--------------|--------------------------|
| Design phase (pseudo-code) | Fuzz tests validate design assumptions about edge cases |
| Unit test workflow | Fuzz tests complement unit tests - same `.tests.clar` pattern |
| Coverage validation | Fuzz testing can increase coverage by exercising untested paths |
| Clarinet integration | Rendezvous requires Clarinet project structure and Simnet |
| TDD enforcement | Fuzz tests written before implementation as part of test-first workflow |
| Best practices review | Invariant definition requires understanding Clarity patterns |

## Integration Points

How fuzz testing integrates into existing v1.0 workflow:

1. **Design phase:** Define properties and invariants during pseudo-code phase
2. **Test phase:** Write both unit tests AND fuzz tests in `*.tests.clar`
3. **Implementation:** Run fuzz tests alongside unit tests during development
4. **Coverage:** Fuzz testing complements coverage by exploring input space
5. **Frontend:** Fuzz testing validates backend contracts before frontend integration

## Workflow Implications

### When to Use Property-Based Tests

- Pure functions (read-only operations)
- Functions with mathematical properties
- Operations with clear input/output relationships
- Functions needing validation across many input variations

### When to Use Invariant Tests

- Verifying state consistency
- Testing relationships between state variables
- Ensuring contracts can't enter invalid states
- Complex state machines with multiple transitions

### When to Use Both

Most contracts benefit from both approaches:
- Property tests for individual function correctness
- Invariant tests for overall system consistency

## MVP Recommendation

For v1.1 fuzz testing milestone, prioritize:

### Must-Have (Table Stakes)
1. Property-based test execution with basic type generation
2. Invariant test execution with context tracking
3. Configurable run count and seed-based replay
4. Failure reporting with shrinking
5. Test discarding (both patterns)
6. Integration with Clarinet Simnet

### Nice-to-Have (Differentiators)
1. Dialers for event verification
2. Custom manifest support for test doubles
3. Trait reference handling

### Defer to Post-v1.1
- Coverage-aware test selection (requires Rendezvous enhancement)
- Symbolic execution support (requires Clarity VM enhancement)
- Advanced generator customization

## Complexity Assessment

| Feature Category | Overall Complexity | Risk Level |
|------------------|-------------------|------------|
| Property-based testing | Medium | Low - well-documented patterns |
| Invariant testing | Medium | Low - context map is standard Rendezvous feature |
| Context tracking | Medium | Low - automatically injected by Rendezvous |
| Shrinking | High (if custom) | Low (use Rendezvous/fast-check built-in) |
| Dialers | High | Medium - requires JS interop understanding |
| Test doubles | Medium | Low - standard Clarinet feature |
| Trait handling | Medium | Medium - depends on Clarinet AST capabilities |

## Quality Gates

For fuzz testing feature completeness:

- [ ] Can execute property-based tests with `npx rv <project> <contract> test`
- [ ] Can execute invariant tests with `npx rv <project> <contract> invariant`
- [ ] Supports `--runs`, `--seed`, `--bail` options
- [ ] Generates and displays shrunk counterexamples on failure
- [ ] Test discarding works (both in-place and `can-*` functions)
- [ ] Context map tracking available for invariants
- [ ] Integration with existing v1.0 unit test workflow
- [ ] Documentation includes property testing patterns (all 10 patterns)
- [ ] Skill guides users on when to use property vs invariant tests

## Sources

**HIGH Confidence (Official Documentation):**
- [Rendezvous GitHub Repository](https://github.com/stacks-network/rendezvous)
- [Rendezvous Official Documentation](https://stacks-network.github.io/rendezvous/)
- [Stacks Documentation - Fuzz Testing](https://docs.stacks.co/guides-and-tutorials/testing-smart-contracts/fuzz-testing)

**MEDIUM Confidence (Domain Research):**
- [Testing smart contracts - Ethereum.org](https://ethereum.org/developers/docs/smart-contracts/testing/)
- [Testing and Auditing Strategies for DeFi Smart Contracts](https://medium.com/@jitendersingh389/testing-and-auditing-strategies-for-defi-smart-contracts-b64a81449631)
- [Fuzz / Invariant Tests - Patrick Collins](https://patrickalphac.medium.com/fuzz-invariant-tests-the-new-bare-minimum-for-smart-contract-security-87ebe150e88c)
- [Property-Based Testing Comprehensive Guide](https://dev.to/keploy/property-based-testing-a-comprehensive-guide-lc2)
- [Choosing properties for property-based testing](https://fsharpforfunandprofit.com/posts/property-based-testing-2/)

All findings verified against official Rendezvous documentation and Stacks documentation where possible.
