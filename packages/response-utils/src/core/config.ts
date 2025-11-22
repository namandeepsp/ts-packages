import type { PlainObject } from './types';


export type EnvelopeKeys = {
    success?: string;
    message?: string;
    data?: string;
    error?: string;
    meta?: string;
};


export type ResponderConfig = {
    envelopeKeys?: EnvelopeKeys;
    defaultStatus?: number;
    timestamp?: boolean;
    extra?: PlainObject | null;
};


export const defaultConfig: ResponderConfig = {
    envelopeKeys: { success: 'success', message: 'message', data: 'data', error: 'error', meta: 'meta' },
    defaultStatus: 200,
    timestamp: false,
    extra: null
};