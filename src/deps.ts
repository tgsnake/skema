/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2025 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
export { BytesIO } from '@tgsnake/bytesio';
export { Logger } from '@tgsnake/log';
export { gzipSync, gunzipSync } from 'node:zlib';
export { Buffer } from 'node:buffer';
import { inspect as nodeInspect } from 'node:util';
import bigInt from 'big-integer';

export const inspect: typeof nodeInspect =
  'Deno' in globalThis && 'inspect' in globalThis.Deno ? globalThis.Deno.inspect : nodeInspect;
export { bigInt };
