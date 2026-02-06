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
import { Bytes } from '@/raw/core/primitive/Bytes.js';
/**
 * String is a class representing a string in the Telegram MTProto protocol.
 * It provides methods to read and write these strings in a specified format.
 */
export class String extends TLObject {
  /**
   * Serializes a string value into a Buffer using UTF-8 encoding.
   *
   * @param value - The string to be serialized.
   * @returns A Buffer containing the UTF-8 encoded bytes of the input string.
   */
  static override write(value: string): Buffer {
    return Bytes.write(Buffer.from(value, 'utf8')) as unknown as Buffer;
  }
  /**
   * Asynchronously reads a sequence of bytes from the provided `BytesIO` instance
   * and decodes it into a UTF-8 string.
   *
   * @param data - The `BytesIO` instance to read bytes from.
   * @param _args - Additional arguments (unused).
   * @returns A promise that resolves to the decoded UTF-8 string.
   */
  static override async read(data: BytesIO, ..._args: Array<any>): Promise<string> {
    return (await Bytes.read(data)).toString('utf8');
  }
}
