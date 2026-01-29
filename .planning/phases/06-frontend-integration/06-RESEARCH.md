# Phase 6: Frontend Integration - Research

**Researched:** 2026-01-29
**Domain:** Stacks.js frontend integration with React/Next.js
**Confidence:** MEDIUM

## Summary

Frontend integration for Stacks blockchain applications centers on three core @stacks packages: `@stacks/connect` for wallet authentication, `@stacks/transactions` for contract interactions, and `@stacks/network` for environment configuration. The Stacks ecosystem provides official starter templates via `npm create stacks` supporting React, Next.js, and other frameworks.

Key architectural insight: Stacks uniquely implements **post-conditions**—client-side transaction safeguards that abort transactions if unexpected asset transfers occur. This security layer is critical for protecting users from malicious or buggy contracts and should be included in all contract calls involving token/STX transfers.

The standard pattern involves: (1) establishing wallet connection via `@stacks/connect`, (2) managing authentication state in React Context, (3) constructing transactions with post-conditions using `@stacks/transactions`, (4) polling transaction status via Stacks Blockchain API, and (5) configuring networks through environment variables.

**Primary recommendation:** Use official `@stacks/connect` v8+ with standardized `connect()` API, implement post-conditions for all value transfers, manage wallet state via React Context, and leverage `npm create stacks` templates as foundation. Avoid micro-stacks alternatives unless advanced framework-agnostic features are required.

## Standard Stack

The established libraries/tools for Stacks frontend development:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @stacks/connect | 8.x.x+ | Wallet authentication & transaction signing | Official library with WBIP/SIP-030 standards support; 1,940 weekly downloads vs 319 for alternatives |
| @stacks/transactions | 6.16.0+ | Transaction construction, contract calls, Clarity value encoding | Required for all blockchain interactions; includes Nakamoto update support |
| @stacks/network | Latest | Network configuration (devnet/testnet/mainnet) | Standardized network abstractions for environment switching |
| @stacks/blockchain-api-client | Latest | Transaction status polling, blockchain queries | Official client for Stacks API endpoints |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React | 18+ | UI framework | Primary frontend framework (68% of developers use React for Web3) |
| Next.js | 14-15 | Full-stack React framework | When SSR, routing, or API routes needed (71% of React jobs require Next.js) |
| TypeScript | 5.x | Type safety | Strongly recommended for contract interaction safety |
| Zustand | Latest | Lightweight state management | For complex wallet/transaction state beyond Context API |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @stacks/connect | micro-stacks | Micro-stacks offers framework-agnostic core + specialized @micro-stacks/react, but has 6x fewer downloads and less community support. Use only if you need advanced modularity or non-browser environments (Deno, Cloudflare Workers). |
| React Context | Zustand/Redux | Context API sufficient for wallet state; use Zustand for complex transaction queues or multi-wallet scenarios. Avoid Redux (overkill for most dApps). |

**Installation:**
```bash
npm install @stacks/connect @stacks/transactions @stacks/network
# Optional: for transaction polling
npm install @stacks/blockchain-api-client
```

**Starter Templates (Recommended):**
```bash
npm create stacks
# Interactive CLI with options: React (Vite), React (CRA), Next.js, Vue, Svelte, Angular
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/          # UI components
│   ├── WalletConnect.tsx
│   └── ContractCall.tsx
├── context/            # React Context providers
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   ├── useContractCall.ts
│   └── useTransactionStatus.ts
├── lib/                # Stacks.js utilities
│   ├── network.ts      # Network configuration
│   ├── transactions.ts # Transaction builders
│   └── api.ts          # Blockchain API clients
└── types/              # TypeScript definitions
    └── contracts.ts    # Contract ABIs and types
```

### Pattern 1: Authentication Context Provider

**What:** Centralized wallet state management using React Context
**When to use:** All applications requiring wallet connectivity

**Example:**
```typescript
// Source: Verified pattern from Stacks.js documentation and React best practices
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';

interface AuthContextValue {
  address: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check for existing connection on mount
    if (isConnected()) {
      const data = getLocalStorage();
      setAddress(data?.stxAddress || null);
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await connect();
      const data = getLocalStorage();
      setAddress(data?.stxAddress || null);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setAddress(null);
  };

  return (
    <AuthContext.Provider value={{
      address,
      isConnecting,
      connect: handleConnect,
      disconnect: handleDisconnect
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Pattern 2: Contract Call with Post-Conditions

**What:** Safe contract function calls with post-condition safeguards
**When to use:** ANY contract call involving STX or token transfers

**Example:**
```typescript
// Source: https://docs.stacks.co/post-conditions/implementation
import { openContractCall } from '@stacks/connect';
import { Pc, PostConditionMode, Cl } from '@stacks/transactions';
import { StacksDevnet } from '@stacks/network';

