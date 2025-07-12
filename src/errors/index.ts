/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2025 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

export * as Exceptions from '@/errors/exceptions/index.js';
export * as ClientError from '@/errors/Client.js';
export * as WSError from '@/errors/WebSocket.js';
export * as SecretChatError from '@/errors/SecretChat.js';
export * as FileErrors from '@/errors/File.js';
export { RPCError, UnknownError } from '@/errors/RpcError.js';

import { BaseError } from '@/errors/Base.js';

/**
 * Error thrown when a function execution exceeds the specified timeout duration.
 *
 * @extends BaseError
 * @example
 * throw new TimeoutError(5000);
 */
export class TimeoutError extends BaseError {
  timeout!: number;
  constructor(timeout: number) {
    super();
    this.message = `Running timeout after ${timeout} ms`;
    this.timeout = timeout;
    this.description = `The function is running too long, until it reaches the time limit that has been given.`;
  }
}
/**
 * Error thrown when a provided class is not a function constructor.
 *
 * @extends BaseError
 *
 * @example
 * throw new NotAFunctionClass('MyClass');
 *
 * @param className - The name of the class that is not a function constructor.
 * @property message - The error message indicating the class is not a function.
 * @property description - A detailed description of the error.
 */
export class NotAFunctionClass extends BaseError {
  override message: string = '{value} is not a function.';
  override description: string =
    "The provided class {value} is not a function constructor, can't sending request with that class.";
  constructor(className: string) {
    super();
    this.message = this.message.replace('{value}', className);
    this.description = this.description.replace('{value}', className);
  }
}
/**
 * Represents an error related to bad message notifications, typically encountered
 * when there is an issue with message IDs, sequence numbers, server salt, or container validity.
 *
 * The error message is determined by the provided error code, with a description
 * for each known code. If the code is not recognized, 'Unknown Error' is used.
 *
 * @extends BaseError
 *
 * @example
 * ```typescript
 * throw new BadMsgNotification(16);
 * ```
 *
 * @param code - The error code indicating the specific bad message notification reason.
 */
export class BadMsgNotification extends BaseError {
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
 * Represents an error related to security violations within the application.
 * Extends the {@link BaseError} class to provide additional context for security-related issues.
 *
 * @example
 * SecurityError.check(user.isAuthenticated, "User must be authenticated");
 *
 * @param description - Optional description providing details about the security error.
 */
export class SecurityError extends BaseError {
  constructor(description?: string) {
    super();
    this.description = description;
  }
  static check(cond: boolean, description?: string) {
    if (!cond) throw new SecurityError(description);
  }
}
/**
 * Error thrown when a security check fails due to a mismatch.
 *
 * @extends SecurityError
 *
 * @example
 * SecurityCheckMismatch.check(userHasPermission, 'User does not have permission');
 *
 * @property {string} message - The error message describing the mismatch.
 */
export class SecurityCheckMismatch extends SecurityError {
  override message: string = 'A security check mismatch has occurred.';
  static override check(cond: boolean, description?: string) {
    if (!cond) throw new SecurityCheckMismatch(description);
  }
}
/**
 * Error thrown when a CDN file hash mismatch is detected.
 *
 * This error indicates that the hash of a file retrieved from the CDN does not match the expected value,
 * which may be a sign of tampering or corruption.
 *
 * @extends SecurityError
 *
 * @example
 * CDNFileHashMismatch.check(actualHash === expectedHash, 'File hash does not match expected value.');
 */
export class CDNFileHashMismatch extends SecurityError {
  override message: string = 'A CDN file hash mismatch has occurred.';
  static override check(cond: boolean, description?: string) {
    if (!cond) throw new CDNFileHashMismatch(description);
  }
}
