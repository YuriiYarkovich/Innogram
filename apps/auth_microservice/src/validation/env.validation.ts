import '../config/load-env.config';

export function requireEnv(name: string): string {
  const value: string | undefined = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}
