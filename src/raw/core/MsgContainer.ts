/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { TLObject } from './TLObject.js';
import { BytesIO, Buffer } from '../../deps.js';
import * as Primitive from './primitive/index.js';
import { Message } from './Message.js';

/**
 * Represents a standard MTProto Message Container (`msg_container`).
 *
 * @remarks
 * A message container is a core MTProto concept allowing multiple independent messages (requests or updates)
 * to be grouped together and sent within a single network transaction. This reduces overhead and enables
 * parallel execution or efficient state synchronization between client and server.
 *
 * @extends TLObject
 */
export class MsgContainer extends TLObject {
  /**
   * The unique class ID identifier representing `MsgContainer` (0x73f1f8dc).
   */
  static ID: number = 0x73f1f8dc;

  /**
   * The list of MTProto `Message` envelopes packaged inside this container.
   */
  messages!: Array<Message>;

  /**
   * Constructs a new MsgContainer.
   *
   * @param messages - An array of `Message` instances to package.
   */
  constructor(messages: Array<Message>) {
    super();
    this._slots = ['messages'];
    this.className = 'MsgContainer';
    this.messages = messages;
  }

  /**
   * Reads, unpacks, and deserializes a `MsgContainer` from a binary stream.
   *
   * @remarks
   * Reads the message count prefix, then iterates sequentially to deserialize each nested `Message` envelope.
   *
   * @param data - The `BytesIO` stream containing the serialized message container.
   * @param _args - Unused additional parameters.
   * @returns A promise resolving to the deserialized `MsgContainer` instance.
   */
  static override async read(data: BytesIO, ..._args: Array<any>): Promise<MsgContainer> {
    const count = await Primitive.Int.read(data);
    const messages: Array<Message> = [];
    for (let i = 0; i < count; i++) {
      messages.push(await Message.read(data));
    }
    return new MsgContainer(messages);
  }

  /**
   * Serializes the container header, message counts, and nested envelopes into a raw binary buffer.
   *
   * @override
   * @returns A Buffer containing the serialized representation of the message container.
   */
  override write(): Buffer {
    const bytes = new BytesIO();
    bytes.write(Primitive.Int.write(MsgContainer.ID, false));
    bytes.write(Primitive.Int.write(this.messages.length));
    for (const message of this.messages) {
      bytes.write(message.write());
    }
    return Buffer.from(bytes.buffer as unknown as Uint8Array);
  }
}
