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
 * Represents an error specific to secret chat operations.
 * Extends the {@link BaseError} class to provide additional context for secret chat related errors.
 *
 * @extends BaseError
 * @example
 * throw new SecretChatError('Failed to decrypt message', 'The provided key is invalid.');
 */
export class SecretChatError extends BaseError {
  constructor(message: string, description?: string) {
    super();
    this.message = message;
    this.description = description;
  }
}
/**
 * Error thrown when a fingerprint key mismatch is detected in a secret chat.
 *
 * This error indicates that the fingerprint key provided in a message does not match
 * the expected value, suggesting a potential security issue. When this error occurs,
 * the secret chat should be closed to prevent insecure communication.
 *
 * @extends SecretChatError
 */
export class FingerprintMismatch extends SecretChatError {
  constructor() {
    super(
      'Fingerprint key mismatch',
      'Given fingerprint key from message is mismatch. So the message is not secure and the secret chat should be closed.',
    );
  }
}
/**
 * Error thrown when a secret chat with the specified chat ID cannot be found in the session.
 *
 * This typically indicates that the provided `chatId` does not correspond to any existing secret chat
 * in the current session. Ensure that the `chatId` is correct and that the chat has been previously saved.
 *
 * @extends SecretChatError
 * @example
 * ```typescript
 * throw new ChatNotFound(12345);
 * ```
 */
export class ChatNotFound extends SecretChatError {
  constructor(chatId: number) {
    super(
      'Secret chat not found',
      `Provided chatId (${chatId}) is not found in session. Make sure the chatId is correct and already saved in session.`,
    );
  }
}
/**
 * Error thrown when an attempt is made to accept a secret chat that has already been accepted.
 *
 * @extends SecretChatError
 * @remarks
 * This error indicates that the secret chat session is already in an accepted state,
 * and further attempts to accept it are redundant.
 */
export class AlreadyAccepted extends SecretChatError {
  constructor() {
    super('Secret chat already accepted');
  }
}
