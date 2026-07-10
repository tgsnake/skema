# Skema 🚀

[![JSR Badge](https://jsr.io/badges/@tgsnake/skema)](https://jsr.io/@tgsnake/skema) [![NPM Version](https://img.shields.io/npm/v/@tgsnake/skema?style=flat-down&color=blue)](https://www.npmjs.com/package/@tgsnake/skema) [![NPM Downloads](https://img.shields.io/npm/dm/@tgsnake/skema?style=flat-down)](https://www.npmjs.com/package/@tgsnake/skema) [![License](https://img.shields.io/github/license/tgsnake/skema?style=flat-down&color=green)](https://github.com/tgsnake/skema/blob/main/LICENSE)

**Skema** compiles the Telegram TL (Type Language) Schema and Telegram RPC Errors Schema into highly usable JavaScript classes with first-class TypeScript support.

This project was originally based on the source code from [`@tgsnake/core`](https://github.com/tgsnake/core) 🐍.

---

<center>  
  <b>Layer 228</b>  
</center>

---

## ⚠️ Requirements & Compatibility in v2.0.0

> [!IMPORTANT]  
> Starting with the major release **v2.0.0**, `@tgsnake/skema` is compiled as a pure ECMAScript Module (ESM). Since Node.js 20 introduced native support for `require(ESM)` under experimental flags (and subsequent stabilizing in newer versions), we fully transitioned to ESM. So, the minimum Node.js version required for installation and execution is **Node.js 22**. Ensure your runtime matches or exceeds this version before installing the package.

---

## ✨ Features

- Up-to-date with Telegram's compiled TL Schema.
- **Bi-directional Serialization**: Clean and efficient API to serialize TL schema classes into binary `Buffer` structures (`.write()`) and parse them back (`.read()`).
- **Comprehensive Error Mapping**: Built-in classes for standard Telegram `RPCError` exceptions, custom security mismatches, websocket timeouts, and MTProto packet notifications.
- **Out-of-the-box Type Safety**: Fully typed modules providing precise autocompletion for Telegram functions, requests, and constructors.
- **Multi-Runtime Support**: Compatible with modern ESM environments across Node.js, Deno, Bun, and Browser.

---

## 📦 Installation

Install `@tgsnake/skema` using your preferred package manager:

```bash
# Using npm
npm install @tgsnake/skema

# Using yarn
yarn add @tgsnake/skema

# Using pnpm
pnpm add @tgsnake/skema

# Using Bun
bun add @tgsnake/skema
```

## Deno / JSR (Native Deno Import)

```bash
# Add the dependency via JSR
deno add jsr:@tgsnake/skema
```

---

## 🛠️ Usage Guide

### Constructing Schema Objects

You can construct Telegram MTProto API requests and constructors using the `Raw` namespace.

```ts
import { Raw } from '@tgsnake/skema';

// Create a SendMessage request parameters object
const sendMessageRequest = new Raw.messages.SendMessage({
  peer: new Raw.InputPeerSelf(),
  message: 'Hello from Skema! 🐍',
  randomId: 1234567890n, // BigInt support for long/int128/int256 types
});

console.log(sendMessageRequest.className); // "messages.SendMessage"
```

### Catching & Handling Errors

Skema includes robust exceptions mapping Telegram errors to digestible error classes.

```ts
import { RPCError, Exceptions } from '@tgsnake/skema';

try {
  // E.g., MTProto request execution logic...
} catch (error) {
  if (error instanceof RPCError) {
    console.error(`RPC Error [${error.code}]: ${error.message} (${error.description})`);

    // Check for specific error types
    if (error instanceof Exceptions.BadRequest.PeerIdInvalid) {
      console.error('The provided peer ID is invalid.');
    }
  }
}
```

---

## 🗃️ Key Exports & Architecture

Below is a breakdown of the primary entry points and structures exported by `@tgsnake/skema`:

### 🌐 Namespaces & Schema Engines

- **`Raw`**: Contains the entire Telegram TL Schema constructors and requests. All types conform to MTProto Layer 225.
  - `Raw.Layer`: The active layer number.
  - `Raw.HighestSCLayer`: The highest secret chat layer supported.

### 🏗️ Core Classes

- **`TLObject`**: The base class for all compiled types. Implements common helper functions (`read`, `write`, `toJSON`, `toString`).
- **`Message`**: Represents an individual MTProto envelope message encapsulating a payload, `msg_id`, `seq_no`, and length.
- **`MsgContainer`**: A container class handling transport multiplexing of multiple MTProto messages.
- **`GzipPacked`**: Helper utility handling compression and decompression of zlib payloads inside MTProto communications.

### 🧰 Math & Buffer Helpers

- **`bufferToBigint(buffer: Buffer)`**: Parses a binary buffer into a BigInt.
- **`bigintToBuffer(number: bigint, padding?: number)`**: Converts a BigInt to its equivalent binary buffer.
- **`mod(n: number, m: number)`** / **`bigIntMod(n: bigint, m: bigint)`**: Standard modulus helpers.

### 🚨 Exceptional Errors Mappings

- **`RPCError`**: Base class representing standard Telegram RPC failures.
- **`BadMsgNotification`**: Raised when the MTProto server rejects a message envelope structure (such as incorrect server salt or out-of-sync message ID).
- **`SecurityError`** / **`SecurityCheckMismatch`**: Raised when cryptographic assertions, signature checks, or padding validations fail during keys derivation.
- **`CDNFileHashMismatch`**: Raised if a file chunk downloaded from a Telegram CDN fails checksum verification.
- **`TimeoutError`**: Raised when a task exceeds its execution time boundary.

---

## 🤔 Why Skema?

1. **Eliminates Boilerplate**: Automates the tedious, error-prone manual serialization layout and serialization rules of MTProto schemas.
2. **Type Safety**: Write codebase with confidence using fully generated TypeScript definition files that precisely mirror the official Telegram Type Language layers.
3. **Optimized for Modern Environments**: Native ESM and modern Node.js features support, making it lightweight and highly performant.

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/tgsnake/skema/blob/main/LICENSE) - Copyright (C) 2026 tgsnake.
