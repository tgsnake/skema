/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { BaseError } from './Base.js';

/**
 * Base error class for all file and stream operations.
 *
 * @remarks
 * Extends {@link BaseError} to provide additional context specifically for handling,
 * transferring, and validating local or remote files.
 *
 * @extends BaseError
 * @example
 * ```typescript
 * throw new FileError('File not found', 'The specified file does not exist.');
 * ```
 */
export class FileError extends BaseError {
  /**
   * Constructs a new FileError instance.
   *
   * @param message - A brief message describing the error.
   * @param description - An optional detailed description or troubleshooting guide.
   */
  constructor(message: string, description?: string) {
    super();
    this.message = message;
    this.description = description;
  }
}

/**
 * Error thrown when an attempt is made to upload or process a zero-byte file.
 *
 * @remarks
 * Telegram MTProto uploads require files to have a non-zero byte size.
 *
 * @extends FileError
 * @example
 * ```typescript
 * if (file.size === 0) {
 *   throw new FileUploadZero();
 * }
 * ```
 */
export class FileUploadZero extends FileError {
  /**
   * Constructs a new FileUploadZero instance with predefined error messages.
   */
  constructor() {
    super("Can't upload file when it zero bytes.", 'Provided file has zero bytes (0 B) file size.');
  }
}

/**
 * Error thrown when a file exceeds the maximum allowed file upload size.
 *
 * @extends FileError
 * @example
 * ```typescript
 * if (file.size > LIMIT) {
 *   throw new FileUploadBigger(LIMIT, file.size);
 * }
 * ```
 */
export class FileUploadBigger extends FileError {
  /**
   * Constructs a new FileUploadBigger instance.
   *
   * @param limit - The maximum allowed file size limit in bytes.
   * @param size - The actual size of the provided file in bytes.
   */
  constructor(limit: number, size: number) {
    super(
      `File greater than ${limit} B.`,
      `The provided file has ${size} B file size, it greater than ${limit} B`,
    );
  }
}

/**
 * Error thrown when the provided argument is not a valid readable stream or buffer.
 *
 * @extends FileError
 * @example
 * ```typescript
 * if (!isReadableStream(arg)) {
 *   throw new FileIsNotReadable();
 * }
 * ```
 */
export class FileIsNotReadable extends FileError {
  /**
   * Constructs a new FileIsNotReadable instance with predefined error messages.
   */
  constructor() {
    super('FILE_IS_NOT_READABLE', 'The argument provided is not a Readable stream.');
  }
}
