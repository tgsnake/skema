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
 * Base custom error class for all secret chat end-to-end encryption and session management issues.
 *
 * @extends BaseError
 * @example
 * ```typescript
 * throw new SecretChatError('Failed to decrypt message', 'The provided key is invalid.');
 * ```
 */
export class SecretChatError extends BaseError {
  /**
   * Constructs a new SecretChatError instance.
   *
   * @param message - A brief message describing the error.
   * @param description - An optional detailed description or troubleshooting context.
   */
  constructor(message: string, description?: string) {
    super();
    this.message = message;
    this.description = description;
  }
}

/**
 * Error thrown when a security key fingerprint mismatch is detected during end-to-end secret chat encryption.
 *
 * @remarks
 * This suggests that the encryption key exchanged does not match, indicating the session is not secure
 * or has been tampered with. For security reasons, the secret chat must be closed immediately.
 *
 * @extends SecretChatError
 */
export class FingerprintMismatch extends SecretChatError {
  /**
   * Constructs a new FingerprintMismatch instance with predefined error messages.
   */
  constructor() {
    super(
      'Fingerprint key mismatch',
      'Given fingerprint key from message is mismatch. So the message is not secure and the secret chat should be closed.',
    );
  }
}

/**
 * Error thrown when a secret chat session ID cannot be found in the client's local database or session file.
 *
 * @remarks
 * Ensure that the `chatId` is valid, correct, and that the secret chat negotiation has already taken place
 * and was stored successfully.
 *
 * @extends SecretChatError
 * @example
 * ```typescript
 * throw new ChatNotFound(12345);
 * ```
 */
export class ChatNotFound extends SecretChatError {
  /**
   * Constructs a new ChatNotFound instance.
   *
   * @param chatId - The target secret chat ID that was not found.
   */
  constructor(chatId: number) {
    super(
      'Secret chat not found',
      `Provided chatId (${chatId}) is not found in session. Make sure the chatId is correct and already saved in session.`,
    );
  }
}

/**
 * Error thrown when an attempt is made to accept an end-to-end secret chat request that has already been accepted.
 *
 * @remarks
 * Secret chats can only transition from pending to accepted once.
 *
 * @extends SecretChatError
 */
export class AlreadyAccepted extends SecretChatError {
  /**
   * Constructs a new AlreadyAccepted instance.
   */
  constructor() {
    super('Secret chat already accepted');
  }
}
