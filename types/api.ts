// Handy unions for server actions / API responses

export type ApiOk<
  T extends Record<string, unknown> = Record<string, never>
> = { ok: true } & T;
export type ApiError = { error: string };
export type ApiResult<
  T extends Record<string, unknown> = Record<string, never>
> = ApiOk<T> | ApiError;

// Example specializations:
export type CreateEntityResult<ID extends string = string> = ApiResult<{ id: ID }>;
