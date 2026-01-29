# Clarity Contract Design Guide

This reference supports **Phase 1: Design** of the stacks-dev workflow. Use it to create comprehensive design documents before writing tests or implementation.

## Contents

- [Design Document Template](#design-document-template)
- [Best Practices Checklist](#best-practices-checklist)
- [Modular Architecture](#modular-architecture)
- [External References](#external-references)

---

## Design Document Template

Create a design document for each contract before implementation. Save as `design-docs/{contract-name}-design.md` in your project.

### Template Structure

```markdown
# Contract: {contract-name}

## Purpose
[What problem does this contract solve? Who are the users (principals)?]

## Requirements
- [ ] Requirement 1 (from user story)
- [ ] Requirement 2
- [ ] Requirement 3

## Data Structures

### Constants
- `CONTRACT-OWNER`: tx-sender (deployer principal)
- `ERR-NOT-AUTHORIZED`: (err u401)
- `ERR-NOT-FOUND`: (err u404)
- `ERR-{DOMAIN-SPECIFIC}`: (err u1000+)

### Data Variables
- `{var-name}` ({type}): {purpose}

### Maps
- `{map-name}` ({key-type} => {value-type}): {purpose}

## Public Interface

### Public Functions (State-Changing)
- `function-name(param: type) -> (response ok-type err-type)`
  - Purpose: {what it does}
  - Authorization: {who can call}
  - Validations: {checks performed}
  - State changes: {what gets updated}

### Read-Only Functions (Queries)
- `function-name(param: type) -> return-type`
  - Purpose: {what it returns}

### Error Codes
- u401: Not authorized
- u404: Not found
- u1001+: Domain-specific errors

## Pseudo Code

### {function-name}
```
function {name}(params):
  // Validation
  assert condition, ERR-CODE

  // State updates
  update storage

  return (ok result)
```

## Best Practices Checklist
[Use checklist from this reference]

## Modular Architecture
[If upgradability needed, document Core/Extensions/Data separation]
```

---

## Best Practices Checklist

Review your design against these patterns from the Clarity Book Chapter 13.

### Coding Style (Ch13-01)

- [ ] **No unnecessary `begin`**: Single expressions don't need `begin` wrapper
- [ ] **Sequential `asserts!`**: Use `(asserts! condition err)` instead of nested `if`
- [ ] **Explicit errors**: Use `(unwrap! ... err-code)` not `(unwrap-panic ...)`
- [ ] **Meaningful error codes**: HTTP-style (u401, u404) + domain-specific (u1000+)
- [ ] **Single `let` block**: Combine related bindings; later can reference earlier

### Storage Optimization (Ch13-02)

- [ ] **Hash on-chain, data off-chain**: Store 32-byte hash; keep full data in IPFS/Gaia
- [ ] **Use `at-block` for history**: Query past state instead of storing snapshots
- [ ] **Minimize storage**: Users pay per byte; compute derived values when possible
- [ ] **Compact types**: Prefer `uint` over `string` where semantics allow

### Upgradability (Ch13-03)

- [ ] **Assess upgrade need**: Will logic change after deployment?
- [ ] **Dynamic principals**: Use `(define-data-var contract principal)` not constants
- [ ] **Modular separation**: Core execution + Extensions + Data storage
- [ ] **Authorization pattern**: Consider multi-sig over single owner for production

---

## Modular Architecture

When contracts need upgradability, use the ExecutorDAO pattern to separate concerns.

### When to Use Modular vs Monolithic

| Factor | Use Modular | Use Monolithic |
|--------|-------------|----------------|
| Logic will change | Yes | No |
| Adding features over time | Yes | No |
| Governance needed | Yes | No |
| Simple one-off contract | No | Yes |
| Tight deployment timeline | No | Yes |

### Core + Extensions + Data Pattern

```
contracts/
  core.clar           # Execution, extension registry, authorization
  extension-v1.clar   # Feature logic (upgradeable)
  storage.clar        # Persistent data (survives upgrades)
```

**Core Contract**: Minimal - executes proposals, manages extensions
**Extensions**: Feature logic that can be replaced without data migration
**Data Contract**: Persistent storage; only authorized contracts can modify

### Dynamic Principals Pattern

```clarity
;; WRONG: Cannot upgrade
(define-constant logic-contract .logic-v1)

;; RIGHT: Can upgrade by changing data-var
(define-data-var logic-contract principal .logic-v1)

(define-public (set-logic-contract (new-logic principal))
  (begin
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    (ok (var-set logic-contract new-logic))))
```

### Upgrade Flow

1. Deploy new extension contract (e.g., `extension-v2.clar`)
2. Submit governance proposal to enable new extension
3. Disable old extension after transition period
4. Data remains in storage contract - no migration needed

---

## External References

### Clarity Book (Authoritative)

| Topic | Link | Use For |
|-------|------|---------|
| Best Practices Overview | [Ch13](https://book.clarity-lang.org/ch13-00-best-practices.html) | Design review checklist |
| Coding Style | [Ch13-01](https://book.clarity-lang.org/ch13-01-coding-style.html) | Pseudo code patterns |
| Storage Optimization | [Ch13-02](https://book.clarity-lang.org/ch13-02-what-to-store-on-chain.html) | Data structure decisions |
| Contract Upgradability | [Ch13-03](https://book.clarity-lang.org/ch13-03-contract-upgradability.html) | Modular architecture |
| Marketplace Example | [Ch11](https://book.clarity-lang.org/ch11-00-building-a-marketplace.html) | Complete design-to-implementation |
| Types Reference | [Ch2](https://book.clarity-lang.org/ch02-00-types.html) | Data type selection |

### Stacks Documentation

| Topic | Link | Use For |
|-------|------|---------|
| Clarity Overview | [docs.stacks.co/clarity](https://docs.stacks.co/clarity/overview) | Language concepts |
| Function Reference | [Language Functions](https://docs.stacks.co/clarity/language-functions) | Function signatures |

### Standards (SIPs)

| Standard | Link | Use For |
|----------|------|---------|
| SIP-009 | [NFT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md) | NFT trait interface |
| SIP-010 | [FT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md) | Fungible token trait |

### Architecture Examples

| Resource | Link | Use For |
|----------|------|---------|
| ExecutorDAO | [GitHub](https://github.com/MarvinJanssen/executor-dao) | Modular architecture pattern |

---

*Reference file for stacks-dev skill - Design phase*
