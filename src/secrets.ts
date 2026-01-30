export type SecretString = string;

// Minimal interface for Secrets Store binding.
// In Workers, a Secrets Store binding exposes an async `get()` method.
export interface SecretsStoreSecret {
  get(): Promise<string>;
}

export function isSecretsStoreSecret(v: unknown): v is SecretsStoreSecret {
  return !!v && typeof v === 'object' && typeof (v as any).get === 'function';
}

/**
 * Resolve either a plain string secret or a Secrets Store binding into a string.
 */
export async function resolveSecret(v: unknown): Promise<string | undefined> {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  if (isSecretsStoreSecret(v)) return await v.get();
  return undefined;
}
