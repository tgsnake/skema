/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { BytesIO, gzipSync, gunzipSync, Buffer } from '../../deps.js';
import { TLObject } from './TLObject.js';
import * as Primitive from './primitive/index.js';

/**
 * Represents a Gzip-compressed wrapper around another serialized TLObject payload.
 *
 * @remarks
 * Telegram MTProto automatically packages certain large responses or bulk payloads
 * within a `gzip_packed` constructor to optimize bandwidth and network performance.
 * This class handles the transparent zlib-based compression and decompression of these payloads.
 *
 * @extends TLObject
 */
export class GzipPacked extends TLObject {
  /**
   * The unique class ID identifier representing `GzipPacked` (0x3072cfa1).
   */
  static ID: number = 0x3072cfa1;

  /**
   * The underlying inner deserialized TLObject that was compressed.
   */
  packedData!: TLObject;

  /**
   * Constructs a new GzipPacked instance.
   *
   * @param packedData - The inner uncompressed TLObject to package.
   */
  constructor(packedData: TLObject) {
    super();
    this.className = 'GzipPacked';
    this._slots = ['packedData'];
    this.packedData = packedData;
  }

  /**
   * Reads, decompresses, and deserializes a Gzip-packed payload from a binary stream.
   *
   * @remarks
   * This method:
   * 1. Reads the length-prefixed compressed bytes from the input stream.
   * 2. Runs native zlib gunzip (`gunzipSync`) on the compressed data.
   * 3. Wraps the raw uncompressed bytes inside a new `BytesIO` stream.
   * 4. Recursively parses the decompressed buffer as a valid `TLObject`.
   *
   * @param data - The `BytesIO` stream containing the compressed `gzip_packed` data structure.
   * @param _args - Unused additional parameters.
   * @returns A promise resolving to the decompressed `GzipPacked` instance wrapping the deserialized object.
   */
  static override async read(data: BytesIO, ..._args: Array<any>) {
    return (await TLObject.read(
      new BytesIO(gunzipSync(await Primitive.Bytes.read(data))),
    )) as unknown as GzipPacked;
  }

  /**
   * Serializes and zlib-compresses the inner TLObject into a raw binary buffer.
   *
   * @remarks
   * Serializes the payload by first writing the 32-bit `GzipPacked.ID` identifier, followed by
   * the length-prefixed zlib-compressed buffer containing the inner TLObject's binary output.
   *
   * @override
   * @returns A Buffer representing the compressed MTProto binary structure.
   */
  override write(): Buffer {
    const bytes = new BytesIO();
    bytes.write(Primitive.Int.write(GzipPacked.ID, false));
    bytes.write(Primitive.Bytes.write(gzipSync(this.packedData.write())));
    return Buffer.from(bytes.buffer as unknown as Uint8Array);
  }
}
