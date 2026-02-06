/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2025 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { BytesIO, gzipSync, gunzipSync, Buffer } from '@/deps.js';
import { TLObject } from '@/raw/core/TLObject.js';
import * as Primitive from '@/raw/core/primitive/index.js';
/**
 * GzipPacked is a class representing a Telegram MTProto object that is packed using gzip compression.
 * It provides methods to read and write this packed data in a specified format.
 */
export class GzipPacked extends TLObject {
  static ID: number = 0x3072cfa1;
  packedData!: TLObject;
  constructor(packedData: TLObject) {
    super();
    this.className = 'GzipPacked';
    this._slots = ['packedData'];
    this.packedData = packedData;
  }
  /**
   * Reads and decompresses Gzip-packed data from the provided `BytesIO` stream.
   *
   * This static method overrides the base implementation to:
   * 1. Read raw bytes from the input stream using `Primitive.Bytes.read`.
   * 2. Decompress the bytes using `gunzipSync`.
   * 3. Wrap the decompressed bytes in a new `BytesIO` instance.
   * 4. Parse the decompressed data as a `TLObject`.
   * 5. Cast and return the result as a `GzipPacked` instance.
   *
   * @param data - The `BytesIO` stream containing the Gzip-packed data.
   * @param _args - Additional arguments (unused).
   * @returns A Promise that resolves to a `GzipPacked` instance.
   */
  static override async read(data: BytesIO, ..._args: Array<any>) {
    return (await TLObject.read(
      new BytesIO(gunzipSync(await Primitive.Bytes.read(data))),
    )) as unknown as GzipPacked;
  }
  /**
   * Serializes the current instance into a Buffer using Gzip compression.
   *
   * This method performs the following steps:
   * 1. Writes the class identifier using a primitive integer writer.
   * 2. Compresses the packed data using Gzip and writes it as bytes.
   * 3. Returns the resulting data as a Node.js Buffer.
   *
   * @returns {Buffer} The serialized and Gzip-compressed representation of the instance.
   */
  override write(): Buffer {
    const bytes = new BytesIO();
    bytes.write(Primitive.Int.write(GzipPacked.ID, false));
    bytes.write(Primitive.Bytes.write(gzipSync(this.packedData.write())));
    return Buffer.from(bytes.buffer as unknown as Uint8Array);
  }
}
