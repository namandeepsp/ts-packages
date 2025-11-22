export type PlainObject = Record<string, unknown>;


export type ErrorShape = {
    code?: string;
    message: string;
    details?: unknown;
};


export type ResponseEnvelope<T = unknown, M = PlainObject> = {
    success: boolean;
    message?: string;
    data?: T;
    error?: ErrorShape | null;
    meta?: M | null;
};


export type TransportResult = { status: number; body: unknown };


export type Sender = (status: number, body: unknown) => Promise<any> | any;

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    offset?: number;
    links?: {
        next?: string;
        prev?: string;
        self: string;
    };
}