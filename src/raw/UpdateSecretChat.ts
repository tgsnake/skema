/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { Raw } from './Raw.js';
import { TLObject } from './core/TLObject.js';

/**
 * Interface representing an E2E decryption generator context.
 *
 * @remarks
 * Any secret chat management instance passed into `UpdateSecretChatMessage.generate` must implement
 * this interface to decrypt incoming encrypted raw Telegram message updates.
 *
 * @interface TypeTGenerate
 */
export interface TypeTGenerate {
  /**
   * Decrypts a raw encrypted secret chat message.
   *
   * @param message - The raw encrypted message object received from Telegram.
   * @returns A promise resolving to the decrypted raw message structure.
   */
  decrypt: (message: Raw.TypeEncryptedMessage) => Promise<Raw.TypeDecryptedMessage>;
}

/**
 * Represents a decrypted secret chat message update wrapper.
 *
 * @remarks
 * This modified update structure wraps raw incoming Telegram encrypted updates (`UpdateNewEncryptedMessage`)
 * and replaces the encrypted message payload with its fully-decrypted message or service structure.
 * This simplifies message handling by eliminating manual decrypt stages.
 *
 * @extends TLObject
 */
export class UpdateSecretChatMessage extends TLObject {
  /**
   * The decrypted message or service message payload.
   */
  message!: SecretChatMessage | SecretChatMessageService;

  /**
   * The queue timestamp (QTS) parameter indicating the sequence order of the update.
   */
  qts!: number;

  /**
   * The original raw Telegram encrypted update instance.
   *
   * @internal
   */
  _original!: Raw.UpdateNewEncryptedMessage;

  /**
   * Constructs a new UpdateSecretChatMessage wrapper.
   *
   * @param params - Initial parameter values.
   */
  constructor(params: {
    message: SecretChatMessage | SecretChatMessageService;
    qts: number;
    original: Raw.UpdateNewEncryptedMessage;
  }) {
    super();
    this.classType = 'modified_types_UpdateNewEncryptedMessage';
    this.className = 'UpdateSecretChatMessage';
    this.constructorId = 1;
    this.subclassOfId = 0x9f89304e;
    this._slots = ['message', 'qts'];
    this.message = params.message;
    this.qts = params.qts;
    this._original = params.original;
  }

  /**
   * Decrypts a raw encrypted update and generates a fully decrypted `UpdateSecretChatMessage` wrapper.
   *
   * @remarks
   * This static factory determines whether the encrypted message is a standard user message or
   * a service message (e.g. key exchange requests), calls `secretChat.decrypt()` to decrypt the body,
   * constructs the appropriate wrapper class (`SecretChatMessage` or `SecretChatMessageService`),
   * and returns the finalized update object.
   *
   * @typeParam T - The secret chat context class implementing {@link TypeTGenerate}.
   * @param update - The raw `UpdateNewEncryptedMessage` containing the encrypted payload.
   * @param secretChat - The secret chat session manager used to decrypt the message bytes.
   * @returns A promise resolving to the decrypted `UpdateSecretChatMessage` instance.
   */
  static async generate<T>(
    update: Raw.UpdateNewEncryptedMessage,
    secretChat: T,
  ): Promise<UpdateSecretChatMessage> {
    const decrypted = await (secretChat as TypeTGenerate).decrypt(update.message);
    if (update.message instanceof Raw.EncryptedMessageService) {
      return new UpdateSecretChatMessage({
        message: new SecretChatMessageService({
          randomId: update.message.randomId,
          chatId: update.message.chatId,
          date: update.message.date,
          // @ts-ignore: TS doesn't know that decrypted is a DecryptedMessageService
          message: decrypted!,
        }),
        qts: update.qts,
        original: update,
      });
    }
    return new UpdateSecretChatMessage({
      message: new SecretChatMessage({
        randomId: update.message.randomId,
        chatId: update.message.chatId,
        date: update.message.date,
        file: update.message.file,
        // @ts-ignore: TS doesn't know that decrypted is a DecryptedMessage
        message: decrypted!,
      }),
      qts: update.qts,
      original: update,
    });
  }

