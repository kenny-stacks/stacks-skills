# Stacks.js Frontend Integration

## Contents

- [Stacks.js Overview](#stacksjs-overview)
- [Wallet Integration](#wallet-integration)
- [Contract Calls](#contract-calls)
- [Network Configuration](#network-configuration)
- [React Patterns](#react-patterns)
- [External References](#external-references)

## Stacks.js Overview

| Package | Purpose |
|---------|---------|
| `@stacks/connect` | Wallet connection and authentication |
| `@stacks/transactions` | Build and send transactions |
| `@stacks/network` | Network configuration |

```bash
npm install @stacks/connect @stacks/transactions @stacks/network
```

## Wallet Integration

### Connect Wallet

```typescript
import { showConnect, AppConfig, UserSession } from "@stacks/connect";

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });

function connectWallet() {
  showConnect({
    appDetails: { name: "My Stacks App", icon: "/logo.png" },
    onFinish: () => {
      const userData = userSession.loadUserData();
      console.log("Connected:", userData.profile.stxAddress);
    },
    userSession,
  });
}
```

### Check and Disconnect

```typescript
const isAuthenticated = () => userSession.isUserSignedIn();
const disconnect = () => userSession.signUserOut();
```

## Contract Calls

### Read-Only Calls (No Signing)

```typescript
import { callReadOnlyFunction, cvToValue, principalCV } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";

async function getBalance(address: string): Promise<number> {
  const result = await callReadOnlyFunction({
    contractAddress: "SP...",
    contractName: "my-token",
    functionName: "get-balance",
    functionArgs: [principalCV(address)],
    network: new StacksMainnet(),
    senderAddress: address,
  });
  return cvToValue(result).value;
}
```

### Contract Calls (With Signing)

```typescript
import { openContractCall } from "@stacks/connect";
import { uintCV, principalCV } from "@stacks/transactions";

async function transfer(amount: number, recipient: string) {
  await openContractCall({
    contractAddress: "SP...",
    contractName: "my-token",
    functionName: "transfer",
    functionArgs: [uintCV(amount), principalCV(recipient)],
    onFinish: (data) => console.log("TX ID:", data.txId),
    onCancel: () => console.log("Cancelled"),
  });
}
```

## Network Configuration

```typescript
import { StacksMainnet, StacksTestnet, StacksDevnet } from "@stacks/network";

function getNetwork() {
  switch (process.env.NEXT_PUBLIC_NETWORK) {
    case "mainnet": return new StacksMainnet();
    case "testnet": return new StacksTestnet();
    default: return new StacksDevnet();
  }
}
```

## React Patterns

### Auth Context

```typescript
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({ address: null, connect: () => {}, disconnect: () => {} });

export function AuthProvider({ children }) {
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setAddress(userSession.loadUserData().profile.stxAddress.mainnet);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ address, connect: connectWallet, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Contract Call Hook

```typescript
function useContractCall() {
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState(null);

  async function call(options) {
    setLoading(true);
    await openContractCall({
      ...options,
      onFinish: (data) => { setTxId(data.txId); setLoading(false); },
      onCancel: () => setLoading(false),
    });
  }
  return { call, loading, txId };
}
```

## External References

### Stacks.js Documentation
- [Stacks.js Overview](https://docs.stacks.co/stacks-js/overview)
- [@stacks/connect](https://docs.stacks.co/stacks-js/connect)
- [@stacks/transactions](https://docs.stacks.co/stacks-js/transactions)

### Examples
- [Stacks.js Packages](https://github.com/hirosystems/stacks.js/tree/main/packages)

---

*Reference file for stacks-dev skill - Frontend integration*
