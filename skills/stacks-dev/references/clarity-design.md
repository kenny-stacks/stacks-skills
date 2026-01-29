# Clarity Contract Design Patterns

## Contents

- [Design Philosophy](#design-philosophy)
- [Data Structure Patterns](#data-structure-patterns)
- [Function Design Patterns](#function-design-patterns)
- [Error Handling](#error-handling)
- [Upgradability Considerations](#upgradability-considerations)
- [External References](#external-references)

## Design Philosophy

Start every Clarity contract with intentional design:

1. **Define data structures first** - What state does the contract manage?
2. **Specify public interface** - What can users do? What can they read?
3. **Consider upgradability** - How might requirements change?
4. **Plan error responses** - What can go wrong and how to signal it?

## Data Structure Patterns

### Constants (immutable values)

```clarity
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))
```

Use constants for: contract owner, error codes, fixed configuration values.

### Data Variables (single mutable values)

```clarity
(define-data-var total-supply uint u0)
(define-data-var contract-paused bool false)
```

Use data-var for: global counters, feature flags, single-value state.

### Maps (key-value storage)

```clarity
(define-map balances principal uint)
(define-map token-metadata uint {name: (string-ascii 64), owner: principal})
```

Use maps for: user balances, ownership records, indexed data.

## Function Design Patterns

### Public Functions (state-changing)

```clarity
(define-public (transfer (amount uint) (recipient principal))
  (let ((sender tx-sender))
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (>= (get-balance sender) amount) ERR-INSUFFICIENT-BALANCE)
    (try! (update-balance sender (- (get-balance sender) amount)))
    (try! (update-balance recipient (+ (get-balance recipient) amount)))
    (ok true)))
```

Public function checklist:
- Validate all inputs
- Check authorization
- Update state atomically
- Return meaningful response

### Read-Only Functions (queries)

```clarity
(define-read-only (get-balance (account principal))
  (default-to u0 (map-get? balances account)))

(define-read-only (get-token-uri (token-id uint))
  (ok (map-get? token-metadata token-id)))
```

Read-only functions: no state changes, no tx-sender checks for reads.

### Private Functions (internal helpers)

```clarity
(define-private (is-owner)
  (is-eq tx-sender CONTRACT-OWNER))

(define-private (update-balance (account principal) (new-balance uint))
  (ok (map-set balances account new-balance)))
```

Private functions: reusable logic, internal state updates.

## Error Handling

### Error Code Conventions

```clarity
;; Standard HTTP-style codes
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-INVALID-INPUT (err u400))

;; Domain-specific codes (start at u1000+)
(define-constant ERR-INSUFFICIENT-BALANCE (err u1001))
(define-constant ERR-ALREADY-EXISTS (err u1002))
```

### Assertion Pattern

```clarity
(asserts! (is-owner) ERR-NOT-AUTHORIZED)
(asserts! (> amount u0) ERR-INVALID-INPUT)
```

Use `asserts!` for precondition checks - fails early with clear error.

### Try Pattern

```clarity
(try! (stx-transfer? amount tx-sender recipient))
(try! (contract-call? .other-contract some-function))
```

Use `try!` to propagate errors from nested calls.

## Upgradability Considerations

### Modular Architecture

Split data storage from business logic:

```
contracts/
  data-store.clar      # Data definitions, basic CRUD
  business-logic.clar  # Rules that may change
  facade.clar          # Stable public interface
```

### Dynamic Principals Pattern

```clarity
(define-data-var logic-contract principal .business-logic-v1)

(define-public (set-logic-contract (new-logic principal))
  (begin
    (asserts! (is-owner) ERR-NOT-AUTHORIZED)
    (ok (var-set logic-contract new-logic))))
```

Allows upgrading logic contract without migrating data.

### Storage Optimization

- Store hashes on-chain, full data off-chain (IPFS, Gaia)
- Use compact representations (uint vs string where possible)
- Consider map vs data-var based on access patterns

## External References

### Clarity Book (Authoritative)
- [Types and Values](https://book.clarity-lang.org/ch02-00-types.html)
- [Functions](https://book.clarity-lang.org/ch03-00-functions.html)
- [Maps and Variables](https://book.clarity-lang.org/ch04-00-storing-data.html)

### Stacks Documentation
- [Clarity Overview](https://docs.stacks.co/clarity/overview)
- [Language Reference](https://docs.stacks.co/clarity/language-functions)

### Standards
- [SIP-010: Fungible Token Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
- [SIP-009: NFT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md)

---

*Reference file for stacks-dev skill - Design phase*