async function transferTokens(
  amount: number,
  recipient: string,
  senderAddress: string
) {
  await openContractCall({
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'my-token',
    functionName: 'transfer',
    functionArgs: [
      Cl.uint(amount),
      Cl.principal(recipient),
      Cl.none() // optional memo
    ],
    // CRITICAL: Post-conditions prevent unexpected transfers
    postConditions: [
      Pc.principal(senderAddress)
        .willSendEq(amount)
        .ft('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.my-token', 'token')
    ],
    postConditionMode: PostConditionMode.Deny, // ALWAYS use Deny mode
    network: new StacksDevnet(),
    onFinish: (data) => {
      console.log('Transaction ID:', data.txId);
      // Poll for status here
    },
    onCancel: () => {
      console.log('User cancelled transaction');
    },
  });
}
```

### Pattern 3: Read-Only Contract Calls

**What:** Query contract state without signing transactions
**When to use:** Fetching balances, reading public data, checking contract state

**Example:**
```typescript
// Source: https://docs.stacks.co/reference/stacks.js/stacks-transactions
import { fetchCallReadOnlyFunction, cvToValue, Cl } from '@stacks/transactions';
import { StacksDevnet } from '@stacks/network';

async function getTokenBalance(address: string): Promise<number> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'my-token',
    functionName: 'get-balance',
    functionArgs: [Cl.principal(address)],
    network: new StacksDevnet(),
    senderAddress: address,
  });

  return cvToValue(result).value;
}
```

### Pattern 4: Network Configuration

**What:** Environment-based network switching
**When to use:** All applications (devnet → testnet → mainnet progression)

**Example:**
```typescript
// Source: Stacks.js documentation + Next.js best practices
import { StacksMainnet, StacksTestnet, StacksDevnet } from '@stacks/network';

export function getNetwork() {
  // Next.js: Use NEXT_PUBLIC_ prefix for client-side access
  const networkEnv = process.env.NEXT_PUBLIC_STACKS_NETWORK;

  switch (networkEnv) {
    case 'mainnet':
      return new StacksMainnet();
    case 'testnet':
      return new StacksTestnet();
    default:
      return new StacksDevnet({ url: 'http://localhost:20443' });
  }
}

