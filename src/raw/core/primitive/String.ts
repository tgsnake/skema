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
import { Bytes } from './Bytes.js';

/**
 * Serializer and deserializer for UTF-8 encoded strings.
 *
 * @remarks
 * In MTProto, strings are treated as standard UTF-8 text and are packed/aligned using
 * the same length-prefix and padding logic as the {@link Bytes} primitive class.
 *
 * @extends TLObject
 */
export class String extends TLObject {
  /**
   * Serializes a JavaScript string into a UTF-8 length-prefixed and padded Buffer.
   *
   * @param value - The input string to serialize.
   * @returns A Buffer containing the encoded string.
   */
  static override write(value: string): Buffer {
    return Bytes.write(Buffer.from(value, 'utf8')) as unknown as Buffer;
  }

  /**
   * Reads, aligns, and decodes a UTF-8 string from a binary stream.
   *
   * @param data - The `BytesIO` stream containing the serialized string.
   * @param _args - Unused additional parameters.
   * @returns A promise resolving to the decoded native JavaScript string.
   */
  static override async read(data: BytesIO, ..._args: Array<any>): Promise<string> {
    return (await Bytes.read(data)).toString('utf8');
  }
}
