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
import { Int, Long } from './index.js';

/**
 * Serializer and deserializer for generic, strongly-typed vectors (arrays) of MTProto objects.
 *
 * @remarks
 * In MTProto, vectors can be either "boxed" (serialized with the explicit `Vector.ID` class tag prefix)
 * or "bare" (serialized directly as an array of items without the leading class ID). This class supports both
 * boxed serialization/deserialization and bare item parsers.
 *
 * @extends TLObject
 */
export class Vector extends TLObject {
  /**
   * The unique class ID identifier representing `Vector` (0x1cb5c415).
   */
  static ID: number = 0x1cb5c415;

  /**
   * Serializes an array of values into an MTProto-boxed vector Buffer.
   *
   * @param value - The array of elements to serialize.
   * @param tl - An optional custom type layer descriptor supplying a dedicated elements `write` method.
   * @returns A Buffer containing the boxed vector bytes.
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
   * Helper deserializer reading a single "bare" item from a stream based on a calculated element byte size.
   *
   * @param data - The `BytesIO` stream to read from.
   * @param size - The precalculated byte size of a single element.
   * @returns A promise resolving to the parsed element.
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
   * Reads, unpacks, and deserializes a strongly-typed boxed vector from a binary stream.
   *
   * @remarks
   * This method first extracts the element count. If a specialized element parser (`tl`) is provided,
   * it uses it. Otherwise, it calculates the average element byte size dynamically using the remaining
   * buffer capacity and delegates bare item parsing to {@link readBare}.
   *
   * @param data - The `BytesIO` stream containing the serialized vector.
   * @param tl - An optional custom type layer descriptor supplying a dedicated elements `read` method.
   * @returns A promise resolving to an array of parsed elements.
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
