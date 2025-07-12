/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2025 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { AllTLObject } from '@/raw/All.js';
import { BytesIO, Buffer, inspect } from '@/deps.js';
import { Logger } from '@/Logger.js';
import { Raw, Message, GzipPacked, Primitive, MsgContainer } from '@/raw/index.js';

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
 * Represents a base class for TL (Type Language) objects.
 *
 * This class provides serialization and deserialization logic for TL objects,
 * as well as utility methods for inspection and JSON conversion.
 *
 * @remarks
 * - The class is designed to be extended by specific TL object implementations.
 * - It mimics some Python class behaviors for compatibility with TL schemas.
 *
 * @property _slots - Internal array of slot names for the object.
 * @property cls - Reference to the constructor of the current class (late static binding).
 * @property constructorId - Unique identifier for the constructor.
 * @property subclassOfId - Identifier for the parent class (if any).
 * @property className - Name of the class.
 * @property classType - Type of the class.
 *
 * @example
 * ```typescript
 * class MyTLObject extends TLObject {
 *   // Custom implementation
 * }
 * ```
 */
export class TLObject {
  _slots!: Array<string>;
  // reference python cls -> typescript cls https://stackoverflow.com/questions/38138428/late-static-binding-and-instance-methods-in-typescript
  cls: any = <typeof TLObject>this.constructor;
  constructorId!: number;
  subclassOfId!: number;
  className!: string;
  classType!: string;
  constructor() {
    this._slots = [];
    this.constructorId = this.cls.ID ?? 0;
    this.className = 'TLObject';
  }
  /**
   * Reads a TLObject from the provided BytesIO stream.
   *
   * This static method reads a 32-bit unsigned integer (interpreted as the object ID)
   * from the stream, logs the reading operation, dynamically resolves the corresponding
   * TLObject class, and delegates the reading process to that class's `read` method.
   *
   * @param data - The BytesIO stream to read the TLObject from.
   * @param args - Additional arguments to pass to the resolved TLObject's `read` method.
   * @returns A Promise that resolves to the deserialized TLObject instance.
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
   * Serializes the provided arguments into a Buffer.
   *
   * @param {...any[]} _args - The arguments to be serialized.
   * @returns {Buffer} A Buffer containing the serialized data.
   *
   * @remarks
   * This is a static method. The current implementation returns an empty Buffer.
   */
  static write(..._args: Array<any>): Buffer {
    return Buffer.alloc(0);
  }
  /**
   * Reads data from the provided `BytesIO` instance and processes it using the associated class's `read` method.
   *
   * @param data - The `BytesIO` instance containing the data to be read.
   * @param args - Additional arguments to be passed to the class's `read` method.
   * @returns A promise that resolves with the result of the read operation.
   */
  read(data: BytesIO, ...args: Array<any>): Promise<any> {
    return this.cls.read(data, ...args);
  }
  /**
   * Serializes the provided arguments using the associated class's `write` method.
   *
   * @param {...any[]} args - The arguments to be serialized.
   * @returns {Buffer} The resulting Buffer after serialization.
   */
  write(...args: Array<any>): Buffer {
    return this.cls.write(...args);
  }
  /** @ignore */
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
  /** @ignore */
  [Symbol.for('Deno.customInspect')](): string {
    // @ts-ignore: deno compatibility
    return String(inspect(this[Symbol.for('nodejs.util.inspect.custom')](), { colors: true }));
  }
  /** @ignore */
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
  /** @ignore */
  toString() {
    return `[constructor of ${this.className}] ${JSON.stringify(this, null, 2)}`;
  }
}
