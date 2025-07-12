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
import { Int, Long } from '@/raw/core/primitive/index.js';
/**
 * Vector is a class representing a vector (array) of Telegram MTProto objects.
 * It provides methods to read and write these vectors in a specified format.
 */
export class Vector extends TLObject {
  static ID: number = 0x1cb5c415;
  /**
   * Serializes an array of values into a Buffer using the Vector schema.
   *
   * @param value - The array of values to serialize.
   * @param tl - (Optional) A type layer object that provides a custom `write` method for serializing each element.
   * @returns A Buffer containing the serialized representation of the vector.
   *
   * @remarks
   * - The method writes the Vector ID, the length of the array, and then serializes each element.
   * - If a type layer (`tl`) is provided, its `write` method is used for each element; otherwise, each element's own `write` method is called.
   */
  static override write(value: Array<any>, tl?: any): Buffer {
    const bytes = new BytesIO();
    bytes.write(Int.write(Vector.ID, false) as unknown as Buffer);
    bytes.write(Int.write(value.length) as unknown as Buffer);
    for (const i of value) {
      if (tl) {
        bytes.write(tl.write(i));
      } else {
        bytes.write(i.write());
      }
    }
    return Buffer.from(bytes.buffer as unknown as Uint8Array);
  }
  /**
   * Reads a value from the provided BytesIO stream based on the specified size.
   *
   * - If `size` is 4, reads and returns an integer using `Int.read`.
   * - If `size` is 8, reads and returns a long integer using `Long.read`.
   * - For other sizes, reads and returns a TLObject using `TLObject.read`.
   *
   * @param data - The BytesIO stream to read from.
   * @param size - The size of the value to read (in bytes).
   * @returns A Promise resolving to the value read from the stream.
   */
  static async readBare(data: BytesIO, size: number): Promise<any> {
    if (size === 4) {
      return await Int.read(data);
    }
    if (size === 8) {
      return await Long.read(data);
    }
    return await TLObject.read(data);
  }
  /**
   * Reads a vector of elements from the provided `BytesIO` stream.
   *
   * @param data - The `BytesIO` stream to read from.
   * @param tl - (Optional) A type layer object with a `read` method for reading each element.
   * @returns A promise that resolves to an array containing the read elements.
   *
   * @remarks
   * - If `tl` is provided, its `read` method is used to read each element.
   * - If `tl` is not provided, `Vector.readBare` is used with a calculated size for each element.
   * - The method first reads the count of elements, then calculates the size of each element based on the remaining buffer length.
   */
  static override async read(data: BytesIO, tl?: any): Promise<Array<any>> {
    const results: Array<any> = [];
    const count = await Int.read(data);
    const left = Buffer.byteLength(data.read());
    const size = count ? left / count : 0;
    data.seek(-left, 1);
    for (let i = 0; i < count; i++) {
      if (tl) {
        results.push(await tl.read(data));
      } else {
        results.push(await Vector.readBare(data, size));
      }
    }
    return results;
  }
}
