# Clarinet CLI Reference

## Contents

- [Project Setup](#project-setup)
- [Development Commands](#development-commands)
- [Local Development](#local-development)
- [Deployment Commands](#deployment-commands)
- [Quick Reference](#quick-reference)
- [External References](#external-references)

## Project Setup

### Create New Project

```bash
clarinet new my-project
cd my-project
```

Creates project structure:
```
my-project/
  Clarinet.toml        # Project configuration
  contracts/           # Clarity contracts
  tests/               # Test files
  settings/            # Network settings
```

### Add New Contract

```bash
clarinet contract new counter
```

Creates:
- `contracts/counter.clar` - Contract source
- `tests/counter.test.ts` - Test file

## Development Commands

### Check Syntax and Types

```bash
clarinet check
```

Validates all contracts for:
- Syntax errors
- Type errors
- Undefined references

Run after every contract change.

### Interactive Console

```bash
clarinet console
```

Opens REPL for:
- Testing functions interactively
- Inspecting contract state
- Experimenting with Clarity code

### Run Tests

```bash
# Run all tests
clarinet test

# Run with coverage
clarinet test --coverage

# Run specific test file
clarinet test tests/counter.test.ts

# Watch mode (re-run on changes)
clarinet test --watch
```

## Local Development

### Start Devnet

```bash
clarinet devnet start
```

Starts local Stacks blockchain with:
- Bitcoin regtest node
- Stacks node
- Pre-funded test accounts

### Stop Devnet

```bash
clarinet devnet stop
```

### Devnet Configuration

Edit `settings/Devnet.toml`:

```toml
[network]
name = "devnet"

[[accounts]]
name = "deployer"
mnemonic = "..."
balance = 10_000_000_000_000

[[accounts]]
name = "wallet_1"
mnemonic = "..."
balance = 1_000_000_000_000
```

## Deployment Commands

### Generate Deployment Plan

```bash
# For devnet
clarinet deployments generate --devnet

# For testnet
clarinet deployments generate --testnet

# For mainnet
clarinet deployments generate --mainnet
```

Creates deployment plan in `deployments/` directory.

### Apply Deployment

```bash
# Apply to devnet
clarinet deployments apply --devnet

# Apply to testnet (requires funded wallet)
clarinet deployments apply --testnet

# Apply to mainnet (requires funded wallet)
clarinet deployments apply --mainnet
```

### Deployment Plan Structure

```yaml
# deployments/default.devnet-plan.yaml
---
id: 0
name: Deploy counter contract
network: devnet
actions:
  - action: deploy
    contract: counter
    sender: deployer
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `clarinet new <name>` | Create new project |
| `clarinet contract new <name>` | Add contract to project |
| `clarinet check` | Validate contracts |
| `clarinet console` | Interactive REPL |
| `clarinet test` | Run unit tests |
| `clarinet test --coverage` | Run tests with coverage |
| `clarinet devnet start` | Start local network |
| `clarinet devnet stop` | Stop local network |
| `clarinet deployments generate` | Create deployment plan |
| `clarinet deployments apply` | Execute deployment |

### Common Flags

| Flag | Purpose |
|------|---------|
| `--manifest-path <path>` | Specify Clarinet.toml location |
| `--devnet` | Target devnet network |
| `--testnet` | Target testnet network |
| `--mainnet` | Target mainnet network |
| `--coverage` | Generate coverage report |
| `--watch` | Re-run on file changes |

## Command Automation

When executing Clarinet commands, the skill applies different automation levels based on command impact.

### Auto-Execute Commands

These commands run without confirmation (safe, reversible, or local-only):

| Command | When to Auto-Run | Notes |
|---------|------------------|-------|
| `clarinet check` | After every contract edit | Always safe, just validates |
| `clarinet test` | When running test suites | Local execution only |
| `clarinet contract new <name>` | Adding contracts | Creates files, confirm creation in response |
| `clarinet deployments generate --devnet` | Preparing devnet deployment | Just creates plan file |
| `clarinet deployments apply --devnet` | Deploying to local devnet | Local network, easily reset |

### Confirmation Required

These commands require explicit user confirmation:

| Command | Reason | Confirmation Pattern |
|---------|--------|---------------------|
| `clarinet new <name>` | May overwrite existing project | Check for Clarinet.toml first, warn if exists |
| `clarinet devnet start` | Long-running process, needs dedicated terminal | Suggest opening in separate terminal |
| `clarinet deployments apply --testnet` | Costs real testnet tokens | Show plan summary, request confirmation |
| `clarinet deployments apply --mainnet` | Costs real STX | Show plan summary, explicit "deploy to mainnet" confirmation |
| Network tier escalation | Moving from devnet to testnet/mainnet | Always confirm tier change |

### Pre-Command Detection

Before executing commands, check prerequisites:

```bash
# Check for existing project (before clarinet new)
if [ -f "Clarinet.toml" ]; then
  echo "WARNING: Clarinet.toml already exists"
fi

# Check for Clarinet installation (before any command)
if ! command -v clarinet &> /dev/null; then
  echo "Clarinet not found. Install: brew install clarinet"
fi

# Check for Docker (before devnet commands)
if ! docker info &> /dev/null; then
  echo "Docker not running. Start Docker Desktop first."
fi
```

### Decision Tree

```
User requests CLI operation
    |
    ├── Is it a read/check operation?
    │   └── YES → Auto-execute (clarinet check, clarinet test)
    |
    ├── Is it creating local files?
    │   ├── New contract → Auto-execute, confirm creation
    │   └── New project → Check for existing, warn if overwrite
    |
    ├── Is it a deployment?
    │   ├── Devnet → Auto-execute (local network)
    │   ├── Testnet → Show plan, request confirmation
    │   └── Mainnet → Show plan, explicit confirmation required
    |
    └── Is it starting a service?
        └── Devnet start → Suggest dedicated terminal, don't auto-background
```

## Error Handling

When `clarinet check` returns errors, interpret and respond appropriately.

### Error Interpretation

Parse `clarinet check` output to extract structured error information:

```
Raw error:
error: expecting expression of type 'uint', found 'int'
  --> contracts/counter.clar:15:5

Interpreted format:
- File: contracts/counter.clar
- Line: 15, Column: 5
- Type: Type mismatch
- Issue: Expected uint, found int
- Suggestion: Use (to-uint value) or change function signature to accept int
```

Common error categories:

| Category | Pattern | Example |
|----------|---------|---------|
| Syntax | "unexpected token", "expected" | Missing parenthesis, invalid keyword |
| Type | "expecting expression of type" | Wrong type passed to function |
| Analysis | "use of unresolved" | Undefined variable or function |
| Trait | "does not conform to trait" | Missing trait method implementation |

### Auto-Fix Patterns

These mechanical issues can be fixed automatically (up to 3 attempts):

**1. Unnecessary begin blocks**
```clarity
;; Before (flagged by clarinet check)
(define-public (get-value)
  (begin
    (ok counter)))

;; After (auto-fix)
(define-public (get-value)
  (ok counter))
```

**2. unwrap-panic usage**
```clarity
;; Before (unsafe)
(unwrap-panic (map-get? balances user))

;; After (auto-fix with suggested error code)
(unwrap! (map-get? balances user) (err u404))
```

**3. Obvious syntax fixes**
```clarity
;; Before: missing closing paren
(define-data-var counter uint u0

;; After: auto-fix
(define-data-var counter uint u0)
```

### Manual Intervention Required

These issues require user decision - explain the problem, don't auto-fix:

| Issue Type | Why Manual | How to Present |
|------------|------------|----------------|
| Type signature changes | Affects API contract | "Function expects uint but receives int. Options: 1) Convert with to-uint, 2) Change signature to int" |
| Undefined references | May need new definition | "Variable 'user-balance' not defined. Need to: 1) Add define-data-var, or 2) Check spelling" |
| Logic errors | Intent unclear | "Condition appears inverted. Current: (< a b), did you mean (> a b)?" |
| Trait conformance | Design decision | "Contract missing trait method 'transfer'. Add implementation or remove trait declaration?" |

### Auto-Fix Loop

```
1. Run `clarinet check`
   |
2. Parse errors
   |
3. For each error:
   |
   ├── Is it auto-fixable? (begin blocks, unwrap-panic, syntax)
   │   └── YES → Apply fix, continue to step 4
   │   └── NO → Collect for user report
   |
4. Re-run `clarinet check`
   |
5. Repeat steps 2-4 (max 3 iterations)
   |
6. After 3 attempts OR no auto-fixable errors:
   |
   ├── All errors resolved → Report success
   └── Errors remain → Present to user with explanations
```

**Escalation message format:**
```
clarinet check found errors that need your input:

1. [Type Error] contracts/counter.clar:15
   Expected uint, found int
   → Options: Convert with (to-uint ...) or change function signature

2. [Undefined] contracts/counter.clar:23
   Variable 'user-balance' not found
   → Did you mean 'user-balances' (defined on line 5)?
```

## External References

### Clarinet Documentation
- [Clarinet CLI Reference](https://docs.stacks.co/reference/clarinet/cli-reference)
- [Clarinet Installation](https://docs.stacks.co/reference/clarinet/installation)
- [Deployment Plans](https://docs.stacks.co/reference/clarinet/deployments)

---

*Reference file for stacks-dev skill - CLI commands*
