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
/**
 * Double is a class representing a double-precision floating-point number in the Telegram MTProto protocol.
 * It provides methods to read and write these numbers in a specified format.
 */
export class Double extends TLObject {
  /**
   * Serializes a double-precision floating-point number into a Buffer.
   *
   * @param value - The number to serialize.
   * @param little - If `true`, writes the number in little-endian format; otherwise, writes in big-endian format. Defaults to `true`.
   * @returns A Buffer containing the serialized double value.
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
   * Reads a 64-bit floating point number (double) from the provided BytesIO stream.
   *
   * @param data - The BytesIO instance to read from.
   * @param little - Optional. If true (default), reads the value as little-endian; otherwise, reads as big-endian.
   * @returns A promise that resolves to the read double value.
   */
  static override async read(data: BytesIO, little: boolean = true): Promise<number> {
    if (little) {
      return data.readDoubleLE();
    }
    return data.readDoubleBE();
  }
}
