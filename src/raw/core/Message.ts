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

/**
 * Utility helper converting a 64-bit integer into a little-endian byte representation.
 *
 * @param value - The bigint value to convert.
 * @returns A Buffer representing the little-endian bytes of the bigint.
 */
function toBytes(value: bigint) {
  const bytesArray: Array<number> = [];
  for (let i = 0; i < 8; i++) {
    let shift = value >> BigInt(8 * i);
    shift &= BigInt(255);
    bytesArray[i] = Number(String(shift));
  }
  return Buffer.from(bytesArray);
}

/**
 * Represents a standard MTProto transport container message.
 *
 * @remarks
 * Every message transmitted or received over the MTProto protocol is wrapped in a `Message` envelope.
 * The envelope includes metadata crucial for routing and ordering: the message ID (which indicates
 * client/server time synchronization), the message sequence number, the body byte length, and the actual
 * serialized payload/body TLObject.
 *
 * @extends TLObject
 */
export class Message extends TLObject {
  /**
   * The unique class ID identifier representing `Message` (0x5bb8e511).
   */
  static ID: number = 0x5bb8e511; // hex(crc32(b"message msg_id:long seqno:int bytes:int body:Object = Message"))

  /**
   * The unique 64-bit message identifier, representing the creation time of the message in seconds multiplied by 2^32.
   */
  msgId!: bigint;

  /**
   * The message sequence number, indicating the order of the message in the session.
   */
  seqNo!: number;

  /**
   * The length of the serialized message body in bytes.
   */
  length!: number;

  /**
   * The inner body deserialized as a `TLObject`.
   */
  body!: TLObject;

  /**
   * Constructs a new Message envelope.
   *
   * @param body - The inner body payload of the message.
   * @param msgId - The 64-bit message identifier.
   * @param seqNo - The session message sequence number.
   * @param length - The byte length of the body.
   */
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
   * Reads and deserializes a `Message` envelope from a binary stream.
   *
   * @param data - The `BytesIO` stream containing the serialized message envelope.
   * @param _args - Unused additional parameters.
   * @returns A promise resolving to the deserialized `Message` instance.
   */
  static override async read(data: BytesIO, ..._args: Array<any>): Promise<Message> {
    const msgId = await Primitive.Long.read(data);
    const seqNo = await Primitive.Int.read(data);
    const length = await Primitive.Int.read(data);
    const body = data.read(length);
    return new Message(await TLObject.read(new BytesIO(body)), msgId, seqNo, length);
  }

  /**
   * Serializes the message envelope and its body into a raw binary buffer.
   *
   * @override
   * @returns A Buffer representing the complete message envelope structure.
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
