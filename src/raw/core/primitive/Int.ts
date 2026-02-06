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
import { bufferToBigint as toBigint } from '@/helpers.js';
/**
 * Int, Long, Int128, and Int256 are classes representing various integer types.
 * They provide methods to read and write these integers in a specified format.
 */
export class Int extends TLObject {
  static SIZE: number = 4;
  /**
   * Serializes a 32-bit integer value into a Buffer.
   *
   * @param value - The integer value to write. Can be a `number` or `bigint`.
   * @param signed - Whether the integer should be written as signed (`true`) or unsigned (`false`). Defaults to `true`.
   * @param little - Whether to use little-endian (`true`) or big-endian (`false`) byte order. Defaults to `true`.
   * @returns A Buffer containing the serialized 32-bit integer.
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
   * Reads an integer value from the given `BytesIO` stream according to the specified options.
   *
   * @param data - The `BytesIO` instance to read from.
   * @param signed - Whether to read the value as a signed integer. Defaults to `true`.
   * @param little - Whether to use little-endian byte order. Defaults to `true`.
   * @param size - The number of bytes to read. Defaults to `Int.SIZE`.
   * @returns A promise that resolves to the read integer value.
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

export class Long extends TLObject {
  static SIZE: number = 8;
  /**
   * Reads a 64-bit integer value from the provided `BytesIO` stream.
   *
   * @param data - The `BytesIO` instance to read from.
   * @param signed - Whether to read the value as a signed integer. Defaults to `true`.
   * @param little - Whether to use little-endian byte order. Defaults to `true`.
   * @param size - The number of bytes to read. Defaults to `Long.SIZE`.
   * @returns A promise that resolves to the read value as a `bigint`.
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
   * @param value - The bigint value to write into the buffer.
   * @param signed - Whether the value should be written as a signed integer. Defaults to `true`.
   * @param little - Whether to use little-endian byte order. Defaults to `true`.
   * @returns A Buffer containing the serialized 64-bit integer.
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
export class Int128 extends Long {
  static override SIZE: number = 16;
  /**
   * Reads a signed or unsigned integer of specified size and endianness from a BytesIO stream.
   *
   * @param data - The BytesIO stream to read from.
   * @param signed - Whether the integer should be interpreted as signed. Defaults to `true`.
   * @param little - Whether to use little-endian byte order. Defaults to `true`.
   * @param size - The number of bytes to read. Defaults to `Int128.SIZE`.
   * @returns A Promise that resolves to the read integer as a `bigint`.
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
   * Serializes a 128-bit integer (`bigint`) value into a Buffer.
   *
   * @param value - The 128-bit integer value to serialize.
   * @param _signed - Indicates whether the integer is signed. Defaults to `true`.
   * @param _little - Indicates whether to use little-endian byte order. Defaults to `true`.
   * @returns A Buffer containing the serialized bytes of the integer.
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
export class Int256 extends Long {
  static override SIZE: number = 32;
  /**
   * Reads an integer value from the provided `BytesIO` stream.
   *
   * @param data - The byte stream to read from.
   * @param signed - Whether the integer should be interpreted as signed. Defaults to `true`.
   * @param little - Whether the byte order is little-endian. Defaults to `true`.
   * @param size - The number of bytes to read. Defaults to `Int256.SIZE`.
   * @returns A promise that resolves to the read integer as a `bigint`.
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
   * Serializes a bigint value into a Buffer, representing a 256-bit integer.
   *
   * @param value - The bigint value to serialize.
   * @param _signed - Indicates whether the integer is signed. Defaults to true.
   * @param _little - Indicates whether to use little-endian byte order. Defaults to true.
   * @returns A Buffer containing the serialized bytes of the bigint value.
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
