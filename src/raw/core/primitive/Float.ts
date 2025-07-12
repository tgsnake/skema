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
 * Float is a class representing a single-precision floating-point number in the Telegram MTProto protocol.
 * It provides methods to read and write these numbers in a specified format.
 */
export class Float extends TLObject {
  /**
   * Serializes a 32-bit floating point number into a Buffer.
   *
   * @param value - The number to serialize.
   * @param little - If `true`, writes the number in little-endian format; otherwise, in big-endian format. Defaults to `true`.
   * @returns A Buffer containing the serialized float.
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
   * Reads a 32-bit floating point number from the provided BytesIO stream.
   *
   * @param data - The BytesIO instance to read from.
   * @param little - If true, reads the float in little-endian order; otherwise, reads in big-endian order. Defaults to true.
   * @returns A promise that resolves to the read floating point number.
   */
  static override async read(data: BytesIO, little: boolean = true): Promise<number> {
    if (little) {
      return data.readFloatLE();
    }
    return data.readFloatBE();
  }
}
