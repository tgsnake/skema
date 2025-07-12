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
import { bufferToBigint, bigintToBuffer, mod } from '@/helpers.js';
/**
 * Bytes is a class representing a sequence of bytes in the Telegram MTProto protocol.
 * It provides methods to read and write these bytes in a specified format.
 */
export class Bytes extends TLObject {
  /**
   * Serializes a Buffer value into a custom binary format with length-prefix encoding and padding.
   *
   * - If the buffer length is 253 bytes or less, the output format is:
   *   [1 byte length][buffer data][padding to 4-byte alignment]
   * - If the buffer length is greater than 253 bytes, the output format is:
   *   [1 byte (254)][3 bytes length][buffer data][padding to 4-byte alignment]
   *
   * The padding ensures the total length (including prefix and data) is a multiple of 4 bytes.
   *
   * @param value - The Buffer to serialize.
   * @returns A Buffer containing the serialized data with length prefix and padding.
   */
  static override write(value: Buffer): Buffer {
    const length = Buffer.byteLength(value);
    if (length <= 253) {
      return Buffer.concat([
        Buffer.from([length]) as unknown as Uint8Array,
        value as unknown as Uint8Array,
        Buffer.alloc(mod(-(length + 1), 4)) as unknown as Uint8Array,
      ]);
    } else {
      return Buffer.concat([
        Buffer.from([254]) as unknown as Uint8Array,
        bigintToBuffer(BigInt(length), 3) as unknown as Uint8Array,
        value as unknown as Uint8Array,
        Buffer.alloc(mod(-length, 4)) as unknown as Uint8Array,
      ]);
    }
  }
  /**
   * Reads a variable-length buffer from the provided BytesIO stream.
   *
   * The method first reads a length prefix from the stream:
   * - If the first byte (length) is less than or equal to 253, it reads that many bytes as the buffer.
   * - If the first byte is greater than 253, it reads the next 3 bytes to determine the actual length, then reads that many bytes as the buffer.
   *
   * After reading the buffer, it reads additional bytes to align the stream position to a 4-byte boundary.
   *
   * @param data - The BytesIO stream to read from.
   * @param _args - Additional arguments (unused).
   * @returns A Promise that resolves to the read Buffer.
   */
  static override async read(data: BytesIO, ..._args: Array<any>): Promise<Buffer> {
    let length = (data.read(1) as unknown as Uint8Array)[0];
    if (length <= 253) {
      const x = data.read(length);
      data.read(mod(-(length + 1), 4));
      return x;
    } else {
      length = Number(bufferToBigint(data.read(3)));
      const x = data.read(length);
      data.read(mod(-length, 4));
      return x;
    }
  }
}