  /**
   * The original raw encrypted message container received from Telegram.
   *
   * @returns The raw original encrypted update object.
   */
  get original(): Raw.UpdateNewEncryptedMessage {
    return this._original;
  }
}

/**
 * Represents a decrypted standard text or media message within a secret chat.
 *
 * @remarks
 * Wraps the decrypted end-to-end encrypted payload together with its local random ID, chat context,
 * timestamp, and optional media file attachments.
 *
 * @extends TLObject
 * @example
 * ```typescript
 * const secretMessage = new SecretChatMessage({
 *   randomId: 1234567890123456789n,
 *   chatId: 42,
 *   date: 1680000000,
 *   message: decryptedMessageInstance,
 *   file: encryptedFileInstance
 * });
 * ```
 */
export class SecretChatMessage extends TLObject {
  /**
   * A unique 64-bit identifier chosen by the client to prevent replay attacks.
   */
  randomId!: bigint;

  /**
   * The unique secret chat identifier.
   */
  chatId!: number;

  /**
   * The Unix timestamp indicating when the message was sent.
   */
  date!: number;

  /**
   * The decrypted inner message payload mapping to a standard version-specific schema.
   */
  message!:
    | Raw.DecryptedMessage8
    | Raw.DecryptedMessage17
    | Raw.DecryptedMessage45
    | Raw.DecryptedMessage73;

  /**
   * The encrypted file attachment description associated with this message, if any.
   */
  file!: Raw.TypeEncryptedFile;

  /**
   * Constructs a new SecretChatMessage instance.
   *
   * @param params - Initial parameter values.
   */
  constructor(params: {
    randomId: bigint;
    chatId: number;
    date: number;
    message:
      | Raw.DecryptedMessage8
      | Raw.DecryptedMessage17
      | Raw.DecryptedMessage45
      | Raw.DecryptedMessage73;
    file: Raw.TypeEncryptedFile;
  }) {
    super();
    this.classType = 'modified_types_EncryptedMessage';
    this.className = 'SecretChatMessage';
    this.constructorId = 2;
    this.subclassOfId = 0x239f2e51;
    this._slots = ['randomId', 'chatId', 'date', 'message', 'file'];
    this.randomId = params.randomId;
    this.chatId = params.chatId;
    this.date = params.date;
    this.message = params.message;
    this.file = params.file;
  }
}

/**
 * Represents a decrypted service command message within a secret chat.
 *
 * @remarks
 * Used for background negotiation signals such as typing notifications, read receipt confirmations,
 * self-destruct changes, or encryption key exchanges.
 *
 * @extends TLObject
 * @example
 * ```typescript
 * const serviceMessage = new SecretChatMessageService({
 *   randomId: 1234567890123456789n,
 *   chatId: 42,
 *   date: 1680000000,
 *   message: decryptedMessageService8Instance
 * });
 * ```
 */
export class SecretChatMessageService extends TLObject {
  /**
   * A unique 64-bit identifier chosen by the client to prevent replay attacks.
   */
  randomId!: bigint;

  /**
   * The unique secret chat identifier.
   */
  chatId!: number;

  /**
   * The Unix timestamp indicating when the message was sent.
   */
  date!: number;

  /**
   * The decrypted inner service message payload.
   */
  message!: Raw.DecryptedMessageService8 | Raw.DecryptedMessageService17;

  /**
   * Constructs a new SecretChatMessageService instance.
   *
   * @param params - Initial parameter values.
   */
  constructor(params: {
    randomId: bigint;
    chatId: number;
    date: number;
    message: Raw.DecryptedMessageService8 | Raw.DecryptedMessageService17;
  }) {
    super();
    this.classType = 'modified_types_EncryptedMessageService';
    this.className = 'SecretChatMessageService';
    this.constructorId = 3;
    this.subclassOfId = 0x239f2e51;
    this._slots = ['randomId', 'chatId', 'date', 'message'];
    this.randomId = params.randomId;
    this.chatId = params.chatId;
    this.date = params.date;
    this.message = params.message;
  }
}
