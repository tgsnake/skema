/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { TLObject } from '../TLObject.js';
import { BytesIO, Buffer } from '../../../deps.js';
import { bufferToBigint, bigintToBuffer, mod } from '../../../helpers.js';

/**
 * Serializer and deserializer for raw, variable-length byte arrays.
 *
 * @remarks
 * In MTProto, raw byte arrays are serialized with a custom length-prefix scheme:
 * - If the array is 253 bytes or shorter:
 *   - The first byte contains the exact length.
 *   - Followed by the raw payload bytes.
 *   - Followed by `0-3` padding bytes to align the entire block to a 4-byte boundary.
 * - If the array is longer than 253 bytes:
 *   - The first byte is written as exactly `254` (0xfe).
 *   - The next 3 bytes contain the little-endian length.
 *   - Followed by the raw payload bytes.
 *   - Followed by `0-3` padding bytes to align the entire block to a 4-byte boundary.
 *
 * @extends TLObject
 */
export class Bytes extends TLObject {
  /**
   * Serializes a Node.js Buffer value into a length-prefixed and padded MTProto binary structure.
   *
   * @param value - The input Buffer to serialize.
   * @returns A Buffer containing the formatted prefix, data, and padding bytes.
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
   * Reads, decodes, and aligns a variable-length byte array from a binary stream.
   *
   * @param data - The `BytesIO` stream to read the byte array from.
   * @param _args - Unused additional parameters.
   * @returns A promise resolving to the decoded Node.js Buffer.
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
