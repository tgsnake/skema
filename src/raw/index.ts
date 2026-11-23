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
 * Main exports for compiled TLObjects, zlib packer, MTProto envelopes,
 * and decrypted secret chat message containers.
 */

import * as Raw from './class/Raw.js';
import { setRaw } from './core/TLObject.js';
setRaw(Raw);

export { Raw };
export { AllTLObject } from './class/All.js';
export { Primitive, TLObject, GzipPacked, Message, MsgContainer } from './core/index.js';
export {
  SecretChatMessage,
  SecretChatMessageService,
  UpdateSecretChatMessage,
  type TypeTGenerate,
} from './class/custom/UpdateSecretChat.js';
