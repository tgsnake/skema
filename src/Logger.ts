/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { Logger } from './deps.js';

/**
 * The internal logger instance for the `@tgsnake/skema` package.
 * Configure with debug level by default to output internal protocol logs.
 *
 * @remarks
 * This logger wraps the `@tgsnake/log` utility. It is configured to output debug
 * and more severe messages for tracing MTProto serialization and deserialization.
 */
const log = new Logger({
  name: '@tgsnake/skema',
  level: ['debug'],
});

export { log as Logger };