// .env.local example:
// NEXT_PUBLIC_STACKS_NETWORK=devnet
```

### Pattern 5: Transaction Status Polling

**What:** Monitor transaction confirmation status
**When to use:** After broadcasting transactions to provide user feedback

**Example:**
```typescript
// Source: Stacks Blockchain API documentation
async function pollTransactionStatus(txId: string): Promise<string> {
  const maxAttempts = 30;
  const pollInterval = 2000; // 2 seconds

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(
      `https://api.devnet.hiro.so/extended/v1/tx/${txId}`
    );
    const tx = await response.json();

    if (tx.tx_status === 'success') return 'success';
    if (tx.tx_status === 'abort_by_response' || tx.tx_status === 'abort_by_post_condition') {
      return 'failed';
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  return 'timeout';
}
```

### Anti-Patterns to Avoid

- **Skipping post-conditions on token transfers:** Post-conditions are Stacks' unique security feature. ALWAYS include them for STX/token operations to protect users from malicious contracts.
- **Hardcoding network in components:** Use environment variables and centralized network configuration to enable easy devnet → testnet → mainnet progression.
- **Direct private key usage in browser:** NEVER use `makeContractCall` with `senderKey` in frontend. Always use `openContractCall` from @stacks/connect to leverage wallet signing.
- **Ignoring wallet connection state:** Check `isConnected()` before calling contract functions to prevent errors.
- **Not validating with ABI:** Set `validateWithAbi: true` in contract calls to catch argument mismatches before broadcasting.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Wallet connection UI | Custom connect button logic | `connect()` from @stacks/connect | Handles wallet detection, user rejection, error states, and standardized wallet communication (WBIP/SIP-030) |
| Clarity value encoding | Manual buffer/hex conversion | `Cl` helpers (@stacks/transactions) | Handles all Clarity types (principals, tuples, lists, optionals, responses) with type safety |
| Post-condition builders | Raw post-condition objects | `Pc` fluent API (@stacks/transactions) | BDD-style API prevents syntax errors, supports all asset types (STX, FT, NFT, SFT) |
| Transaction status tracking | Manual API polling loops | @stacks/blockchain-api-client + WebSocket subscriptions | Official client handles retries, rate limiting, and WebSocket reconnection |
| Network switching | Custom network objects | StacksMainnet/Testnet/Devnet classes | Pre-configured with correct RPC endpoints, chain IDs, and defaults |

**Key insight:** Stacks.js abstracts blockchain complexity into type-safe APIs. Custom implementations miss edge cases (e.g., sponsored transactions, multi-sig, contract principals vs standard principals).

## Common Pitfalls

### Pitfall 1: Post-Condition Mode Misunderstanding

**What goes wrong:** Using `PostConditionMode.Allow` thinking it's "more permissive" for users, but it actually disables the primary security feature.

**Why it happens:** Developers assume post-conditions are restrictions rather than safeguards. "Allow" mode permits unlimited asset transfers beyond specified conditions.

**How to avoid:**
- ALWAYS use `PostConditionMode.Deny` (the secure default)
- Only use `Allow` mode when you explicitly need unspecified transfers (rare edge case)
- Document WHY if you ever use Allow mode

**Warning signs:**
- Post-conditions specified but transactions succeed despite violating them
- Users report unexpected token transfers after contract calls

### Pitfall 2: @stacks/connect Version Compatibility

**What goes wrong:** Using outdated examples from @stacks/connect v7 or earlier (e.g., `showConnect()`, `UserSession`, `AppConfig`) with v8+ which has breaking changes.

**Why it happens:** Documentation and tutorials lag behind major version releases. Version 8.x.x introduced standardized `connect()` API replacing `showConnect()`.

**How to avoid:**
- Use `npm ls @stacks/connect` to verify installed version
- For v8+: Use `connect()`, `disconnect()`, `isConnected()`, `getLocalStorage()`
- For v7: Use `showConnect()`, `UserSession`, `AppConfig` (legacy)
- Check package.json and update examples accordingly

**Warning signs:**
- TypeScript errors about missing `AppConfig` or `UserSession`
- Wallet connection works but returns different data structure than expected
- Security note: v8+ only returns current network's address (not both mainnet/testnet)

### Pitfall 3: Client-Side Environment Variable Exposure

**What goes wrong:** Storing sensitive API keys in `NEXT_PUBLIC_*` variables, exposing them in client bundle.

**Why it happens:** Developers don't understand Next.js prefix convention. Only `NEXT_PUBLIC_` variables are accessible in browser; others are server-only.

**How to avoid:**
- Use `NEXT_PUBLIC_STACKS_NETWORK` for network selection (safe to expose)
- NEVER use `NEXT_PUBLIC_ADMIN_KEY` or similar (sensitive data)
- For contract addresses on different networks, use server-side config or public constants
- Add `.env*` to `.gitignore`

**Warning signs:**
- Secrets visible in browser DevTools → Network tab → JS bundle
- Security scanners flagging exposed credentials

### Pitfall 4: Not Handling Transaction Pending State

**What goes wrong:** UI shows "success" immediately after `openContractCall` onFinish callback, but transaction is still pending on-chain.

**Why it happens:** `onFinish` fires when transaction is BROADCAST, not CONFIRMED. Block confirmation takes ~10 minutes on Stacks.

**How to avoid:**
- Display "Transaction pending..." state after onFinish
- Implement polling or WebSocket subscription for status updates
- Show transaction ID with link to explorer (e.g., `https://explorer.hiro.so/txid/${txId}?chain=testnet`)
- Update UI only when `tx_status === 'success'`

**Warning signs:**
- Users report "completed" transactions that failed
- Balance updates don't reflect immediately after transaction

### Pitfall 5: Devnet Address Hardcoding

**What goes wrong:** Using devnet deployer addresses (`ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`) in testnet/mainnet code.

**Why it happens:** Copy-paste from devnet examples without updating contract addresses for other networks.

**How to avoid:**
- Store contract addresses in environment-specific config:
  ```typescript
  const CONTRACT_ADDRESSES = {
    devnet: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.my-contract',
    testnet: 'ST2...TESTNET_ADDRESS.my-contract',
    mainnet: 'SP1...MAINNET_ADDRESS.my-contract',
  };
  ```
- Use network detection to select address: `CONTRACT_ADDRESSES[networkEnv]`

**Warning signs:**
- Testnet transactions fail with "contract not found"
- Mainnet deployments reference non-existent contracts

### Pitfall 6: Ignoring ABI Validation

**What goes wrong:** Passing wrong argument types to contract functions, transaction fails after user signs.

**Why it happens:** Skipping `validateWithAbi: true` during development to move faster.

**How to avoid:**
- ALWAYS enable ABI validation in development: `validateWithAbi: true`
- For production, consider runtime validation with explicit ABI:
  ```typescript
  import { ClarityAbi } from '@stacks/transactions';
  const abi: ClarityAbi = { /* contract ABI */ };
  validateWithAbi: abi
  ```
- Test with actual contract ABIs from Clarinet output

**Warning signs:**
- Transactions consistently fail with unclear error messages
- "Argument type mismatch" errors in Stacks explorer

## Code Examples

Verified patterns from official sources:

### Multi-Asset Post-Conditions (Complex Transaction)

```typescript
// Source: https://docs.stacks.co/post-conditions/implementation
import { openContractCall } from '@stacks/connect';
import { Pc, PostConditionMode, Cl } from '@stacks/transactions';

async function complexSwap(
  userAddress: string,
  nftTokenId: number,
  ftAmount: number
) {
  await openContractCall({
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'marketplace',
    functionName: 'swap-nft-for-tokens',
    functionArgs: [
      Cl.uint(nftTokenId),
      Cl.uint(ftAmount)
    ],
    // Multiple post-conditions protect all assets
    postConditions: [
      // User sends NFT
      Pc.principal(userAddress)
        .willSendAsset()
        .nft('ST1...my-nft-contract::nft', Cl.uint(nftTokenId)),

      // User receives fungible tokens
      Pc.principal(userAddress)
        .willSendLte(0) // User should NOT send FTs
        .ft('ST1...my-token-contract', 'tokens'),

      // Contract sends FTs to user (implied by user not sending)
      Pc.contractPrincipal('ST1...marketplace', 'marketplace')
        .willSendGte(ftAmount)
        .ft('ST1...my-token-contract', 'tokens'),
    ],
    postConditionMode: PostConditionMode.Deny,
    network: getNetwork(),
    onFinish: (data) => pollTransactionStatus(data.txId),
  });
}
```

### Custom Hook for Contract Calls

```typescript
// Source: React hooks best practices + Stacks patterns
import { useState } from 'react';
import { openContractCall } from '@stacks/connect';

interface ContractCallOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  postConditions?: any[];
}

export function useContractCall() {
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(options: ContractCallOptions) {
    setLoading(true);
    setError(null);

    try {
      await openContractCall({
        ...options,
        network: getNetwork(),
        onFinish: (data) => {
          setTxId(data.txId);
          setLoading(false);
        },
        onCancel: () => {
          setLoading(false);
          setError('Transaction cancelled by user');
        },
      });
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  return { call, loading, txId, error };
}

// Usage in component:
// const { call, loading, txId } = useContractCall();
// await call({ contractAddress, contractName, functionName, functionArgs });
```

### Wallet Connection Component

```typescript
// Source: @stacks/connect v8+ documentation
import { useAuth } from '../context/AuthContext';

export function WalletConnect() {
  const { address, isConnecting, connect, disconnect } = useAuth();

  if (address) {
    return (
      <div>
        <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <button onClick={connect} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `showConnect()` with UserSession/AppConfig | `connect()` with simpler API | @stacks/connect v8.0 (2024-2025) | Reduced boilerplate, standardized WBIP/SIP-030, but breaking change requires migration |
| Both mainnet/testnet addresses returned | Only current network address | @stacks/connect v8.0 | Improved security (prevents cross-network errors) but requires network-aware code |
| Manual transaction construction | `Cl` helpers for Clarity values | @stacks/transactions v6+ | Type-safe encoding prevents runtime errors |
| String-based post-conditions | `Pc` fluent API | @stacks/transactions v6+ | More readable, prevents syntax errors |
| Polling-only transaction status | WebSocket subscriptions available | Stacks API updates (2024+) | Real-time updates reduce polling overhead |
| Bitcoin finality (7 blocks) | Nakamoto instant finality | Nakamoto release (2024) | Transactions confirm in seconds instead of ~1 hour |

**Deprecated/outdated:**
- `@stacks/connect-react` package: Deprecated; functionality merged into @stacks/connect v8+
- `broadcastTransaction()` return structure: Now returns `TxBroadcastResult` with `error` field instead of throwing
- Testnet faucet locations: Moved from legacy faucet to `platform.hiro.so/faucet`

## Open Questions

Things that couldn't be fully resolved:

1. **@stacks/react Package Availability**
   - What we know: Mentioned in documentation as "being developed" with features like automatic transaction status tracking and network change detection
   - What's unclear: Release date, API surface, whether it will replace Context patterns
   - Recommendation: Proceed with Context/custom hooks pattern; migrate to @stacks/react when released

2. **Optimal Transaction Polling Strategy**
   - What we know: WebSocket subscriptions available, polling every 2 seconds common practice
   - What's unclear: Official recommendation for poll interval, timeout thresholds, retry logic
   - Recommendation: Start with 2-second polling + 30 attempt limit (60 seconds total); consider WebSockets for production

3. **Next.js App Router Support**
   - What we know: Starter templates exist for Next.js, but focus on Pages Router
   - What's unclear: Server Component compatibility, whether contract calls work in Server Actions
   - Recommendation: Use Client Components for all wallet/transaction logic; research Server Component use cases separately

4. **Contract ABI Sources**
   - What we know: Clarinet generates ABIs, can be used for validation
   - What's unclear: Best practice for importing ABIs into frontend (JSON files, codegen, runtime fetch)
   - Recommendation: Export ABIs from Clarinet as JSON, import into frontend as TypeScript constants

## Sources

### Primary (HIGH confidence)

- [Stacks.js Connect Documentation](https://docs.stacks.co/stacks-connect/connect-wallet) - Wallet integration guide
- [@stacks/transactions Reference](https://docs.stacks.co/reference/stacks.js/stacks-transactions) - Transaction construction
- [Post-Conditions Implementation](https://docs.stacks.co/post-conditions/implementation) - Post-condition patterns with Pc API
- [Stacks Blockchain API](https://hirosystems.github.io/stacks-blockchain-api/) - Transaction status endpoints
- [Stacks.js Starters Repository](https://github.com/hirosystems/stacks.js-starters) - Official starter templates
- [@stacks/connect npm](https://www.npmjs.com/package/@stacks/connect) - Package versions and stats
- [@stacks/transactions npm](https://www.npmjs.com/package/@stacks/transactions) - Package versions

### Secondary (MEDIUM confidence)

- [npm trends: @stacks/connect-react vs micro-stacks](https://npmtrends.com/@stacks/auth-vs-@stacks/connect-vs-@stacks/connect-react-vs-micro-stacks) - Ecosystem comparison (verified download stats)
- [Next.js Environment Variables Guide](https://nextjs.org/docs/pages/guides/environment-variables) - NEXT_PUBLIC_ best practices (official Next.js docs)
- [Stacks blockchain development challenges (Cointelegraph)](https://cointelegraph.com/news/stacks-stx-surges-as-bitcoin-nft-hype-grows-but-its-blockchain-activity-raises-concern) - Ecosystem state analysis
- [Web3 Full Stack Development trends (Medium)](https://medium.com/@aldiiii/goodbye-next-js-my-new-react-stack-for-2026-860658b7db90) - React ecosystem 2026

### Tertiary (LOW confidence - needs validation)

- React hooks wallet integration patterns - General Web3 patterns, not Stacks-specific
- Devnet/testnet forum discussions - Community reports on pending transactions and troubleshooting

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official packages documented with version numbers and npm stats
- Architecture: MEDIUM - Patterns verified from official docs, but @stacks/react uncertainty lowers confidence
- Pitfalls: MEDIUM - Post-condition security and version compatibility verified; other pitfalls inferred from community patterns

**Research date:** 2026-01-29
**Valid until:** ~30 days (stable ecosystem, but @stacks/react release could change patterns)

**Key gaps requiring validation during implementation:**
- Exact behavior of Nakamoto instant finality on transaction status polling
- Server Component compatibility in Next.js App Router
- WebSocket subscription setup for transaction status (not fully documented in starter examples)
