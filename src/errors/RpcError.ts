/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { Logger } from '../Logger.js';
import { Raw, TLObject } from '../raw/index.js';
import { Exceptions } from './exceptions/All.js';
import { inspect } from '../deps.js';
import { Exceptions as AllExceptions } from './index.js';

interface ExceptionModuleIndexSignature {
  SeeOther: typeof AllExceptions.SeeOther;
  BadRequest: typeof AllExceptions.BadRequest;
  Unauthorized: typeof AllExceptions.Unauthorized;
  Forbidden: typeof AllExceptions.Forbidden;
  NotAcceptable: typeof AllExceptions.NotAcceptable;
  Flood: typeof AllExceptions.Flood;
  InternalServerError: typeof AllExceptions.InternalServerError;
  ServiceUnavailable: typeof AllExceptions.ServiceUnavailable;
  [key: string]: { [key: string]: typeof RPCError };
}

function getModule(name: string) {
  const [namespace, mod] = name.split('.');
  if (
    (AllExceptions as unknown as ExceptionModuleIndexSignature)[
      namespace as unknown as keyof ExceptionModuleIndexSignature
    ] &&
    (AllExceptions as unknown as ExceptionModuleIndexSignature)[
      namespace as unknown as keyof ExceptionModuleIndexSignature
    ][mod]
  ) {
    return (AllExceptions as unknown as ExceptionModuleIndexSignature)[
      namespace as unknown as keyof ExceptionModuleIndexSignature
    ][mod];
  }
  return UnknownError;
}

/**
 * Base error class for all Remote Procedure Call (RPC) errors returned by the Telegram API.
 *
 * @remarks
 * Every failed API request returns an RPC error consisting of an error code (e.g. 400, 401, 403, 420, etc.)
 * and an error identifier (e.g. `PHONE_NUMBER_INVALID`). This class dynamically maps, formats,
 * and formats exceptions into descriptive structures that inherit from `Error`.
 *
 * @extends Error
 */
export class RPCError extends Error {
  /**
   * The Telegram-specific alphanumeric error code identifier. E.g. `FLOOD_WAIT_X`.
   */
  id!: string;

  /**
   * The HTTP/MTProto status code returned. E.g. 400 or 420.
   */
  code!: number;

  /**
   * The formatted, human-readable error message.
   */
  override message!: string;

  /**
   * The class name representing this error instance.
   */
  override name!: string;

  /**
   * The optional value parsed from the Telegram error string (such as the number of seconds to wait).
   */
  value?: number | string | Raw.RpcError;

  /**
   * Internal sign flag. True if the Telegram error code was negative.
   *
   * @internal
   */
  _isSigned?: boolean;

  /**
   * Internal flag indicating whether the error code or string was unrecognized.
   *
   * @internal
   */
  _isUnknown?: boolean;

  /**
   * The name of the specific RPC method that triggered this error.
   *
   * @internal
   */
  _rpcName?: string;

  /**
   * Constructs a new RPCError instance.
   *
   * @param value - The parsed variable value from the Telegram error string, if any.
   * @param rpcName - The name of the causing RPC method.
   * @param isUnknown - True if the error is unrecognized.
   * @param isSigned - True if the error code is signed.
   */
  constructor(
    value?: number | string | Raw.RpcError,
    rpcName?: string,
    isUnknown?: boolean,
    isSigned?: boolean,
  ) {
    super();
    Logger.debug(`[8] Creating new instance RPCError(${rpcName ?? this.name})`);
    this._isSigned = isSigned;
    this._isUnknown = isUnknown;
    this._rpcName = rpcName;
    if (!Number.isNaN(value)) {
      this.value = Number(value);
    } else {
      this.value = value;
    }
    if (isUnknown) {
      Logger.debug(`[9] UnknownError : ${this.name}`);
      // TODO: write UnknownError.txt file
    }
  }

  /**
   * Formats the final exception message by embedding variables and the causing RPC method name.
   *
   * @protected
   */
  protected _format() {
    this.message = `Telegram Says: [${this._isSigned ? '-' : ''}${this.code} ${
      this.id || this.name
    }] - ${(this.message || '').replace(/\{value\}/g, String(this.value))} ${
      this._rpcName ? `(caused by ${this._rpcName})` : ''
    }`;
  }

  /**
   * Analyzes a raw Telegram `RpcError` object and raises a matching, highly-specialized RPC sub-exception.
   *
   * @remarks
   * This static factory parses the Telegram response error string, extracts parameterized values (such as
   * the cooldown duration in `FLOOD_WAIT_60`), matches the error code to the compiled exception dictionary,
   * constructs the correct class dynamically, and throws the finalized instance.
   *
   * @param rpcError - The raw `RpcError` returned from the API deserializer.
   * @param rpcType - The causing TL request object context.
   * @throws {RPCError} The parsed, specialized subclass of `RPCError`.
   */
  static async raise(rpcError: Raw.RpcError, rpcType: TLObject) {
    let code = rpcError.errorCode;
    const message = rpcError.errorMessage;
    const isSigned = code < 0;
    const name = rpcType.className;
    if (isSigned) code = -code;
    if (!(code in Exceptions)) {
      throw new UnknownError(`[${code} ${message}]`, name, true, isSigned);
    }
    let id = message.replace(/\_\d+/gm, '_X');
    const regexMatch = message.match(/\_(\d+)/gm);
    let value: string = '';
    if (regexMatch) {
      value = regexMatch[0].replace(/\_/g, '');
    }
    if (!(id in Exceptions[code as keyof typeof Exceptions])) {
      // try to replace the last word with asterisk (*)
      // example: FILE_REFERENCE_*
      id = id.split('_').splice(-1, 1, '*').join('_');
      if (!(id in Exceptions[code as keyof typeof Exceptions])) {
        const modules = getModule(Exceptions[code as keyof typeof Exceptions]['_']);
        const _module = new modules(value, name, true, isSigned);
        _module.message = `[${code} ${message}]`;
        _module.id = message.replace(/\_\d+/gm, '_X');
        _module._format();
        throw _module;
      }
    }
    const modules = await getModule(
      (Exceptions[code as keyof typeof Exceptions] as { [key: string]: string })[id],
    );
    const _module = new modules(value, name, false, isSigned);
    _module._format();
    throw _module;
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
        if (!key.startsWith('_') && value !== undefined && value !== null) {
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
    // @ts-ignore: deno compatibility
    return String(inspect(this[Symbol.for('nodejs.util.inspect.custom')](), { colors: true }));
  }

  /**
   * Serializes the RPC error object to a clean JSON-compatible representation.
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

/**
 * Fallback error class used when the Telegram API returns an unrecognized error code or message.
 *
 * @extends RPCError
 */
export class UnknownError extends RPCError {
  override code: number = 520;
  override name: string = 'Unknown Error';
}
