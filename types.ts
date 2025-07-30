/*
 * BroadcasteR.ts - Type Definitions
 */

import { Request } from 'express';

export interface Instance {
  id: string;
  url?: string;
  page_title: string;
  page_name?: string;
  twitch_channel: string;
  delay_ms?: number;
}

export interface GSISnapshot {
  ts: number;
  data: any;
}

export interface AuthRequest extends Request {
  body: {
    auth?: {
      token?: string;
    };
    [key: string]: any;
  };
}
