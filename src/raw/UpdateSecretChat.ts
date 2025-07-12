/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2025 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { Raw } from '@/raw/Raw.js';
import { TLObject } from '@/raw/core/TLObject.js';

/**
 * Interface representing a generator for decrypting encrypted messages.
 *
 * @interface TypeTGenerate
 */
export interface TypeTGenerate {
  /**
   * Decrypts an encrypted message and returns the decrypted message.
   *
   * @param message - The encrypted message to decrypt.
   * @returns A promise that resolves to the decrypted message.
   */
  decrypt: (message: Raw.TypeEncryptedMessage) => Promise<Raw.TypeDecryptedMessage>;
}
/**
 * Represents an update for a secret chat message, wrapping the decrypted message and related metadata.
 *
 * This class is used to handle updates for new encrypted messages in secret chats, providing access to the decrypted message, the QTS (queue timestamp), and the original raw update object.
 * Modified class of UpdateNewEncryptedMessage. The update object should be left as received but should be decrypted already. Therefore this modification was made to facilitate management so there is no need to manually decrypt.
 *
 * @remarks
 * - The `message` property can be either a `SecretChatMessage` or a `SecretChatMessageService`.
 * - The static `generate` method handles decryption and instantiation based on the type of the raw message.
 *
 * @example
 * ```typescript
 * const update = await UpdateSecretChatMessage.generate(rawUpdate, secretChatInstance);
 * console.log(update.message);
 * ```
 *
 * @property message - The decrypted secret chat message or service message.
 * @property qts - The queue timestamp associated with the update.
 * @property original - The original raw update object.
 */
export class UpdateSecretChatMessage extends TLObject {
  message!: SecretChatMessage | SecretChatMessageService;
  qts!: number;
  _original!: Raw.UpdateNewEncryptedMessage;
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
   * Generates an `UpdateSecretChatMessage` instance by decrypting the provided encrypted message
   * using the given secret chat context.
   *
   * Depending on the type of the encrypted message (`EncryptedMessageService` or not),
   * this method constructs the appropriate secret chat message object.
   *
   * @typeParam T - The type of the secret chat context, which must implement a `decrypt` method.
   * @param update - The raw update containing the new encrypted message.
   * @param secretChat - The secret chat context used to decrypt the message.
   * @returns A promise that resolves to an `UpdateSecretChatMessage` containing the decrypted message.
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
   * Gets the original raw encrypted message associated with this update.
   *
   * @returns The original `Raw.UpdateNewEncryptedMessage` object.
   */
  get original(): Raw.UpdateNewEncryptedMessage {
    return this._original;
  }
}
/**
 * Represents a secret chat message with encrypted content.
 *
 * @remarks
 * This class extends `TLObject` and is used to encapsulate the details of a message
 * in a secret chat, including its unique identifier, chat context, timestamp, message
 * content, and associated encrypted file.
 *
 * @property randomId - A unique identifier for the message, represented as a bigint.
 * @property chatId - The identifier of the chat where the message was sent.
 * @property date - The Unix timestamp indicating when the message was sent.
 * @property message - The decrypted message content, which can be one of several types.
 * @property file - The encrypted file associated with the message.
 *
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
  randomId!: bigint;
  chatId!: number;
  date!: number;
  message!:
    | Raw.DecryptedMessage8
    | Raw.DecryptedMessage17
    | Raw.DecryptedMessage45
    | Raw.DecryptedMessage73;
  file!: Raw.TypeEncryptedFile;
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
 * Represents a service message in a secret chat.
 *
 * This class extends `TLObject` and encapsulates the properties and behavior
 * of a service message exchanged within a secret chat context.
 *
 * @remarks
 * - The `message` property can be either a `Raw.DecryptedMessageService8` or `Raw.DecryptedMessageService17`.
 * - The class sets several internal properties such as `classType`, `className`, `constructorId`, and `subclassOfId`
 *   for serialization and type identification purposes.
 *
 * @property randomId - Unique identifier for the message, represented as a bigint.
 * @property chatId - Identifier of the secret chat.
 * @property date - Unix timestamp of when the message was sent.
 * @property message - The decrypted service message payload.
 *
 *
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
  randomId!: bigint;
  chatId!: number;
  date!: number;
  message!: Raw.DecryptedMessageService8 | Raw.DecryptedMessageService17;
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
