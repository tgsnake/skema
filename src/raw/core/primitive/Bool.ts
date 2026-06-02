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
 * Represents the false boolean constructor in the Telegram MTProto schema.
 *
 * @extends TLObject
 */
export class BoolFalse extends TLObject {
  /**
   * Unique Class ID representing `BoolFalse` (0xbc799737).
   */
  static ID: number = 0xbc799737;

  /**
   * The underlying native boolean value representation.
   */
  static value: boolean = false;

  /**
   * Serializes the `BoolFalse` class ID into a 4-byte buffer (little-endian).
   *
   * @override
   * @returns A Buffer containing the serialized Class ID.
   */
  static override write(): Buffer {
    const buff = Buffer.alloc(4);
    buff.writeUInt32LE(BoolFalse.ID);
    return buff;
  }

  /**
   * Reads the boolean value from a stream (always resolves to `false`).
   *
   * @param _data - Unused BytesIO stream.
   * @param _arg - Unused arguments.
   * @returns A promise resolving to `false`.
   */
  static override async read(_data: BytesIO, ..._arg: Array<any>): Promise<boolean> {
    return BoolFalse.value;
  }
}

/**
 * Represents the true boolean constructor in the Telegram MTProto schema.
 *
 * @extends BoolFalse
 */
export class BoolTrue extends BoolFalse {
  /**
   * Unique Class ID representing `BoolTrue` (0x997275b5).
   */
  static override ID: number = 0x997275b5;

  /**
   * The underlying native boolean value representation.
   */
  static override value: boolean = true;

  /**
   * Serializes the `BoolTrue` class ID into a 4-byte buffer (little-endian).
   *
   * @override
   * @returns A Buffer containing the serialized Class ID.
   */
  static override write(): Buffer {
    const buff = Buffer.alloc(4);
    buff.writeUInt32LE(BoolTrue.ID);
    return buff;
  }

  /**
   * Reads the boolean value from a stream (always resolves to `true`).
   *
   * @param _data - Unused BytesIO stream.
   * @param _arg - Unused arguments.
   * @returns A promise resolving to `true`.
   */
  static override async read(_data: BytesIO, ..._arg: Array<any>): Promise<boolean> {
    return BoolTrue.value;
  }
}

/**
 * Dynamic dispatcher class representing MTProto abstract boolean values.
 *
 * @remarks
 * In MTProto, boolean values are represented as explicit class instances (`BoolTrue` or `BoolFalse`)
 * rather than raw bits or primitive bytes. This class coordinates dynamic serialization and
 * deserialization between native JavaScript boolean values (`true`/`false`) and the corresponding MTProto constructors.
 *
 * @extends TLObject
 * @example
 * ```typescript
 * const buffer = Bool.write(true); // Serializes `true` to a Buffer using BoolTrue
 * const val = await Bool.read(bytesIO); // Deserializes from stream to native boolean
 * ```
 */
export class Bool extends TLObject {
  override className: string = 'Bool';

  /**
   * Serializes a native JS boolean value into a Buffer using the appropriate constructor.
   *
   * @param value - The boolean value to serialize.
   * @returns A Buffer containing the serialized `BoolTrue` or `BoolFalse` representation.
   */
  static override write(value: boolean): Buffer {
    return value ? BoolTrue.write() : BoolFalse.write();
  }

  /**
   * Reads a 32-bit boolean constructor identifier from the stream and resolves it to a native boolean.
   *
   * @param data - The `BytesIO` stream to read from.
   * @param _arg - Unused arguments.
   * @returns A promise resolving to the decoded boolean value.
   */
  static override async read(data: BytesIO, ..._arg: Array<any>): Promise<boolean> {
    return data.readUInt32LE(4) === BoolTrue.ID;
  }
}
