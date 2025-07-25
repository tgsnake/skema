/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2025 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

/***********************************************************
 *                         Warning!!                        *
 *               This file is auto generate.                *
 *         All change made in this file will be lost!       *
 ***********************************************************/
import { RPCError } from '@/errors/RpcError.js';

export class SeeOther extends RPCError {
  override code: number = 303;
  override name: string = 'SEE_OTHER';
}
export class FileMigrate extends SeeOther {
  override id: string = 'FILE_MIGRATE_X';
  override message: string = 'The file to be accessed is currently stored in DC{value}';
}
export class NetworkMigrate extends SeeOther {
  override id: string = 'NETWORK_MIGRATE_X';
  override message: string =
    'Your IP address is associated to DC {value}, please re-send the query to that DC.';
}
export class PhoneMigrate extends SeeOther {
  override id: string = 'PHONE_MIGRATE_X';
  override message: string =
    'Your phone number is associated to DC {value}, please re-send the query to that DC.';
}
export class StatsMigrate extends SeeOther {
  override id: string = 'STATS_MIGRATE_X';
  override message: string =
    'Channel statistics for the specified channel are stored on DC {value}, please re-send the query to that DC.';
}
export class UserMigrate extends SeeOther {
  override id: string = 'USER_MIGRATE_X';
  override message: string =
    'Your account is associated to DC {value}, please re-send the query to that DC.';
}
