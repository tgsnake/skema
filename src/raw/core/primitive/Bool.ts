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
 * Bool, BoolTrue, and BoolFalse are classes representing boolean values in the Telegram MTProto protocol.
 * They provide methods to read and write these boolean values in a specified format.
 */
export class BoolFalse extends TLObject {
  static ID: number = 0xbc799737;
  static value: boolean = false;
  /**
   * Serializes the `BoolFalse` identifier into a 4-byte buffer.
   *
   * @returns {Buffer} A buffer containing the 32-bit little-endian representation of `BoolFalse.ID`.
   * @override
   */
  static override write(): Buffer {
    const buff = Buffer.alloc(4);
    buff.writeUInt32LE(BoolFalse.ID);
    return buff;
  }
  /**
   * Asynchronously reads a boolean value from the provided BytesIO stream.
   *
   * @param _data - The BytesIO instance to read data from.
   * @param _arg - Additional arguments that may be used for reading (currently unused).
   * @returns A promise that resolves to a boolean value.
   */
  static override async read(_data: BytesIO, ..._arg: Array<any>): Promise<boolean> {
    return BoolFalse.value;
  }
}
/**
 * Represents the boolean value `true` as a subclass of `BoolFalse`.
 *
 * This class provides serialization and deserialization logic for the `true` boolean value,
 * using a specific 32-bit identifier. It is typically used in contexts where boolean values
 * need to be encoded or decoded in a binary format.
 *
 * @extends BoolFalse
 *
 * @remarks
 * - The static `ID` uniquely identifies the `BoolTrue` type in serialized form.
 * - The static `value` is always `true`.
 * - The `write` method serializes the identifier to a 4-byte buffer.
 * - The `read` method asynchronously returns the boolean value `true`.
 */
export class BoolTrue extends BoolFalse {
  static override ID: number = 0x997275b5;
  static override value: boolean = true;
  /**
   * Serializes the `BoolTrue` identifier into a 4-byte buffer.
   *
   * @returns {Buffer} A buffer containing the 32-bit little-endian representation of `BoolTrue.ID`.
   * @override
   */
  static override write(): Buffer {
    const buff = Buffer.alloc(4);
    buff.writeUInt32LE(BoolTrue.ID);
    return buff;
  }
  /**
   * Asynchronously reads a boolean value from the provided BytesIO stream.
   *
   * @param _data - The BytesIO instance to read data from.
   * @param _arg - Additional arguments (unused).
   * @returns A promise that resolves to a boolean value.
   */
  static override async read(_data: BytesIO, ..._arg: Array<any>): Promise<boolean> {
    return BoolTrue.value;
  }
}
/**
 * Represents a boolean value in a custom serialization format.
 *
 * The `Bool` class provides static methods to serialize and deserialize boolean values
 * to and from a specific binary format, using the `BoolTrue` and `BoolFalse` representations.
 * It extends the `TLObject` base class and overrides its serialization methods.
 *
 * @remarks
 * - The `write` method serializes a boolean value into a `Buffer` using the appropriate
 *   representation for `true` or `false`.
 * - The `read` method asynchronously reads a boolean value from a `BytesIO` stream,
 *   interpreting the value based on a 32-bit unsigned integer comparison.
 *
 * @example
 * ```typescript
 * const buffer = Bool.write(true); // Serializes `true` to Buffer
 * const value = await Bool.read(bytesIO); // Deserializes from BytesIO to boolean
 * ```
 *
 * @extends TLObject
 */
export class Bool extends TLObject {
  override className: string = 'Bool';
  /**
   * Serializes a boolean value into a Buffer.
   *
   * @param value - The boolean value to serialize.
   * @returns A Buffer representing the serialized boolean value.
   *          If `value` is `true`, returns the result of `BoolTrue.write()`;
   *          otherwise, returns the result of `BoolFalse.write()`.
   */
  static override write(value: boolean): Buffer {
    return value ? BoolTrue.write() : BoolFalse.write();
  }
  /**
   * Asynchronously reads a boolean value from the provided `BytesIO` stream.
   *
   * This method reads a 32-bit unsigned integer (little-endian) from the stream
   * and compares it to `BoolTrue.ID` to determine the boolean value.
   *
   * @param data - The `BytesIO` instance to read from.
   * @param _arg - Additional arguments (unused).
   * @returns A promise that resolves to `true` if the read value equals `BoolTrue.ID`, otherwise `false`.
   */
  static override async read(data: BytesIO, ..._arg: Array<any>): Promise<boolean> {
    return data.readUInt32LE(4) === BoolTrue.ID;
  }
}
