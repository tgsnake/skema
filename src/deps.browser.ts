/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
export { BytesIO } from '@tgsnake/bytesio';
export { Logger } from '@tgsnake/log';
export { gzipSync, gunzipSync } from 'browserify-zlib';
export { Buffer } from 'buffer';
import { inspect as nodeInspect } from 'util';
import bigInt from 'big-integer';

// Other platform compatibility
// After this line, we will provide some compatibility for Deno, Bun, and Browser so that the same code can run in both environments without modification.
const isDeno = 'Deno' in globalThis; // Further Notes: Reffering to Cloudflare acquired Deno and it will end development of the Deno runtime, the Deno platform may will be deprecated in the future, but we will still provide compatibility for it for now. We will see what happens in the future, but for now, we will still provide compatibility for Deno.
const isBun = 'Bun' in globalThis;
const isBrowser = !isDeno && !isBun && typeof window !== 'undefined'; // browser compatibility

/**
 * Identifies the runtime platform environment.
 * Can be 'Deno', 'Bun', 'Browser', or 'Node'.
 * @type {'Deno' | 'Bun' | 'Browser' | 'Node'}
 */
export const platform = isDeno ? 'Deno' : isBun ? 'Bun' : isBrowser ? 'Browser' : 'Node';
/**
 * Platform-independent utility function to deeply inspect objects.
 * Uses `Deno.inspect` in Deno environment, otherwise falls back to Node's `util.inspect`.
 *
 * @type {typeof nodeInspect}
 */
export const inspect = nodeInspect;
export { bigInt };
