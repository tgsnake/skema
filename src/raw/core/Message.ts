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

function toBytes(value: bigint) {
  const bytesArray: Array<number> = [];
  for (let i = 0; i < 8; i++) {
    let shift = value >> BigInt(8 * i);
    shift &= BigInt(255);
    bytesArray[i] = Number(String(shift));
  }
  return Buffer.from(bytesArray);
}
export class Message extends TLObject {
  static ID: number = 0x5bb8e511; // hex(crc32(b"message msg_id:long seqno:int bytes:int body:Object = Message"))
  msgId!: bigint;
  seqNo!: number;
  length!: number;
  body!: TLObject;
  constructor(body: TLObject, msgId: bigint, seqNo: number, length: number) {
    super();
    this.className = 'Message';
    this._slots = ['body', 'msgId', 'seqNo', 'length'];
    this.msgId = msgId;
    this.seqNo = seqNo;
    this.length = length;
    this.body = body;
  }
  /**
   * Reads a `Message` object from the provided `BytesIO` stream.
   *
   * This method sequentially reads the message ID, sequence number, and body length from the stream,
   * then reads the message body of the specified length. It constructs a new `Message` instance
   * using the deserialized body and the extracted metadata.
   *
   * @param data - The `BytesIO` stream to read the message from.
   * @param _args - Additional arguments (unused).
   * @returns A promise that resolves to the deserialized `Message` object.
   */
  static override async read(data: BytesIO, ..._args: Array<any>): Promise<Message> {
    const msgId = await Primitive.Long.read(data);
    const seqNo = await Primitive.Int.read(data);
    const length = await Primitive.Int.read(data);
    const body = data.read(length);
    return new Message(await TLObject.read(new BytesIO(body)), msgId, seqNo, length);
  }
  /**
   * Serializes the message into a Buffer.
   *
   * This method writes the message ID, sequence number, length, and body
   * into a BytesIO stream in a specific binary format, then returns the
   * resulting data as a Node.js Buffer.
   *
   * @returns {Buffer} The serialized message as a Buffer.
   */
  override write(): Buffer {
    const bytes = new BytesIO();
    bytes.write(toBytes(this.msgId));
    bytes.write(Primitive.Int.write(this.seqNo));
    bytes.write(Primitive.Int.write(this.length));
    bytes.write(this.body.write());
    return Buffer.from(bytes.buffer as unknown as Uint8Array);
  }
}
