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
 * Base custom error class for all WebSocket communication issues.
 *
 * @extends BaseError
 * @example
 * ```typescript
 * throw new WebSocketError('Connection failed', 'Unable to connect to the WebSocket server');
 * ```
 */
export class WebSocketError extends BaseError {
  /**
   * Constructs a new WebSocketError instance.
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
 * Error thrown when an attempt is made to send a request or receive an update while the WebSocket connection is disconnected.
 *
 * @remarks
 * Ensure the client is fully initialized and that the active socket has connected successfully.
 *
 * @extends WebSocketError
 */
export class Disconnected extends WebSocketError {
  /**
   * Constructs a new Disconnected instance with predefined error messages.
   */
  constructor() {
    super(
      'WebSocket Disconnected',
      "This happen when you trying to send request or receive update from websocket server hut the websocket client is doesn't ready. Make sure the websocket client is connected to server.",
    );
  }
}

/**
 * Error thrown when the active WebSocket connection is closed unexpectedly while a read operation is in progress.
 *
 * @remarks
 * This commonly happens due to abrupt physical network drops, heartbeat losses, or the server closing the channel.
 *
 * @extends WebSocketError
 */
export class ReadClosed extends WebSocketError {
  /**
   * Constructs a new ReadClosed instance with predefined error messages.
   */
  constructor() {
    super(
      'WebSocket connection closed when reading data',
      'This happen when suddenly the connection between the websocket client and the server is lost when fetching data updates from the server.',
    );
  }
}

/**
 * Error thrown when an attempt is made to use a WebSocket proxy configuration that is unsupported by the framework.
 *
 * @remarks
 * Browsers or proxy modes may not be fully supported inside certain modular runtime setups.
 *
 * @extends WebSocketError
 */
export class ProxyUnsupported extends WebSocketError {
  /**
   * Constructs a new ProxyUnsupported instance with predefined error messages.
   */
  constructor() {
    super(
      'WebSocket proxy unsupported',
      'This is because browser telegram or websocket proxy are not supported by the framework at this time.',
    );
  }
}
