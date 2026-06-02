/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { AllTLObject } from '../All.js';
import { BytesIO, Buffer, inspect } from '../../deps.js';
import { Logger } from '../../Logger.js';
import { Raw, Message, GzipPacked, Primitive, MsgContainer } from '../index.js';

interface RawIndexSignature {
  [key: string]: any;
}
interface PrimitiveIndexSignature {
  Int: typeof Primitive.Int;
  Long: typeof Primitive.Long;
  Int128: typeof Primitive.Int128;
  Int256: typeof Primitive.Int256;
  Bytes: typeof Primitive.Bytes;
  String: typeof Primitive.String;
  Bool: typeof Primitive.Bool;
  BoolFalse: typeof Primitive.BoolFalse;
  BoolTrue: typeof Primitive.BoolTrue;
  Vector: typeof Primitive.Vector;
  Double: typeof Primitive.Double;
  Float: typeof Primitive.Float;
  [key: string]: any;
}

function getModule(
  name: string,
): typeof TLObject | typeof Message | typeof GzipPacked | typeof MsgContainer {
  if (!name) {
    throw new Error("name of module can't be undefined");
  }
  if (name === 'Message') {
    return Message;
  } else if (name === 'GzipPacked') {
    return GzipPacked;
  } else if (name === 'MsgContainer') {
    return MsgContainer;
  } else if (name.startsWith('Primitive')) {
    return (Primitive as PrimitiveIndexSignature)[name.split('.')[1]];
  } else {
    const split = name.split('.');
    if (split.length == 3) {
      return (Raw as RawIndexSignature)[split[1]][split[2]];
    }
    return (Raw as RawIndexSignature)[split[1]];
  }
}

/**
 * Base abstract class for all Type Language (TL) schema objects within the MTProto protocol.
 *
 * @remarks
 * In the Telegram MTProto protocol, messages and API payloads are defined in a custom ID-based schema language
 * called Type Language (TL). `TLObject` is the root class providing fundamental binary serialization (`write`)
 * and deserialization (`read`) interfaces, alongside custom console print formatters and standard JSON serializers.
 */
export class TLObject {
  /**
   * The internal slot list storing serialization field property names.
   *
   * @internal
   */
  _slots!: Array<string>;

  /**
   * A dynamic reference to the current subclass constructor.
   * Enables late static binding for instance methods to access static helper operations.
   */
  cls: any = <typeof TLObject>this.constructor;

  /**
   * The unique 32-bit integer identifier (CRC32 checksum) of this TL constructor.
   */
  constructorId!: number;

  /**
   * The unique 32-bit integer identifier of the parent/abstract type this TL subclass represents.
   */
  subclassOfId!: number;

  /**
   * The canonical string name of this class representation.
   */
  className!: string;

  /**
   * The underlying classification type (e.g. `request`, `constructor`, `function`).
   */
  classType!: string;

  /**
   * Constructs a new TLObject instance, initializing slots and late-bound constructors.
   */
  constructor() {
    this._slots = [];
    this.constructorId = this.cls.ID ?? 0;
    this.className = 'TLObject';
  }

  /**
   * Reads and deserializes a generic TLObject from a binary stream.
   *
   * @remarks
   * This method first reads the leading 32-bit little-endian integer from the stream, which is
   * treated as the unique `constructorId` (or Class ID). It resolves the constructor class dynamically
   * from the global TL object map (`AllTLObject`) and delegates parsing to the subclass's static `read` method.
   *
   * @param data - The `BytesIO` buffer stream containing the serialized TLObject.
   * @param args - Additional arguments passed down to the resolved subclass's static read implementation.
   * @returns A promise resolving to the parsed class instance.
   */
  static async read(data: BytesIO, ...args: Array<any>): Promise<any> {
    const id = data.readUInt32LE(4);
    Logger.debug(
      `[10] Reading TLObject with id: ${id.toString(16)} (${AllTLObject[id as unknown as keyof typeof AllTLObject]})`,
    );
    const _class = getModule(AllTLObject[id as unknown as keyof typeof AllTLObject]);
    return await _class.read(data, ...args);
  }

  /**
   * Serializes constructor arguments into a raw binary buffer.
   *
   * @remarks
   * This base implementation acts as an abstract stub returning an empty Buffer. Subclasses override
   * this static method to handle specific binary serialization layouts.
   *
   * @param _args - Arguments to be serialized.
   * @returns An empty `Buffer` of size 0.
   */
  static write(..._args: Array<any>): Buffer {
    return Buffer.alloc(0);
  }

  /**
   * Deserializes a binary stream into this specific TLObject instance.
   *
   * @param data - The `BytesIO` buffer stream containing the serialized TLObject.
   * @param args - Additional arguments passed down to the read parser.
   * @returns A promise resolving to the parsed instance.
   */
  read(data: BytesIO, ...args: Array<any>): Promise<any> {
    return this.cls.read(data, ...args);
  }

  /**
   * Serializes the current class instance into a raw binary buffer.
   *
   * @param args - Arguments passed down to the writer.
   * @returns A Buffer containing the serialized representation of this object.
   */
  write(...args: Array<any>): Buffer {
    return this.cls.write(...args);
  }

  /**
   * Custom inspect handler for Node.js console output (`util.inspect`).
   * Omits private properties (prefixed with `_`) and structural metadata to keep console outputs clean.
   *
   * @ignore
   * @returns An object containing enumerable public properties to display.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {
      _: this.className,
    };
    const ignore = ['slots', 'className', 'constructorId', 'subclassOfId', 'classType', 'cls'];
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const value = this[key];
        if (ignore.includes(key)) continue;
        if (!key.startsWith('_') && value !== undefined && value !== null) {
          toPrint[key] = value;
        }
      }
    }
    return toPrint;
  }

  /**
   * Custom inspect handler for Deno runtime terminal output (`Deno.inspect`).
   * Wraps the Node.js inspect output and enables terminal colors.
   *
   * @ignore
   * @returns The colorized, formatted representation of the TLObject.
   */
  [Symbol.for('Deno.customInspect')](): string {
    // @ts-ignore: deno compatibility
    return String(inspect(this[Symbol.for('nodejs.util.inspect.custom')](), { colors: true }));
  }

  /**
   * Serializes the TLObject instance to a clean JSON-compatible representation.
   *
   * @remarks
   * Correctly stringifies extremely large fields (e.g. bigints) that are normally not
   * serializable in standard `JSON.stringify` calls.
   *
   * @returns A plain object containing class attributes and values.
   */
  toJSON(): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {
      _: this.className,
    };
    const ignore = ['slots', 'className', 'constructorId', 'subclassOfId', 'classType', 'cls'];
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const value = this[key];
        if (ignore.includes(key)) continue;
        if (!key.startsWith('_') && value !== undefined && value !== null) {
          if (typeof value === 'bigint') {
            toPrint[key] = String(value);
          } else if (Array.isArray(value)) {
            toPrint[key] = value.map((v) => (typeof v === 'bigint' ? String(v) : v));
          } else {
            toPrint[key] = value;
          }
        }
      }
    }
    return toPrint;
  }

  /**
   * Formats the TLObject into a structured string.
   *
   * @returns A string starting with the constructor name followed by a pretty JSON payload.
   */
  toString() {
    return `[constructor of ${this.className}] ${JSON.stringify(this, null, 2)}`;
  }
}
