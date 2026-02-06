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
 * Represents an error that occurs during WebSocket operations.
 * Extends the {@link BaseError} class to provide additional context for WebSocket-related errors.
 *
 * @extends BaseError
 * @example
 * throw new WebSocketError('Connection failed', 'Unable to connect to the WebSocket server');
 */
export class WebSocketError extends BaseError {
  constructor(message: string, description?: string) {
    super();
    this.message = message;
    this.description = description;
  }
}

/**
 * Represents an error that occurs when attempting to send a request or receive an update
 * from a WebSocket server while the WebSocket client is not ready.
 *
 * @extends WebSocketError
 */
export class Disconnected extends WebSocketError {
  constructor() {
    super(
      'WebSocket Disconnected',
      "This happen when you trying to send request or receive update from websocket server hut the websocket client is doesn't ready. Make sure the websocket client is connected to server.",
    );
  }
}
/**
 * Error thrown when attempting to read data from a WebSocket connection that has been closed.
 *
 * This error typically occurs when the connection between the WebSocket client and server
 * is unexpectedly lost while fetching data updates from the server.
 *
 * @extends WebSocketError
 */
export class ReadClosed extends WebSocketError {
  constructor() {
    super(
      'WebSocket connection closed when reading data',
      'This happen when suddenly the connection between the websocket client and the server is lost when fetching data updates from the server.',
    );
  }
}
/**
 * Error thrown when a WebSocket proxy is not supported by the framework.
 *
 * @remarks
 * This error indicates that either browser-based Telegram or WebSocket proxies are not currently supported.
 *
 * @extends WebSocketError
 */
export class ProxyUnsupported extends WebSocketError {
  constructor() {
    super(
      'WebSocket proxy unsupported',
      'This is because browser telegram or websocket proxy are not supported by the framework at this time.',
    );
  }
}
