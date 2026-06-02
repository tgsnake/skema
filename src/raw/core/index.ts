/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

/**
 * Re-exports core MTProto primitive builders, zlib compression packer,
 * message envelopes, message containers, and the base TLObject class.
 */

import * as Primitive from './primitive/index.js';
export { Primitive };
export { TLObject } from './TLObject.js';
export { GzipPacked } from './GzipPacked.js';
export { Message } from './Message.js';
export { MsgContainer } from './MsgContainer.js';
