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
import { bufferToBigint as toBigint } from '../../../helpers.js';

/**
 * Serializer and deserializer for standard 32-bit (4-byte) signed or unsigned integers.
 *
 * @extends TLObject
 */
export class Int extends TLObject {
  /**
   * The byte size of a standard 32-bit integer (4 bytes).
   */
  static SIZE: number = 4;

  /**
   * Serializes a 32-bit integer into a Buffer.
   *
   * @param value - The integer value to write (accepts `number` or `bigint`).
   * @param signed - Set to `true` if the integer is signed; set to `false` if unsigned. Defaults to `true`.
   * @param little - Set to `true` to write in little-endian format; set to `false` for big-endian. Defaults to `true`.
   * @returns A Buffer containing the 4-byte representation of the integer.
   */
  static override write(
    value: number | bigint,
    signed: boolean = true,
    little: boolean = true,
  ): Buffer {
    const buffer = Buffer.alloc(Int.SIZE);
    if (signed) {
      if (little) {
        buffer.writeInt32LE(Number(value));
      } else {
        buffer.writeInt32BE(Number(value));
      }
    } else {
      if (little) {
        buffer.writeUInt32LE(Number(value));
      } else {
        buffer.writeUInt32BE(Number(value));
      }
    }
    return buffer;
  }

  /**
   * Reads and decodes a 32-bit integer from a binary stream.
   *
   * @param data - The `BytesIO` stream to read the integer from.
   * @param signed - Set to `true` to parse as a signed integer; set to `false` for unsigned. Defaults to `true`.
   * @param little - Set to `true` to read in little-endian format; set to `false` for big-endian. Defaults to `true`.
   * @param size - The exact number of bytes to read from the stream. Defaults to `Int.SIZE`.
   * @returns A promise resolving to the decoded number.
   */
  static override async read(
    data: BytesIO,
    signed: boolean = true,
    little: boolean = true,
    size: number = Int.SIZE,
  ): Promise<number> {
    if (signed) {
      if (little) {
        return data.readInt32LE(size);
      } else {
        return data.readInt32BE(size);
      }
    } else {
      if (little) {
        return data.readUInt32LE(size);
      } else {
        return data.readUInt32BE(size);
      }
    }
  }
}

/**
 * Serializer and deserializer for 64-bit (8-byte) signed or unsigned integers.
 *
 * @remarks
 * In MTProto, 64-bit integers are heavily used for message IDs, session IDs, chat IDs,
 * and salt values. Because standard JS numbers only support safe integers up to 53 bits,
 * this class operates on native JavaScript `bigint` values.
 *
 * @extends TLObject
 */
export class Long extends TLObject {
  /**
   * The byte size of a 64-bit long integer (8 bytes).
   */
  static SIZE: number = 8;

  /**
   * Reads and decodes a 64-bit integer from a binary stream.
   *
   * @param data - The `BytesIO` stream to read the long integer from.
   * @param signed - Set to `true` to parse as a signed integer; set to `false` for unsigned. Defaults to `true`.
   * @param little - Set to `true` to read in little-endian format; set to `false` for big-endian. Defaults to `true`.
   * @param size - The exact number of bytes to read from the stream. Defaults to `Long.SIZE`.
   * @returns A promise resolving to the decoded native `bigint`.
   */
  static override async read(
    data: BytesIO,
    signed: boolean = true,
    little: boolean = true,
    size: number = Long.SIZE,
  ): Promise<bigint> {
    if (signed) {
      if (little) {
        return data.readBigInt64LE(size);
      } else {
        return data.readBigInt64BE(size);
      }
    } else {
      if (little) {
        return data.readBigUInt64LE(size);
      } else {
        return data.readBigUInt64BE(size);
      }
    }
  }

