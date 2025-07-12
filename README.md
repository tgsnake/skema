# Skema 🚀

**Skema** is a compiled Telegram TL Schema and Telegram errors Schema into usable JavaScript classes with full TypeScript support.  
This project was originally based on the source code from [`@tgsnake/core`](https://github.com/tgsnake/core). 🐍

<center>  
  <b>Layer 207</b>  
</center>

## Features ✨

- Converts Telegram TL Schema to JavaScript/TypeScript classes
- Handles Telegram error types
- Easy integration into your TypeScript or JavaScript projects

## Installation 📦

```bash
npm install @tgsnake/skema
```

## Usage 🛠️

```ts
import { Raw } from '@tgsnake/skema';

// Example usage
const sendMessageApi = new Raw.messages.SendMessage({
  // constructor parameter here
});
```

## Why Skema? 🤔

- Simplifies working with Telegram's complex TL schema
- Type-safe: full TypeScript support
- Reduces boilerplate and manual schema handling
