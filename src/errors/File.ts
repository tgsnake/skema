/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2025 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { BaseError } from '@/errors/Base.js';

/**
 * Represents an error related to file operations.
 * Extends the {@link BaseError} class to provide additional context for file-related errors.
 *
 * @remarks
 * This error should be thrown when an operation involving files fails.
 *
 * @example
 * ```typescript
 * throw new FileError('File not found', 'The specified file does not exist.');
 * ```
 *
 * @param message - A brief message describing the error.
 * @param description - An optional detailed description of the error.
 */
export class FileError extends BaseError {
  constructor(message: string, description?: string) {
    super();
    this.message = message;
    this.description = description;
  }
}

/**
 * Error thrown when attempting to upload a file with zero bytes.
 *
 * @extends FileError
 * @remarks
 * This error indicates that the provided file has a size of 0 bytes and cannot be uploaded.
 *
 * @example
 * ```typescript
 * if (file.size === 0) {
 *   throw new FileUploadZero();
 * }
 * ```
 */
export class FileUploadZero extends FileError {
  constructor() {
    super("Can't upload file when it zero bytes.", 'Provided file has zero bytes (0 B) file size.');
  }
}
/**
 * Represents an error that occurs when a file upload exceeds the allowed size limit.
 *
 * @extends {FileError}
 */
export class FileUploadBigger extends FileError {
  /**
   * Creates an instance of FileUploadBigger.
   *
   * @param {number} limit - The maximum allowed file size in bytes.
   * @param {number} size - The actual size of the uploaded file in bytes.
   */
  constructor(limit: number, size: number) {
    super(
      `File greater than ${limit} B.`,
      `The provided file has ${size} B file size, it greater than ${limit} B`,
    );
  }
}

/**
 * Error thrown when the provided argument is not a readable stream.
 *
 * @extends FileError
 * @example
 * throw new FileIsNotReadable();
 */
export class FileIsNotReadable extends FileError {
  constructor() {
    super('FILE_IS_NOT_READABLE', 'The argument provided is not a Readable stream.');
  }
}
