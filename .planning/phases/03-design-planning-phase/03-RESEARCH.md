# Phase 3: Design & Planning Phase - Research

**Researched:** 2026-01-29
**Domain:** Smart contract design methodology, Clarity best practices, modular architecture, pseudo code templates
**Confidence:** HIGH

## Summary

Phase 3 focuses on enhancing the Design & Planning phase of the `stacks-dev` skill to guide users through contract design with pseudo code, logic flow planning, and best practices review. The research reveals that effective smart contract design follows a structured approach: requirements gathering → data structure definition → public interface specification → upgradability planning. This design-first methodology is critical because smart contracts are immutable once deployed, making thorough upfront planning essential.

The Clarity Book provides authoritative best practices across three domains: coding style (eliminate unnecessary `begin`, use meaningful errors, prefer `asserts!` over nested conditionals), storage optimization (store hashes not data, leverage `at-block` for history, minimize on-chain storage), and upgradability patterns (modular architecture, stateless logic contracts, dynamic principal references). The ExecutorDAO framework demonstrates the gold-standard modular pattern: minimal core contract for execution, pluggable extension contracts for features, ownership via sending context.

For pseudo code and design documents, the standard approach includes: contract purpose/requirements, data structures (constants, data-vars, maps), public interface specification (public functions, read-only functions, error codes), and modular architecture diagrams. Design documents serve as executable specifications that guide TDD implementation and provide reference during development.

**Primary recommendation:** Enhance clarity-design.md with: (1) pseudo code template structure, (2) specific Clarity Book best practice checks with examples, (3) modular architecture guidance based on ExecutorDAO pattern, (4) links to authoritative source sections rather than duplicating content.

## Standard Stack

The established tools and resources for Clarity contract design:

### Core

| Resource | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Clarity Book | Latest | Authoritative best practices | Official language documentation, chapter 13 covers all design patterns |
| Stacks Documentation | Latest | Technical specifications | Official Stacks blockchain docs, Clarity language reference |
| Clarity Language | 2.0+ | Smart contract language | Decidable, secure by design, interpreted (human-readable) |

### Supporting

| Resource | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ExecutorDAO | Current | Modular architecture reference | When designing upgradeable contract systems |
| SIP Standards | Latest | Token/NFT interfaces | When implementing standard-compliant contracts (SIP-009, SIP-010) |
| CertiK Security Checklist | 2026 | Security design review | During design review phase before implementation |

### Domain-Specific (Design Phase)

| Resource | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Clarity Book Ch13-01 | Latest | Coding style best practices | Review during design for style guidance |
| Clarity Book Ch13-02 | Latest | Storage optimization | Planning data structures and on-chain storage |
| Clarity Book Ch13-03 | Latest | Contract upgradability | Designing modular, upgradeable architectures |
| Clarity Book Ch11 | Latest | Marketplace example | Complete design-to-implementation reference |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Clarity Book | Embedded best practices | Book is authoritative, stays current, avoids duplication |
| Link to docs | Duplicate content | Links stay current, reduce skill size, avoid stale info |
| Formal specs (Symboleo) | Informal pseudo code | Formal specs add complexity; pseudo code is accessible |
| Monolithic contracts | Modular architecture | Modularity enables upgrades but adds initial complexity |

**Installation:**
```bash
# No installation needed - all resources are web-based documentation
# Reference URLs in clarity-design.md reference file
```

## Architecture Patterns

### Recommended Design Document Structure

```
design-docs/
├── {contract-name}-design.md    # Design document per contract
│   ├── Purpose & Requirements   # What problem does this solve?
│   ├── Data Structures         # Constants, data-vars, maps
│   ├── Public Interface        # Function signatures, error codes
│   ├── Pseudo Code            # Logic flow before implementation
│   ├── Upgradability Plan     # Modular architecture if needed
│   └── Best Practices Review  # Checklist against Clarity Book
└── architecture-diagram.md     # System-level contract interactions
```

### Pattern 1: Design Document Template

