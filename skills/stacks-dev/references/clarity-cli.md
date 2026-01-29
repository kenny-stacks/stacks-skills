# Clarinet CLI Reference

## Contents

- [Quick Reference](#quick-reference)
- [Command Automation](#command-automation)
- [Error Handling](#error-handling)
- [Devnet Lifecycle](#devnet-lifecycle)
- [Deployment Safety](#deployment-safety)
- [Console Commands](#console-commands)
- [External References](#external-references)

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

When executing Clarinet commands, apply different automation levels based on command impact.

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

| Command | Reason | Confirmation Pattern |
|---------|--------|---------------------|
| `clarinet new <name>` | May overwrite existing project | Check for Clarinet.toml first, warn if exists |
| `clarinet devnet start` | Long-running process | Suggest dedicated terminal |
| `clarinet deployments apply --testnet` | Costs testnet tokens | Show plan summary, request confirmation |
| `clarinet deployments apply --mainnet` | Costs real STX | Show plan summary, explicit confirmation |
| Network tier escalation | Moving to higher tier | Always confirm tier change |

### Pre-Command Detection

```bash
# Check for existing project (before clarinet new)
[ -f "Clarinet.toml" ] && echo "WARNING: Clarinet.toml already exists"

# Check for Clarinet installation
command -v clarinet &> /dev/null || echo "Clarinet not found. Install: brew install clarinet"

# Check for Docker (before devnet commands)
docker info &> /dev/null || echo "Docker not running. Start Docker Desktop first."
```

## Error Handling

When `clarinet check` returns errors, interpret and respond appropriately.

### Error Interpretation

Parse `clarinet check` output for structured information:

```
Raw: error: expecting expression of type 'uint', found 'int'
     --> contracts/counter.clar:15:5

Interpreted:
- File: contracts/counter.clar, Line: 15, Column: 5
- Type: Type mismatch
- Issue: Expected uint, found int
- Suggestion: Use (to-uint value) or change function signature
```

| Category | Pattern | Example |
|----------|---------|---------|
| Syntax | "unexpected token", "expected" | Missing parenthesis |
| Type | "expecting expression of type" | Wrong type passed |
| Analysis | "use of unresolved" | Undefined variable |
| Trait | "does not conform to trait" | Missing method |

### Auto-Fix Patterns

Mechanical issues fixed automatically (up to 3 attempts):

**1. Unnecessary begin blocks**
```clarity
;; Before                          ;; After
(define-public (get-value)         (define-public (get-value)
  (begin                             (ok counter))
    (ok counter)))
```

**2. unwrap-panic usage**
```clarity
;; Before (unsafe)                 ;; After (with suggested error)
(unwrap-panic (map-get? ...))      (unwrap! (map-get? ...) (err u404))
```

### Manual Intervention Required

| Issue Type | Why Manual | How to Present |
|------------|------------|----------------|
| Type signature changes | Affects API | Options: convert type or change signature |
| Undefined references | May need new definition | Suggest spelling check or add definition |
| Logic errors | Intent unclear | Present question about intended behavior |

### Auto-Fix Loop

```
1. Run `clarinet check`
2. Parse errors
3. For auto-fixable: Apply fix
   For manual: Collect for user report
4. Re-run check (max 3 iterations)
5. If errors remain: Present to user with explanations
```

## Devnet Lifecycle

### Prerequisites

Before devnet commands, verify Docker:

```bash
docker info &> /dev/null || { echo "Docker not running. Start Docker Desktop first."; exit 1; }
```

Docker not installed?
- macOS: `brew install --cask docker`
- Linux: [Docker Engine installation](https://docs.docker.com/engine/install/)
- Windows: Docker Desktop with WSL2

### Starting Devnet

Suggest dedicated terminal (not background):

```
Devnet needs its own terminal to keep logs visible.

In a new terminal window, run:
  clarinet devnet start

Keep this terminal open during development.
```

### Health Check

After user starts devnet, verify node is ready:

```bash
# Wait for node (timeout 60s)
for i in {1..20}; do
  HEIGHT=$(curl -s http://localhost:20443/v2/info | jq -r '.stacks_tip_height // 0')
  [ "$HEIGHT" -gt 0 ] && { echo "Node ready! Block height: $HEIGHT"; break; }
  sleep 3
done
```

**Troubleshooting if timeout:**
1. Check devnet terminal for errors
2. Verify Docker containers: `docker ps`
3. Try: `clarinet devnet stop && clarinet devnet start`

### Session End

Always remind user to stop devnet:

```
Before ending this session, stop the devnet:
  clarinet devnet stop

This frees Docker resources. Data persists in .devnet/ for next session.
```

## Deployment Safety

### Safety Tiers

| Network | Confirmation | Pre-Check | On-Chain Verify | Risk |
|---------|--------------|-----------|-----------------|------|
| Devnet  | No           | No        | No (local)      | None |
| Testnet | Yes          | Yes       | Yes             | Low  |
| Mainnet | Yes (explicit) | Yes     | Yes             | High |

### Devnet Deployment (Auto)

No confirmation needed - local network:

```bash
clarinet deployments generate --devnet
clarinet deployments apply --devnet
```

### Testnet/Mainnet Workflow

1. **Generate plan:** `clarinet deployments generate --testnet`
2. **Show summary:** Network, deployer, contracts, estimated fees
3. **Request confirmation:** Simple yes/no for testnet; type "deploy to mainnet" for mainnet
4. **Apply:** `clarinet deployments apply --testnet`
5. **Verify on-chain:**
```bash
curl -s "https://api.testnet.hiro.so/v2/contracts/interface/DEPLOYER.CONTRACT" | jq '.functions | length'
```

### Network Switching

When switching to higher tier, always confirm:

```
Current: devnet -> Requested: testnet
You're switching from local to public testnet.
This will use real testnet tokens. Continue? [y/N]
```

For mainnet: require typing "deploy to mainnet"

## Console Commands

### Starting Console

```bash
clarinet console
```

Provides: contract access, pre-funded wallets, real-time function testing.

### Common Commands

```clarity
;; Call read-only function
>> (contract-call? .counter get-count)
(ok u0)

;; Call public function
>> (contract-call? .counter increment)
(ok u1)

;; Switch caller
>> ::set_tx_sender ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK

;; Get balances
>> ::get_assets_maps

;; Advance blocks (for time-locked functions)
>> ::advance_chain_tip 100
```

### Testing Patterns

```clarity
;; Test error conditions (unauthorized access)
>> ::set_tx_sender ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK
>> (contract-call? .counter admin-only-function)
(err u401)  ;; Expected

;; Test state changes
>> (contract-call? .counter get-count)
(ok u0)
>> (contract-call? .counter increment)
(ok u1)
>> (contract-call? .counter get-count)
(ok u1)  ;; Verified

;; Test multi-user scenarios
>> ::set_tx_sender ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK
>> (contract-call? .vault deposit u1000)
(ok true)
>> ::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
>> (contract-call? .vault withdraw u1000)
(err u403)  ;; Unauthorized - correct
```

## External References

- [Clarinet CLI Reference](https://docs.stacks.co/reference/clarinet/cli-reference)
- [Clarinet Installation](https://docs.stacks.co/reference/clarinet/installation)
- [Deployment Plans](https://docs.stacks.co/reference/clarinet/deployments)

---

*Reference file for stacks-dev skill - CLI commands*
