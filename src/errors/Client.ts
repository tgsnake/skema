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
 * Error thrown when a client request is attempted while the Telegram MTProto client is completely disconnected.
 *
 * @remarks
 * To resolve this error, ensure that `client.connect()` or equivalent initialization routines are run
 * and completed successfully before initiating requests to the Telegram API.
 *
 * @extends BaseError
 */
export class ClientDisconnected extends BaseError {
  override message: string = "Can't send request to telegram when client is unconnected.";
  override description: string =
    'The provided telegram client is unconnected, make sure to start the telegram client first before sending request.';
}

/**
 * Error thrown when the Telegram client completely fails to establish a connection to the data center servers.
 *
 * @remarks
 * This occurs when the network connection retries exceed the user-defined maximum attempt threshold.
 *
 * @extends BaseError
 */
export class ClientFailed extends BaseError {
  override message: string = 'Client failed to connect to server.';
  override description: string =
    'The provided telegram client failed to connect to the telegram data center server. Attempts to connect to the telegram server have exceeded the specified maximum limit.';
}

/**
 * Error thrown when an attempt is made to call connect or start on an already connected Telegram client.
 *
 * @remarks
 * Re-initiating a connection while the socket/channel is already fully active is not permitted.
 *
 * @extends BaseError
 */
export class ClientReady extends BaseError {
  override message: string = 'Client is already connected to server.';
  override description: string =
    'The provided telegram client has been already connected to the telegram data center server.';
}

/**
 * Error thrown when an attempt is made to disconnect or stop an already disconnected Telegram client.
 *
 * @extends BaseError
 */
export class ClientNotReady extends BaseError {
  override message: string = 'Client is already disconnected to server.';
  override description: string =
    'The provided telegram client has been already disconnected to the telegram data center server.';
}

/**
 * Error thrown when the MTProto session authentication key is missing or not provided.
 *
 * @remarks
 * This commonly happens if the client is run in an environment expecting an existing session file
 * or session string, but no authorization parameters or credentials are supplied.
 *
 * @extends BaseError
 */
export class AuthKeyMissing extends BaseError {
  override message: string = 'Auth key unavailable';
  override description: string =
    'Auth key is unavailable, this can happen because at when the client is run, the user does not provide information to login.';
}
