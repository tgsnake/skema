/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2025 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { bigInt, Buffer } from '@/deps.js';
// https://github.com/gram-js/gramjs/blob/b99879464cd1114d89b333c5d929610780c4b003/gramjs/Helpers.ts#L13

/**
 * Converts a bigint value to a Buffer with specified padding, endianness, and signedness.
 *
 * @param int - The bigint value to convert.
 * @param padding - The number of bytes to pad the buffer to. Must be at least the minimum required to represent the value.
 * @param litte - If true, the buffer will be in little-endian order; if false, big-endian. Defaults to true.
 * @param signed - If true, the value is treated as signed and two's complement is used for negative numbers. Defaults to false.
 * @returns A Buffer representing the bigint value with the specified options.
 * @throws {Error} If the value cannot fit in the specified padding or if an unsigned conversion is attempted with a negative value.
 */
export function bigintToBuffer(
  int: bigint,
  padding: number,
  litte: boolean = true,
  signed: boolean = false,
) {
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
 * Computes the exponentiation of two big integers, with optional modular reduction.
 *
 * If the modulus `z` is not provided, returns `x` raised to the power of `y` (`x ** y`).
 * If the modulus `z` is provided, computes `(x ** y) % z` efficiently using modular exponentiation.
 *
 * @param x - The base as a bigint.
 * @param y - The exponent as a bigint.
 * @param z - (Optional) The modulus as a bigint. If provided, the result is computed modulo `z`.
 * @returns The result of `x ** y` if `z` is undefined, otherwise `(x ** y) % z`.
 */
export function bigIntPow(x: bigint, y: bigint, z?: bigint) {
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
 * Computes the true modulo of a number, ensuring a non-negative result.
 *
 * This function returns the remainder of the division of `n` by `m`,
 * always yielding a result in the range `[0, m)`, even if `n` is negative.
 *
 * @param n - The dividend.
 * @param m - The divisor (must be a non-zero integer).
 * @returns The non-negative remainder after dividing `n` by `m`.
 *
 * @example
 * mod(5, 3); // returns 2
 * mod(-1, 3); // returns 2
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}
/**
 * Computes the modulus of two bigint values, ensuring a non-negative result.
 *
 * This function returns the result of `n mod m`, always as a non-negative bigint,
 * even if `n` is negative. This is useful for mathematical operations where
 * a positive modulus is required.
 *
 * @param n - The dividend as a bigint.
 * @param m - The divisor as a bigint.
 * @returns The non-negative remainder of `n` divided by `m`.
 */
export function bigIntMod(n: bigint, m: bigint): bigint {
  return ((n % m) + m) % m;
}
/**
 * Converts a Buffer to a BigInt value.
 *
 * @param buffer - The buffer to convert.
 * @param little - If true, interprets the buffer as little-endian. Defaults to true.
 * @param signed - If true, interprets the buffer as a signed integer. Defaults to false.
 * @returns The BigInt representation of the buffer.
 */
export function bufferToBigint(buffer: Buffer, little: boolean = true, signed: boolean = false) {
  const length = Buffer.byteLength(buffer);
  const value = little ? buffer.reverse().toString('hex') : buffer.toString('hex');
  const _bigint = bigInt(value, 16);
  let bigint = BigInt(String(_bigint));
  if (signed && Math.floor(bigint.toString(2).length / 8) >= length) {
    bigint = bigint - bigIntPow(BigInt(2), BigInt(length * 8));
  }
  return BigInt(bigint);
}
