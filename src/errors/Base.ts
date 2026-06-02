/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { inspect } from '../deps.js';

/**
 * Base custom error class for the entire tgsnake library.
 *
 * @remarks
 * This class inherits from the standard JavaScript `Error` object.
 * It provides uniform JSON serialization (`toJSON`), string serialization (`toString`),
 * and platform-agnostic runtime object inspector support for Node.js (`util.inspect`)
 * and Deno console utilities.
 *
 * @example
 * ```typescript
 * class MyCustomError extends BaseError {
 *   constructor(msg: string) {
 *     super(msg);
 *     this.name = "MyCustomError";
 *   }
 * }
 * ```
 */
export class BaseError extends Error {
  /**
   * The message string describing this error.
   */
  override message!: string;

  /**
   * Detailed human-readable description offering troubleshooting steps or context.
   */
  description?: string;

  /**
   * Constructs a new instance of the BaseError class.
   *
   * @param message - An optional brief message describing the error.
   */
  constructor(message?: string) {
    super(message);
  }

  /**
   * Custom inspect handler for Node.js console output (`util.inspect`).
   * Omits private properties (prefixed with `_`) to keep debug prints clean.
   *
   * @ignore
   * @returns An object containing enumerable public properties to display.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): { [key: string]: unknown } {
    const toPrint: { [key: string]: unknown } = {
      _: this.constructor.name,
    };
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const value = this[key];
        if (!key.startsWith('_')) {
          toPrint[key] = value;
        }
      }
    }
    Object.setPrototypeOf(toPrint, {
      stack: this.stack,
    });
    return toPrint;
  }

  /**
   * Custom inspect handler for Deno runtime terminal output (`Deno.inspect`).
   * Wraps the Node.js inspect output and enables terminal colors.
   *
   * @ignore
   * @returns The colorized, formatted representation of the error.
   */
  [Symbol.for('Deno.customInspect')](): string {
    // @ts-ignore: Deno custom inspect
    return String(inspect(this[Symbol.for('nodejs.util.inspect.custom')](), { colors: true }));
  }

  /**
   * Serializes the error object to a clean JSON-compatible representation.
   *
   * @remarks
   * Correctly stringifies extremely large fields (e.g. bigints) that are normally not
   * serializable in standard `JSON.stringify` calls.
   *
   * @returns A plain object containing error properties and the stack trace.
   */
  toJSON(): { [key: string]: unknown } {
    const toPrint: { [key: string]: unknown } = {
      _: this.constructor.name,
      stack: this.stack,
    };
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const value = this[key];
        if (!key.startsWith('_')) {
          toPrint[key] = typeof value === 'bigint' ? String(value) : value;
        }
      }
    }
    return toPrint;
  }

  /**
   * Formats the error into a structured string.
   *
   * @returns A string starting with the constructor name followed by a pretty JSON payload.
   */
  override toString(): string {
    return `[constructor of ${this.constructor.name}] ${JSON.stringify(this, null, 2)}`;
  }
}
