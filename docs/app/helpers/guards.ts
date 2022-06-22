export const isStringGuard = (value: unknown): value is string =>
  typeof value === 'string'