  /**
   * Serializes a 64-bit integer value into a Buffer.
   *
   * @param value - The native `bigint` value to serialize.
   * @param signed - Set to `true` if the integer is signed; set to `false` if unsigned. Defaults to `true`.
   * @param little - Set to `true` to write in little-endian format; set to `false` for big-endian. Defaults to `true`.
   * @returns A Buffer containing the 8-byte representation of the 64-bit integer.
   */
  static override write(value: bigint, signed: boolean = true, little: boolean = true): Buffer {
    const buffer = Buffer.alloc(Long.SIZE);
    if (signed) {
      if (little) {
        buffer.writeBigInt64LE(BigInt(value));
      } else {
        buffer.writeBigInt64BE(BigInt(value));
      }
    } else {
      if (little) {
        buffer.writeBigUInt64LE(BigInt(value));
      } else {
        buffer.writeBigUInt64BE(BigInt(value));
      }
    }
    return buffer;
  }
}

/**
 * Serializer and deserializer for 128-bit (16-byte) integers.
 *
 * @remarks
 * Used in MTProto cryptographic handshakes, secure nonces, and session key generation.
 * Operates on native JavaScript `bigint` values.
 *
 * @extends Long
 */
export class Int128 extends Long {
  /**
   * The byte size of a 128-bit integer (16 bytes).
   */
  static override SIZE: number = 16;

  /**
   * Reads and decodes a 128-bit integer from a binary stream.
   *
   * @param data - The `BytesIO` stream to read the integer from.
   * @param signed - Set to `true` to parse as signed; set to `false` for unsigned. Defaults to `true`.
   * @param little - Set to `true` to read in little-endian format; set to `false` for big-endian. Defaults to `true`.
   * @param size - The exact number of bytes to read from the stream. Defaults to `Int128.SIZE`.
   * @returns A promise resolving to the decoded native `bigint`.
   */
  static override async read(
    data: BytesIO,
    signed: boolean = true,
    little: boolean = true,
    size: number = Int128.SIZE,
  ): Promise<bigint> {
    return toBigint(data.read(size), little, signed);
  }

  /**
   * Serializes a 128-bit integer into a Buffer.
   *
   * @param value - The native `bigint` to serialize.
   * @param _signed - Unused parameter.
   * @param _little - Unused parameter.
   * @returns A Buffer containing the 16-byte representation of the 128-bit integer.
   */
  static override write(value: bigint, _signed: boolean = true, _little: boolean = true): Buffer {
    const bytesArray: Array<number> = [];
    for (let i = 0; i < Int128.SIZE; i++) {
      let shift = value >> BigInt(Long.SIZE * i);
      shift &= BigInt(255);
      bytesArray[i] = Number(String(shift));
    }
    return Buffer.from(bytesArray);
  }
}

/**
 * Serializer and deserializer for 256-bit (32-byte) integers.
 *
 * @remarks
 * Extensively used in cryptographic tasks, DH (Diffie-Hellman) parameters, and authorization key hashing.
 * Operates on native JavaScript `bigint` values.
 *
 * @extends Long
 */
export class Int256 extends Long {
  /**
   * The byte size of a 256-bit integer (32 bytes).
   */
  static override SIZE: number = 32;

  /**
   * Reads and decodes a 256-bit integer from a binary stream.
   *
   * @param data - The `BytesIO` stream to read the integer from.
   * @param signed - Set to `true` to parse as signed; set to `false` for unsigned. Defaults to `true`.
   * @param little - Set to `true` to read in little-endian format; set to `false` for big-endian. Defaults to `true`.
   * @param size - The exact number of bytes to read from the stream. Defaults to `Int256.SIZE`.
   * @returns A promise resolving to the decoded native `bigint`.
   */
  static override async read(
    data: BytesIO,
    signed: boolean = true,
    little: boolean = true,
    size: number = Int256.SIZE,
  ): Promise<bigint> {
    return Int128.read(data, signed, little, size);
  }

  /**
   * Serializes a 256-bit integer into a Buffer.
   *
   * @param value - The native `bigint` to serialize.
   * @param _signed - Unused parameter.
   * @param _little - Unused parameter.
   * @returns A Buffer containing the 32-byte representation of the 256-bit integer.
   */
  static override write(value: bigint, _signed: boolean = true, _little: boolean = true): Buffer {
    const bytesArray: Array<number> = [];
    for (let i = 0; i < Int256.SIZE; i++) {
      let shift = value >> BigInt(Long.SIZE * i);
      shift &= BigInt(255);
      bytesArray[i] = Number(String(shift));
    }
    return Buffer.from(bytesArray);
  }
}