**What:** Structured template for contract design before implementation
**When to use:** Every new contract, before writing tests or implementation
**Source:** Synthesized from [DeltaDeFi Design Document](https://docs.deltadefi.io/faq/project-catalyst-f12-milestone-reporting/smart-contract-design-document), [Smart Contract Templates](https://arxiv.org/pdf/1612.04496), [Clarity Book Ch11](https://book.clarity-lang.org/ch11-00-building-a-marketplace.html)

**Template sections:**

```markdown
# Contract Name: {contract-name}

## Purpose
[What problem does this contract solve? Who are the users?]

## Requirements
- [ ] Requirement 1 (from user story)
- [ ] Requirement 2
- [ ] Requirement 3

## Data Structures

### Constants
- `CONTRACT-OWNER`: Principal who deployed contract
- `ERR-NOT-AUTHORIZED`: (err u401) - Authorization failure
- `ERR-NOT-FOUND`: (err u404) - Resource not found
- `ERR-{DOMAIN-SPECIFIC}`: (err u1000+) - Domain errors

### Data Variables
- `total-supply` (uint): Total token supply
- `{var-name}` ({type}): {purpose}

### Maps
- `balances` (principal => uint): User token balances
- `{map-name}` ({key-type} => {value-type}): {purpose}

## Public Interface

### Public Functions (State-Changing)
- `transfer(amount: uint, recipient: principal) -> (response bool uint)`
  - Purpose: Transfer tokens between accounts
  - Authorization: Any user with sufficient balance
  - Validations: amount > 0, balance >= amount
  - State changes: Update sender and recipient balances

### Read-Only Functions (Queries)
- `get-balance(account: principal) -> uint`
  - Purpose: Query account token balance
  - Returns: Balance or u0 if not found

### Error Codes
- u401: Not authorized
- u404: Not found
- u1001: Insufficient balance
- u1002: Invalid amount

## Pseudo Code

### transfer function
```
function transfer(amount, recipient):
  // Validation
  assert amount > 0, ERR-INVALID-AMOUNT
  assert sender-balance >= amount, ERR-INSUFFICIENT-BALANCE

  // State updates
  sender-balance = sender-balance - amount
  recipient-balance = recipient-balance + amount

  return (ok true)
```

## Modular Architecture

[If upgradability needed]
- Core contract: {name} - Execution and authorization
- Extension contracts: {name} - Specific features
- Data contract: {name} - Persistent storage

## Best Practices Checklist

Coding Style:
- [ ] No unnecessary `begin` blocks
- [ ] Use `asserts!` instead of nested `if` statements
- [ ] Use `unwrap!` with error codes, not `unwrap-panic`
- [ ] Meaningful error codes (HTTP-style for standard, u1000+ for domain)

Storage:
- [ ] Store hashes, not large data (use off-chain storage)
- [ ] Use `at-block` for historical queries instead of storing history
- [ ] Minimize on-chain storage (users pay per byte)

Upgradability:
- [ ] Modular design (separate logic from data if upgradability needed)
- [ ] Use dynamic principals (data-var) not constants for contract references
- [ ] Plan authorization pattern (single owner vs. multi-sig)
```

### Pattern 2: Modular Architecture (ExecutorDAO Pattern)

**What:** Separate core execution from feature extensions for upgradability
**When to use:** When contract may need upgrades, feature additions, or governance
**Source:** [ExecutorDAO by Marvin Janssen](https://github.com/MarvinJanssen/executor-dao)

**Three core tenets:**
1. **Proposals as Smart Contracts**: Governance actions are executable contracts implementing a trait
2. **Core + Extensions Separation**: Minimal core for execution, extensions for all features
3. **Ownership via Sending Context**: Extensions gain privileges by checking caller context

**Contract separation model:**

```clarity
;; Core Contract (executor-dao.clar)
;; Purpose: Execute proposals, maintain extensions registry
(define-public (execute (proposal <proposal-trait>))
  (begin
    (asserts! (is-authorized-extension contract-caller) ERR-NOT-AUTHORIZED)
    (as-contract (contract-call? proposal execute))
  )
)

;; Extension Contract (example: voting.clar)
;; Purpose: Add voting feature
(define-public (cast-vote (proposal-id uint) (vote bool))
  (begin
    ;; Extension logic
    (asserts! (is-dao-or-extension) ERR-NOT-AUTHORIZED)
    ;; ... voting logic
  )
)

;; Data Contract (storage.clar)
;; Purpose: Persistent data storage
(define-map token-balances principal uint)
(define-public (set-balance (account principal) (amount uint))
  (begin
    (asserts! (is-dao-or-extension) ERR-NOT-AUTHORIZED)
    (ok (map-set token-balances account amount))
  )
)
```

**Benefits:**
- Extensions can be disabled and replaced without touching core or data
- No data migration when upgrading logic
- Third-party contracts can be owned by DAO for governance

### Pattern 3: Clarity Book Best Practices Application

**What:** Apply chapter 13 best practices during design review
**When to use:** After pseudo code, before writing tests
**Source:** [Clarity Book Chapter 13](https://book.clarity-lang.org/ch13-00-best-practices.html)

**Coding Style Checks:**

| Anti-Pattern | Best Practice | Rationale |
|--------------|---------------|-----------|
| `(begin (ok (some-expr)))` | `(ok (some-expr))` | `begin` has runtime cost; remove when single expression |
| Nested `let` blocks | Sequential bindings in single `let` | Later expressions can reference earlier ones |
| `(unwrap-panic ...)` | `(unwrap! ... err-code)` | Panic gives no meaningful error to caller |
| Nested `if` conditionals | `(asserts! ...)` statements | More readable, fails early with clear error |
| Redundant `match` passthrough | Direct expression | Don't wrap just to return same values |

**Storage Optimization Checks:**

| Question | Guidance | Example |
|----------|----------|---------|
| Does this data need to be on-chain? | Store hash, keep data off-chain (IPFS, Gaia) | Job posting content vs. posting hash |
| Is historical data needed? | Use `at-block` instead of storing snapshots | Query past balances vs. storing history |
| Can this be computed? | Compute on-demand vs. storing derived data | Calculate total from balances vs. storing total |

**Upgradability Checks:**

| Design Decision | Modular Approach | Monolithic Approach |
|-----------------|------------------|---------------------|
| Will logic change? | Separate logic and data contracts | Single contract, no upgrade path |
| Contract references | Use `data-var` for dynamic principals | Use constants, cannot change |
| Authorization | Multi-principal or DAO governance | Single owner, key loss risk |

### Pattern 4: Requirements → Pseudo Code → Tests Flow

**What:** Design flows into tests, tests flow into implementation
**When to use:** Every contract development cycle
**Source:** [Architectural Design for Smart Contracts](https://arxiv.org/html/2401.01891v1), [Smart Contract Development Guide 2026](https://www.solulab.com/smart-contract-development-guide/)

**Five-phase flow:**

```
1. Construction (Design Phase)
   - Define terms, functionality, requirements
   - Write pseudo code
   - Document data structures and interface
   - Review against best practices

2. Test Specification (TDD Phase)
   - Convert pseudo code to test cases
   - Write tests before implementation
   - Tests serve as executable specifications

3. Implementation
   - Write Clarity code to pass tests
   - Follow pseudo code logic flow

4. Static Analysis
   - Apply Clarinet check for syntax/types
   - Review against design document

5. Dynamic Analysis
   - Run tests, verify coverage
   - Compare behavior to requirements
```

### Anti-Patterns to Avoid

- **No Design Document**: Jumping directly to implementation without planning data structures and interface
- **Vague Requirements**: "Token contract" without specifying functions, authorization, or edge cases
- **Monolithic Design**: Single contract with all logic when modular approach would enable upgrades
- **Embedded Documentation**: Duplicating Clarity Book content instead of linking to authoritative source
- **Skipping Best Practices Review**: Not checking design against Ch13 before implementation
- **Hardcoded Contract References**: Using `define-constant` for contract principals that may need updates
- **Ignoring Immutability**: Designing as if contracts can be edited after deployment

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token standard interface | Custom token functions | SIP-010 trait implementation | Standard interface, interoperability, ecosystem compatibility |
| NFT standard interface | Custom NFT functions | SIP-009 trait implementation | Standard metadata, marketplace compatibility |
| Multi-sig authorization | Custom signature verification | Multi-principal pattern from Clarity Book | Well-tested, clear semantics |
| DAO governance | Custom voting logic | ExecutorDAO framework | Battle-tested, modular, extensible |
| Historical queries | Storing snapshots in maps | `at-block` built-in function | Native blockchain feature, no storage cost |
| Pseudo code templates | Custom format | Standard design document template | Consistent across projects, guides TDD |

**Key insight:** Clarity's decidability and interpreted nature mean design patterns are well-established and documented. Reference authoritative sources (Clarity Book, SIP standards, ExecutorDAO) rather than creating custom approaches that may miss edge cases.

## Common Pitfalls

### Pitfall 1: Skipping Pseudo Code Phase

**What goes wrong:** Developers jump directly to writing Clarity code without planning logic flow, resulting in unclear requirements, missing edge cases, and frequent rewrites

**Why it happens:** Pseudo code feels like extra work; experienced developers think they can code directly

**How to avoid:**
- Enforce design document creation before TDD phase
- Use pseudo code template to structure thinking
- Treat pseudo code as executable specification for tests
- Review pseudo code against requirements before proceeding

**Warning signs:**
- Tests written without clear specification
- Frequent "didn't think about that case" during implementation
- Requirements discovered during coding phase
- Multiple refactors of core logic

**Example - BAD (no pseudo code):**
```clarity
;; Implementation without design
(define-public (transfer (amount uint) (to principal))
  (let ((sender-bal (get-balance tx-sender)))
    (if (>= sender-bal amount)
      (begin
        (map-set balances tx-sender (- sender-bal amount))
        ;; Wait, what about the recipient balance?
        ;; Should we check if amount is zero?
        ;; What error code to return?
        (ok true))
      (err u1))))  ;; Generic error, what does this mean?
```

**Example - GOOD (pseudo code first):**
```
Pseudo code:
  function transfer(amount, recipient):
    assert amount > 0, ERR-INVALID-AMOUNT
    assert sender-balance >= amount, ERR-INSUFFICIENT-BALANCE
    sender-balance -= amount
    recipient-balance += amount
    return (ok true)

Then implement following the spec.
```

### Pitfall 2: Ignoring Clarity Book Best Practices During Design

**What goes wrong:** Design includes patterns that will fail best practices review, requiring redesign after implementation

**Why it happens:** Designers unfamiliar with Clarity-specific patterns, applying patterns from other languages

**How to avoid:**
- Reference Clarity Book Ch13 during design phase
- Include best practices checklist in design document template
- Review coding style, storage, and upgradability sections
- Link to specific Clarity Book chapters for each pattern used

**Warning signs:**
- Design uses `unwrap-panic` for error handling
- Nested `if` conditionals in pseudo code
- Large data structures planned for on-chain storage
- Hardcoded contract addresses in design
- Single owner with no backup for critical operations

**Example - BAD (anti-patterns in design):**
```markdown
## Pseudo Code

function submit-job-posting(title, description, salary):
  job-id = next-id
  store job-posting {
    id: job-id,
    title: title,              // Long string on-chain
    description: description,  // Entire description on-chain!
    salary: salary
  }
  return job-id
```

**Example - GOOD (best practices applied):**
```markdown
## Pseudo Code

function submit-job-posting(posting-hash):
  // Store hash only; full posting lives off-chain (IPFS/Gaia)
  assert posting-hash is valid buff 32
  assert posting not already exists
  job-id = next-id
  store job-posting {
    id: job-id,
    posting-hash: posting-hash,  // 32 bytes vs. kilobytes
    poster: tx-sender
  }
  return (ok job-id)

## Best Practices Applied
- Storage: Hash on-chain, data off-chain (Ch13-02)
- Error handling: Use asserts with meaningful errors (Ch13-01)
```

### Pitfall 3: Monolithic Design When Modularity Needed

**What goes wrong:** Designing single contract for complex system that will need upgrades, resulting in no upgrade path when requirements change

**Why it happens:** Modular architecture seems complex; not considering future upgrade needs

**How to avoid:**
- Ask "Will this need upgrades?" during design phase
- Reference ExecutorDAO pattern for modular architecture
- Separate concerns: data storage, business logic, execution
- Use dynamic principals (data-var) instead of constants

**Warning signs:**
- Single contract with >500 lines in design
- All logic and data in one contract
- No upgrade strategy mentioned in design doc
- Contract addresses hardcoded as constants
- "We'll redeploy if we need changes" attitude

**Example - BAD (monolithic):**
```markdown
## Architecture

Single contract: marketplace.clar
- Stores all NFT listings (data)
- Implements buy/sell logic (logic)
- Handles payments (execution)
- No upgrade path

If we need to add features or fix logic, we must:
1. Deploy new contract
2. Migrate all listing data (expensive!)
3. Update all frontend integrations
```

**Example - GOOD (modular):**
```markdown
## Architecture

Based on ExecutorDAO pattern:

Core: marketplace-core.clar
- Executes transactions
- Maintains extension registry
- Provides authorization checks

Extensions:
- listing-v1.clar: Buy/sell logic (upgradeable to listing-v2.clar)
- payment-v1.clar: Payment processing (add new payment types)

Data:
- listing-storage.clar: Persistent listing data
- Survives logic upgrades

Upgrade path:
1. Deploy new extension (e.g., listing-v2.clar)
2. Submit proposal to enable new extension
3. Data remains in place, no migration needed
```

### Pitfall 4: Vague Error Handling Design

**What goes wrong:** Design doesn't specify error codes or conditions, leading to unclear error responses and difficult debugging

**Why it happens:** Error handling treated as implementation detail, not design concern

**How to avoid:**
- Define error codes during design phase
- Use HTTP-style codes for standard errors (401, 404)
- Use domain-specific codes (u1000+) for business logic errors
- Document error conditions in pseudo code

**Warning signs:**
- No error codes in design document
- Generic errors like "err u1" for all failures
- Missing error handling in pseudo code
- No specification of validation failures

**Example - BAD (no error design):**
```markdown
## Public Interface

transfer(amount, recipient) -> response
  - Transfers tokens
  - Returns error if something goes wrong
```

**Example - GOOD (errors specified):**
```markdown
## Error Codes

- ERR-NOT-AUTHORIZED (err u401): Caller not authorized
- ERR-NOT-FOUND (err u404): Account not found
- ERR-INVALID-AMOUNT (err u1001): Amount must be > 0
- ERR-INSUFFICIENT-BALANCE (err u1002): Sender balance < amount

## Public Interface

transfer(amount: uint, recipient: principal) -> (response bool uint)
  - Transfers tokens from tx-sender to recipient
  - Returns: (ok true) on success
  - Errors:
    - u1001: amount is 0
    - u1002: sender balance < amount

## Pseudo Code

function transfer(amount, recipient):
  assert amount > 0, ERR-INVALID-AMOUNT  // u1001
  assert sender-balance >= amount, ERR-INSUFFICIENT-BALANCE  // u1002
  // ... transfer logic
  return (ok true)
```

### Pitfall 5: Not Linking to Authoritative Sources

**What goes wrong:** Design document embeds copied content from Clarity Book or Stacks docs, which becomes stale when official docs update

**Why it happens:** Convenience of having everything in one place

**How to avoid:**
- Link to specific Clarity Book chapters/sections
- Reference Stacks docs URLs, don't copy API documentation
- Use authoritative sources as single source of truth
- Keep design document focused on project-specific decisions

**Warning signs:**
- Design doc includes pages of Clarity syntax reference
- Copied examples from Clarity Book embedded in design
- No URLs to official documentation
- Design doc becomes reference manual instead of design specification

**Example - BAD (embedded docs):**
```markdown
## Clarity Map Reference

Maps in Clarity are key-value stores...
[200 lines of copied Clarity Book content about maps]

## Our Maps

We'll use a map for balances.
```

**Example - GOOD (links to sources):**
```markdown
## Data Structures

### Maps

Reference: [Clarity Book Ch4: Maps and Variables](https://book.clarity-lang.org/ch04-00-storing-data.html)

Our contract uses:
- `balances` (principal => uint): Token balances per account
  - Access pattern: Frequent reads, updates on transfer
  - Justification: Supports O(1) balance lookups

Best practice applied: Using map instead of list for balance storage (see Ch13-02)
```

## Code Examples

Verified patterns from official sources:

### Example 1: Design Document Template (Complete)

Source: Synthesized from [Clarity Book Ch11](https://book.clarity-lang.org/ch11-00-building-a-marketplace.html), [DeltaDeFi Design Doc](https://docs.deltadefi.io/faq/project-catalyst-f12-milestone-reporting/smart-contract-design-document)

```markdown
# Contract Name: NFT Marketplace

## Purpose
Enable trustless buying and selling of NFTs with flexible payment options.

## Requirements
- [ ] Users can list NFTs for sale with expiration
- [ ] Buyers can purchase listed NFTs
- [ ] Sellers can cancel listings before expiration
- [ ] Support STX and SIP-010 token payments
- [ ] Optional intended buyer (negotiated sales)

## Data Structures

### Constants
- `CONTRACT-OWNER`: tx-sender (deployer)
- `ERR-NOT-AUTHORIZED`: (err u401)
- `ERR-NOT-FOUND`: (err u404)
- `ERR-LISTING-EXPIRED`: (err u1001)
- `ERR-NFT-NOT-OWNED`: (err u1002)
- `ERR-PAYMENT-FAILED`: (err u1003)

### Maps
- `listings`: uint => {
    nft-asset-contract: principal,
    token-id: uint,
    expiration: uint,
    price: uint,
    payment-asset: (optional principal),
    seller: principal,
    intended-buyer: (optional principal)
  }
- `listing-count`: uint (next listing ID)

## Public Interface

### Public Functions

`list-nft(nft-contract, token-id, expiration, price, payment-asset, intended-buyer)`
- Purpose: List NFT for sale
- Authorization: Must own the NFT
- Validations: price > 0, expiration > current block
- State: Transfer NFT to contract, create listing

`unlist-nft(listing-id)`
- Purpose: Cancel listing, return NFT
- Authorization: Must be seller or expired + any caller
- State: Delete listing, return NFT to seller

`buy-nft(listing-id)`
- Purpose: Purchase listed NFT
- Authorization: Any caller (or intended buyer if specified)
- Validations: Not expired, payment successful
- State: Transfer payment to seller, NFT to buyer, delete listing

### Read-Only Functions

`get-listing(listing-id)` -> (optional listing-data)
- Returns listing data or none

## Pseudo Code

### list-nft function
```
function list-nft(nft-contract, token-id, expiration, price, payment-asset, intended-buyer):
  // Validation
  assert price > 0, ERR-INVALID-AMOUNT
  assert expiration > current-block, ERR-INVALID-EXPIRATION
  assert caller owns NFT, ERR-NFT-NOT-OWNED

  // Transfer NFT to contract for escrow
  transfer-nft(nft-contract, token-id, from: caller, to: contract)

  // Create listing
  listing-id = next-listing-id
  store listing {
    nft: (nft-contract, token-id),
    expiration: expiration,
    price: price,
    payment-asset: payment-asset,
    seller: caller,
    intended-buyer: intended-buyer
  }
  increment next-listing-id

  return (ok listing-id)
```

### buy-nft function
```
function buy-nft(listing-id):
  // Fetch and validate listing
  listing = get-listing(listing-id)
  assert listing exists, ERR-NOT-FOUND
  assert current-block < listing.expiration, ERR-LISTING-EXPIRED
  if listing.intended-buyer exists:
    assert caller == listing.intended-buyer, ERR-NOT-AUTHORIZED

  // Process payment
  if listing.payment-asset exists:
    transfer-token(listing.payment-asset, listing.price, from: caller, to: listing.seller)
  else:
    transfer-stx(listing.price, from: caller, to: listing.seller)

  // Transfer NFT to buyer
  transfer-nft(listing.nft-contract, listing.token-id, from: contract, to: caller)

  // Clean up
  delete listing

  return (ok true)
```

## Modular Architecture

Not needed for v1 - monolithic contract acceptable.

If future upgrades needed:
- Core: marketplace-core.clar (execution)
- Logic: listing-logic-v1.clar (buy/sell/cancel)
- Data: listing-storage.clar (persistent listings)

## Best Practices Checklist

Coding Style:
- [x] No unnecessary `begin` blocks in pseudo code
- [x] Use `asserts!` for validation (see pseudo code)
- [x] Meaningful error codes (HTTP + domain-specific)
- [ ] Review implementation for sequential `let` bindings

Storage:
- [x] Minimal on-chain data (only essential listing info)
- [x] NFT held in escrow, not duplicated data
- [ ] Consider storing listing data hash if fields grow

Upgradability:
- [x] Not needed for v1 (simple marketplace)
- [ ] If v2 needed, apply modular pattern above
```

### Example 2: Modular Architecture with Dynamic Principals

Source: [Clarity Book Ch13-03](https://book.clarity-lang.org/ch13-03-contract-upgradability.html), [ExecutorDAO](https://github.com/MarvinJanssen/executor-dao)

```clarity
;; Data Contract - Persistent storage
(define-map balances principal uint)

;; Only authorized contracts can modify
(define-read-only (is-authorized (caller principal))
  (or
    (is-eq caller (var-get logic-contract))
    (is-eq caller contract-owner)
  )
)

(define-public (set-balance (account principal) (amount uint))
  (begin
    (asserts! (is-authorized contract-caller) ERR-NOT-AUTHORIZED)
    (ok (map-set balances account amount))
  )
)

;; Logic Contract v1 - Upgradeable
;; Reference to data contract is dynamic (data-var)
(define-data-var data-contract principal .token-storage)

(define-public (transfer (amount uint) (recipient principal))
  (let (
    (sender tx-sender)
    (sender-balance (contract-call? (var-get data-contract) get-balance sender))
  )
    (asserts! (>= sender-balance amount) ERR-INSUFFICIENT-BALANCE)
    (try! (contract-call? (var-get data-contract) set-balance
      sender (- sender-balance amount)))
    (try! (contract-call? (var-get data-contract) set-balance
      recipient (+ (contract-call? (var-get data-contract) get-balance recipient) amount)))
    (ok true)
  )
)

;; To upgrade: Deploy logic-v2, update data-contract reference in storage
;; No data migration needed!
```

### Example 3: Best Practices Review Checklist (In Design Doc)

Source: [Clarity Book Ch13-01](https://book.clarity-lang.org/ch13-01-coding-style.html)

```markdown
## Best Practices Review

### Coding Style (Ch13-01)

Check pseudo code against these patterns:

- [ ] **Unnecessary `begin`**:
  - ❌ `(begin (ok (expr)))`
  - ✅ `(ok (expr))`
  - Our design: All single-expression functions avoid `begin`

- [ ] **Nested conditionals**:
  - ❌ `(if a (if b (if c ...)))`
  - ✅ `(asserts! a err-a) (asserts! b err-b) (asserts! c err-c)`
  - Our design: Using sequential assertions in transfer function

- [ ] **Error handling**:
  - ❌ `(unwrap-panic ...)`
  - ✅ `(unwrap! ... err-code)` or `(try! ...)`
  - Our design: All unwraps use explicit error codes (u401, u404, u1001+)

- [ ] **Sequential `let` bindings**:
  - ✅ Use single `let` with dependent variables
  - Our design: transfer function uses sequential evaluation

Reference: https://book.clarity-lang.org/ch13-01-coding-style.html

### Storage (Ch13-02)

- [ ] **On-chain data minimization**:
  - Question: Does this data need immutability/trustlessness?
  - Our design: Only essential listing metadata on-chain (no descriptions)

- [ ] **Historical queries**:
  - ❌ Store history in maps/lists
  - ✅ Use `at-block` to query past state
  - Our design: No history stored; use `at-block` if needed

- [ ] **Hash-based storage**:
  - For large data: Store hash, keep data off-chain
  - Our design: NFT metadata lives in NFT contract (follows SIP-009)

Reference: https://book.clarity-lang.org/ch13-02-what-to-store-on-chain.html

### Upgradability (Ch13-03)

- [ ] **Modularity needed?**
  - Will logic change? Yes → Modular architecture
  - Our design: v1 monolithic acceptable; v2 plan documented

- [ ] **Dynamic principals**:
  - ❌ `(define-constant other-contract .contract-v1)`
  - ✅ `(define-data-var other-contract principal .contract-v1)`
  - Our design: N/A for v1; would use data-var in v2

- [ ] **Authorization pattern**:
  - Single owner risk: key loss = contract frozen
  - Our design: Consider multi-sig for production

Reference: https://book.clarity-lang.org/ch13-03-contract-upgradability.html
```

### Example 4: Linking to Authoritative Sources

Source: [Clarity Book](https://book.clarity-lang.org/), [Stacks Docs](https://docs.stacks.co/)

```markdown
## Design References

### Best Practices
- [Clarity Book Chapter 13: Best Practices](https://book.clarity-lang.org/ch13-00-best-practices.html)
  - [Ch13-01: Coding Style](https://book.clarity-lang.org/ch13-01-coding-style.html) - Used for pseudo code patterns
  - [Ch13-02: Storage Optimization](https://book.clarity-lang.org/ch13-02-what-to-store-on-chain.html) - Data structure decisions
  - [Ch13-03: Contract Upgradability](https://book.clarity-lang.org/ch13-03-contract-upgradability.html) - Modular architecture if needed

### Language Reference
- [Clarity Language Functions](https://docs.stacks.co/clarity/language-functions) - Function signatures
- [Clarity Types](https://book.clarity-lang.org/ch02-00-types.html) - Data type selection

### Standards
- [SIP-009: NFT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md) - NFT trait interface
- [SIP-010: Fungible Token Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md) - FT trait interface

### Architecture Examples
- [Clarity Book Ch11: Building a Marketplace](https://book.clarity-lang.org/ch11-00-building-a-marketplace.html) - Complete example
- [ExecutorDAO](https://github.com/MarvinJanssen/executor-dao) - Modular architecture pattern

### Security
- [CertiK Clarity Best Practices](https://www.certik.com/resources/blog/clarity-best-practices-and-checklist) - Security checklist
```

## State of the Art

| Old Approach | Current Approach (2026) | When Changed | Impact |
|--------------|-------------------------|--------------|--------|
| Implementation-first | Design document with pseudo code first | Established practice | Reduces bugs, clarifies requirements before coding |
| Embedded best practices | Link to Clarity Book chapters | 2024+ | Content stays current, reduces duplication |
| Monolithic contracts | Modular architecture (ExecutorDAO pattern) | 2023+ | Enables upgrades without data migration |
| Generic error codes | HTTP-style + domain-specific codes | Clarity best practices | Better debugging, clearer API contracts |
| Copy/paste examples | Reference authoritative sources | Documentation best practice | Single source of truth, stays updated |
| Store everything on-chain | Hash on-chain, data off-chain | Storage optimization | Reduces costs, improves scalability |
| `unwrap-panic` | `unwrap!` with error codes | Clarity Book Ch13-01 | Meaningful error responses |
| Nested `if` conditionals | Sequential `asserts!` | Clarity Book Ch13-01 | More readable, runtime efficient |

**Deprecated/outdated:**
- **Informal design notes**: Use structured design document template instead
- **Implementation-first TDD**: Design → Pseudo code → Tests → Implementation is standard
- **`unwrap-panic`**: Always use `unwrap!` or `try!` with explicit error codes
- **Storing full historical data**: Use `at-block` for historical queries
- **Hardcoded contract principals**: Use `define-data-var` for upgradeable references
- **Single-owner authorization**: Consider multi-sig or DAO governance for production

## Open Questions

Things that couldn't be fully resolved:

1. **Pseudo code format standardization**
   - What we know: Pseudo code widely used in smart contract design, shown in examples
   - What's unclear: Industry standard format/syntax for blockchain pseudo code?
   - Recommendation: Use simplified Clarity-like syntax; focus on readability over formalism

2. **Design document tooling**
   - What we know: Markdown is common format for design docs
   - What's unclear: Are there specialized tools for smart contract design documentation?
   - Recommendation: Stick with Markdown; integrate into existing doc workflow

3. **Modular architecture threshold**
   - What we know: ExecutorDAO provides excellent modular pattern
   - What's unclear: At what complexity does modular architecture justify added initial complexity?
   - Recommendation: Guide users to ask "Will this need upgrades?" If yes, use modular pattern

4. **Design review automation**
   - What we know: Best practices are well-documented in Clarity Book Ch13
   - What's unclear: Can design review be partially automated with static analysis?
   - Recommendation: Manual checklist for v1; explore automation in v2

5. **Visual design tools**
   - What we know: Flow diagrams helpful for complex logic (per DeltaDeFi example)
   - What's unclear: Should skill generate or recommend specific diagramming tools?
   - Recommendation: Suggest Mermaid diagrams (markdown-compatible) for complex flows

## Sources

### Primary (HIGH confidence)

- [Clarity Book Chapter 13: Best Practices](https://book.clarity-lang.org/ch13-00-best-practices.html) - Official authoritative source
  - [Ch13-01: Coding Style](https://book.clarity-lang.org/ch13-01-coding-style.html) - All coding style best practices
  - [Ch13-02: What to Store On-Chain](https://book.clarity-lang.org/ch13-02-what-to-store-on-chain.html) - Storage optimization
  - [Ch13-03: Contract Upgradability](https://book.clarity-lang.org/ch13-03-contract-upgradability.html) - Modular architecture patterns
- [Clarity Book Chapter 11: Building a Marketplace](https://book.clarity-lang.org/ch11-00-building-a-marketplace.html) - Complete design-to-implementation example
- [ExecutorDAO by Marvin Janssen](https://github.com/MarvinJanssen/executor-dao) - Gold-standard modular architecture
- [Stacks Documentation](https://docs.stacks.co/) - Official technical specifications
- [Clarity Language Reference](https://docs.stacks.co/clarity/language-functions) - Authoritative function reference

### Secondary (MEDIUM confidence)

- [CertiK Clarity Best Practices and Checklist](https://www.certik.com/resources/blog/clarity-best-practices-and-checklist) - Security-focused best practices (2026)
- [Smart Contract Templates: Essential Requirements](https://arxiv.org/pdf/1612.04496) - Academic framework for contract templates
- [Architectural Design for Secure Smart Contract Development](https://arxiv.org/html/2401.01891v1) - Five-phase development methodology
- [DeltaDeFi Smart Contract Design Document](https://docs.deltadefi.io/faq/project-catalyst-f12-milestone-reporting/smart-contract-design-document) - Real-world design document example
- [Hiro: Write Better Smart Contracts With Clarity](https://www.hiro.so/blog/write-better-smart-contracts-with-the-programming-language-clarity) - Design principles and workflow
- [Smart Contract Development Guide 2026](https://www.solulab.com/smart-contract-development-guide/) - Current development practices

### Tertiary (LOW confidence)

- [Smart Contracts Security Design Patterns](https://link.springer.com/article/10.1007/s10664-025-10646-w) - General patterns, not Clarity-specific
- [Common Smart Contract Mistakes 2026](https://www.calibraint.com/blog/blockchain-development-mistakes) - General pitfalls across platforms

## Metadata

**Confidence breakdown:**
- Clarity Book best practices: HIGH - Official authoritative source, specific to Clarity
- Modular architecture (ExecutorDAO): HIGH - Battle-tested pattern, widely adopted in Stacks ecosystem
- Pseudo code templates: MEDIUM - Synthesized from examples, no single official standard
- Design document structure: MEDIUM - Common patterns identified, no official Clarity design doc spec
- Storage optimization: HIGH - Directly from Clarity Book Ch13-02
- Coding style: HIGH - Directly from Clarity Book Ch13-01 with specific examples

**Research date:** 2026-01-29
**Valid until:** 2026-04-29 (90 days - Clarity Book stable, best practices unlikely to change)

**Sources consulted:**
- 5 official documentation sources (Clarity Book, Stacks Docs, ExecutorDAO)
- 6 technical articles and guides (verified with official sources)
- 3 academic papers (general smart contract design)

**Gaps identified:**
- Standard pseudo code format (recommendation: use Clarity-like syntax)
- Modular architecture complexity threshold (recommendation: ask "needs upgrades?")
- Design review automation (recommendation: manual checklist v1)

**Next steps for planner:**
- Enhance clarity-design.md with pseudo code template
- Add best practices checklist from Clarity Book Ch13
- Include ExecutorDAO modular pattern with examples
- Link to Clarity Book sections instead of duplicating content
- Add design document template for users to fill out
- Keep references under 200 lines (currently ~178 lines)
