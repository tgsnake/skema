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

/**
 * Serializer and deserializer for single-precision 32-bit floating-point numbers (IEEE 754).
 *
 * @remarks
 * In MTProto, single-precision floats are represented as 4 bytes, typically in little-endian order.
 *
 * @extends TLObject
 */
export class Float extends TLObject {
  /**
   * Serializes a JS `number` into a 4-byte buffer.
   *
   * @param value - The floating-point number to serialize.
   * @param little - Set to `true` to use little-endian byte ordering; set to `false` for big-endian. Defaults to `true`.
   * @returns A Buffer containing the 4-byte representation of the float.
   */
  static override write(value: number, little: boolean = true): Buffer {
    const buffer = Buffer.alloc(4);
    if (little) {
      buffer.writeFloatLE(value);
    } else {
      buffer.writeFloatBE(value);
    }
    return buffer;
  }

  /**
   * Reads and decodes a single-precision floating-point number from a binary stream.
   *
   * @param data - The `BytesIO` stream to read the float from.
   * @param little - Set to `true` to read in little-endian byte ordering; set to `false` for big-endian. Defaults to `true`.
   * @returns A promise resolving to the decoded number value.
   */
  static override async read(data: BytesIO, little: boolean = true): Promise<number> {
    if (little) {
      return data.readFloatLE();
    }
    return data.readFloatBE();
  }
}
