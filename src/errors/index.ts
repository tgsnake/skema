/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

export * as Exceptions from './exceptions/index.js';
export * as ClientError from './Client.js';
export * as WSError from './WebSocket.js';
export * as SecretChatError from './SecretChat.js';
export * as FileErrors from './File.js';
export { RPCError, UnknownError } from './RpcError.js';

import { BaseError } from './Base.js';

/**
 * Error thrown when a promise or task execution exceeds a specified timeout threshold.
 *
 * @extends BaseError
 * @example
 * ```typescript
 * throw new TimeoutError(5000);
 * ```
 */
export class TimeoutError extends BaseError {
  /**
   * The duration in milliseconds that was allowed before the timeout triggered.
   */
  timeout!: number;

  /**
   * Constructs a new TimeoutError instance.
   *
   * @param timeout - The timeout limit in milliseconds.
   */
  constructor(timeout: number) {
    super();
    this.message = `Running timeout after ${timeout} ms`;
    this.timeout = timeout;
    this.description = `The function is running too long, until it reaches the time limit that has been given.`;
  }
}

/**
 * Error thrown when the client encounters a class constructor where it was expecting an executable function.
 *
 * @extends BaseError
 * @example
 * ```typescript
 * throw new NotAFunctionClass('MyClass');
 * ```
 */
export class NotAFunctionClass extends BaseError {
  override message: string = '{value} is not a function.';
  override description: string =
    "The provided class {value} is not a function constructor, can't sending request with that class.";

  /**
   * Constructs a new NotAFunctionClass instance.
   *
   * @param className - The name of the invalid class.
   */
  constructor(className: string) {
    super();
    this.message = this.message.replace('{value}', className);
    this.description = this.description.replace('{value}', className);
  }
}

/**
 * Error raised when the server responds with a bad message notification.
 *
 * @remarks
 * Bad message notifications indicate structural, sequence, or time-sync errors in client messages.
 * Common errors include out-of-sync system time, invalid sequence numbers (`seq_no`), or salt expiration.
 *
 * @extends BaseError
 * @example
 * ```typescript
 * throw new BadMsgNotification(16);
 * ```
 */
export class BadMsgNotification extends BaseError {
  /**
   * Constructs a new BadMsgNotification instance.
   *
   * @param code - The bad message error code returned by the Telegram MTProto server.
   */
  constructor(code: number) {
    const description: { [key: number]: string } = {
      16: 'The msg_id is too low, the client time has to be synchronized.',
      17: 'The msg_id is too high, the client time has to be synchronized.',
      18: 'Incorrect two lower order of the msg_id bits, the server expects the client message\nmsg_id to be divisible by 4.',
      19: 'The container msg_id is the same as the msg_id of a previously received message.',
      20: 'The message is too old, it cannot be verified by the server.',
      32: 'The msg_seqno is too low.',
      33: 'The msg_seqno is too high.',
      34: 'An even msg_seqno was expected, but an odd one was received.',
      35: 'An odd msg_seqno was expected, but an even one was received.',
      48: 'Incorrect server salt.',
      64: 'Invalid container.',
    };
    super(`[${code}] ${description[code] ?? 'Unknown Error'}`);
  }
}

/**
 * Custom error thrown when a security check, hash mismatch, or signature verification fails.
 *
 * @extends BaseError
 * @example
 * ```typescript
 * SecurityError.check(user.isAuthenticated, "User must be authenticated");
 * ```
 */
export class SecurityError extends BaseError {
  /**
   * Constructs a new SecurityError instance.
   *
   * @param description - Detailed context of the security violation.
   */
  constructor(description?: string) {
    super();
    this.description = description;
  }

  /**
   * Asserts that a condition is true, throwing a SecurityError if it is not.
   *
   * @param cond - The boolean condition to evaluate.
   * @param description - Detailed error message if assertion fails.
   * @throws {SecurityError} If the condition is false.
   */
  static check(cond: boolean, description?: string) {
    if (!cond) throw new SecurityError(description);
  }
}

/**
 * Error raised when an assertion check for key, signature, or padding lengths fails.
 *
 * @extends SecurityError
 * @example
 * ```typescript
 * SecurityCheckMismatch.check(serverNonce === expectedNonce, 'Nonce mismatch');
 * ```
 */
export class SecurityCheckMismatch extends SecurityError {
  override message: string = 'A security check mismatch has occurred.';

  /**
   * Asserts that a condition is true, throwing a SecurityCheckMismatch if it is not.
   *
   * @param cond - The boolean condition to evaluate.
   * @param description - Detailed error message if assertion fails.
   * @throws {SecurityCheckMismatch} If the condition is false.
   */
  static override check(cond: boolean, description?: string) {
    if (!cond) throw new SecurityCheckMismatch(description);
  }
}

/**
 * Error raised when the checksum or hash verification of a file downloaded from a Telegram CDN fails.
 *
 * @extends SecurityError
 * @example
 * ```typescript
 * CDNFileHashMismatch.check(downloadedHash === correctHash, 'CDN file hash is corrupted');
 * ```
 */
export class CDNFileHashMismatch extends SecurityError {
  override message: string = 'A CDN file hash mismatch has occurred.';

  /**
   * Asserts that a condition is true, throwing a CDNFileHashMismatch if it is not.
   *
   * @param cond - The boolean condition to evaluate.
   * @param description - Detailed error message if assertion fails.
   * @throws {CDNFileHashMismatch} If the condition is false.
   */
  static override check(cond: boolean, description?: string) {
    if (!cond) throw new CDNFileHashMismatch(description);
  }
}
