/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2025 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { TLObject } from '@/raw/core/TLObject.js';
import { BytesIO, Buffer } from '@/deps.js';
import * as Primitive from '@/raw/core/primitive/index.js';
import { Message } from '@/raw/core/Message.js';

export class MsgContainer extends TLObject {
  static ID: number = 0x73f1f8dc;
  messages!: Array<Message>;
  constructor(messages: Array<Message>) {
    super();
    this._slots = ['messages'];
    this.className = 'MsgContainer';
    this.messages = messages;
  }
  /**
   * Reads a `MsgContainer` instance from the provided `BytesIO` stream.
   *
   * This method reads the number of messages from the stream, then iteratively reads each `Message`
   * and constructs a new `MsgContainer` containing all the messages.
   *
   * @param data - The `BytesIO` stream to read from.
   * @param _args - Additional arguments (unused).
   * @returns A promise that resolves to a new `MsgContainer` instance containing the read messages.
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
   * Serializes the current `MsgContainer` instance into a Buffer.
   *
   * This method writes the container's ID, the number of messages, and then serializes
   * each contained message in order. The resulting Buffer can be used for transmission
   * or storage.
   *
   * @override
   * @returns {Buffer} The serialized representation of the `MsgContainer`.
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
