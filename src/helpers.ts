/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { bigInt, Buffer } from './deps.js';
// https://github.com/gram-js/gramjs/blob/b99879464cd1114d89b333c5d929610780c4b003/gramjs/Helpers.ts#L13

/**
 * Converts a JS native `bigint` value into a Node.js `Buffer` with custom byte-padding, endianness, and sign representation.
 *
 * @remarks
 * This utility handles both signed and unsigned numeric translations.
 * For signed negative bigints, it computes the manual two's complement transformation
 * in either little-endian or big-endian formats to match Telegram MTProto specifications.
 *
 * @param int - The bigint value to serialize into the buffer.
 * @param padding - The absolute target size of the output buffer in bytes.
 * @param litte - Set to `true` for little-endian encoding; set to `false` for big-endian. Defaults to `true`.
 * @param signed - Set to `true` to allow signed integers and two's complement representation. Defaults to `false`.
 * @returns A new `Buffer` representation of the bigint value.
 *
 * @throws {Error} If the bigint requires more bytes to represent than the specified padding size.
 * @throws {Error} If the bigint is negative and `signed` is set to `false`.
 *
 * @example
 * ```typescript
 * // Unsigned little-endian 4-byte padding
 * const buf = bigintToBuffer(BigInt(42), 4, true, false);
 * ```
 */
export function bigintToBuffer(
  int: bigint,
  padding: number,
  litte: boolean = true,
  signed: boolean = false,
): Buffer {
  const bigintLength = int.toString(2).length;
  const bytes = Math.ceil(bigintLength / 8);
  if (padding < bytes) {
    throw new Error("Too big, Can't convert it to buffer with that padding.");
  }
  if (!signed && int < BigInt(0)) {
    throw new Error('Too small, can convert it when unsigned.');
  }
  let isBellow = false;
  if (int < BigInt(0)) {
    isBellow = true;
    int = int * BigInt(-1);
  }
  const hex = int.toString(16).padStart(padding * 2, '0');
  let buffer = Buffer.from(hex, 'hex');
  if (litte) buffer = buffer.reverse();
  if (isBellow && signed) {
    if (litte) {
      let isReminder = false;
      if ((buffer as unknown as Uint8Array)[0]) (buffer as unknown as Uint8Array)[0] -= 1;
      for (let b = 0; b < Buffer.byteLength(buffer); b++) {
        if (!(buffer as unknown as Uint8Array)[b]) {
          isReminder = true;
          continue;
        }
        if (isReminder) {
          (buffer as unknown as Uint8Array)[b] -= 1;
          isReminder = false;
        }
        (buffer as unknown as Uint8Array)[b] = 255 - (buffer as unknown as Uint8Array)[b];
      }
    } else {
      (buffer as unknown as Uint8Array)[Buffer.byteLength(buffer) - 1] =
        256 - (buffer as unknown as Uint8Array)[Buffer.byteLength(buffer) - 1];
      for (let b = 0; b < Buffer.byteLength(buffer); b++) {
        (buffer as unknown as Uint8Array)[b] = 255 - (buffer as unknown as Uint8Array)[b];
      }
    }
  }
  return buffer;
}

/**
 * Computes base-`x` raised to exponent-`y`, with an optional modular reduction `z`.
 *
 * @remarks
 * Uses an efficient binary exponentiation algorithm (square-and-multiply) to handle
 * extremely large values of `x`, `y`, and `z` securely without precision loss.
 *
 * @param x - The base bigint value.
 * @param y - The exponent bigint value (must be non-negative if modulus is specified).
 * @param z - Optional modulus bigint value.
 * @returns If `z` is not defined: `x ** y`. If `z` is defined: `(x ** y) % z`.
 *
 * @example
 * ```typescript
 * const result = bigIntPow(BigInt(5), BigInt(3), BigInt(7)); // (5 ** 3) % 7 = 6
 * ```
 */
export function bigIntPow(x: bigint, y: bigint, z?: bigint): bigint {
  if (z === undefined) {
    return x ** y;
  } else {
    let result = BigInt(1);
    while (y > BigInt(0)) {
      if (bigIntMod(y, BigInt(2)) === BigInt(1)) {
        result = bigIntMod(result * x, z);
      }
      y = y >> BigInt(1);
      x = bigIntMod(x * x, z);
    }
    return result;
  }
}
// https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
/**
 * Computes the true mathematical modulo of two JS standard `number`s, ensuring a non-negative result.
 *
 * @remarks
 * In standard JavaScript, the `%` operator computes the remainder, which can result in a negative
 * number if the dividend `n` is negative. This helper function corrects that behavior to return
 * a mathematically sound positive modulo in the range `[0, m)`.
 *
 * @param n - The dividend.
 * @param m - The divisor (must be a positive, non-zero number).
 * @returns The positive remainder representing `n mod m`.
 *
 * @example
 * ```typescript
 * mod(5, 3);   // returns 2
 * mod(-1, 3);  // returns 2 (whereas -1 % 3 returns -1)
 * ```
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}
/**
 * Computes the true mathematical modulo of two `bigint` values, ensuring a non-negative result.
 *
 * @remarks
 * Similar to {@link mod}, this function implements correct mathematical modulo for large bigints
 * so that any negative dividend `n` resolves into a positive remainder modulo `m`.
 *
 * @param n - The bigint dividend.
 * @param m - The bigint divisor.
 * @returns The positive bigint remainder representing `n mod m`.
 *
 * @example
 * ```typescript
 * bigIntMod(BigInt(-5), BigInt(3)); // returns 1n
 * ```
 */
export function bigIntMod(n: bigint, m: bigint): bigint {
  return ((n % m) + m) % m;
}
/**
 * Decodes a Node.js `Buffer` back into a JS native `BigInt` value.
 *
 * @param buffer - The source Buffer containing binary representation of the integer.
 * @param little - Set to `true` if the buffer is encoded in little-endian format; set to `false` if big-endian. Defaults to `true`.
 * @param signed - Set to `true` if the buffer contains a signed two's complement integer. Defaults to `false`.
 * @returns A standard native `bigint` value decoded from the bytes.
 *
 * @example
 * ```typescript
 * const val = bufferToBigint(Buffer.from([0x2a, 0x00]), true, false); // 42n
 * ```
 */
export function bufferToBigint(
  buffer: Buffer,
  little: boolean = true,
  signed: boolean = false,
): bigint {
  const length = Buffer.byteLength(buffer);
  const value = little ? buffer.reverse().toString('hex') : buffer.toString('hex');
  const _bigint = bigInt(value, 16);
  let bigint = BigInt(String(_bigint));
  if (signed && Math.floor(bigint.toString(2).length / 8) >= length) {
    bigint = bigint - bigIntPow(BigInt(2), BigInt(length * 8));
  }
  return BigInt(bigint);
}
