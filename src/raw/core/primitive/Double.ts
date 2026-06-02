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
 * Serializer and deserializer for double-precision 64-bit floating-point numbers (IEEE 754).
 *
 * @remarks
 * In MTProto, double-precision floats are represented as 8 bytes, typically in little-endian order.
 *
 * @extends TLObject
 */
export class Double extends TLObject {
  /**
   * Serializes a JS `number` into an 8-byte buffer.
   *
   * @param value - The floating-point number to serialize.
   * @param little - Set to `true` to use little-endian byte ordering; set to `false` for big-endian. Defaults to `true`.
   * @returns A Buffer containing the 8-byte representation of the double.
   */
  static override write(value: number, little: boolean = true): Buffer {
    const buffer = Buffer.alloc(8);
    if (little) {
      buffer.writeDoubleLE(value);
    } else {
      buffer.writeDoubleBE(value);
    }
    return buffer;
  }

  /**
   * Reads and decodes a double-precision floating-point number from a binary stream.
   *
   * @param data - The `BytesIO` stream to read the double from.
   * @param little - Set to `true` to read in little-endian byte ordering; set to `false` for big-endian. Defaults to `true`.
   * @returns A promise resolving to the decoded number value.
   */
  static override async read(data: BytesIO, little: boolean = true): Promise<number> {
    if (little) {
      return data.readDoubleLE();
    }
    return data.readDoubleBE();
  }
}
