/**
 * Auth service — disabled stub (no backend).
 *
 * The app browses the public REST API without signing users in. These functions
 * exist so the auth screens still compile/render, but they don't authenticate.
 * Replace with a real provider here to re-enable sign-in.
 */
const DISABLED = 'Sign-in is currently disabled in this build.';

export function friendlyAuthError(message?: string): string {
  return message || 'Something went wrong. Please try again.';
}

export async function signInWithEmail(_email: string, _password: string): Promise<never> {
  throw new Error(DISABLED);
}

export async function signUpWithEmail(
  _name: string,
  _email: string,
  _password: string,
): Promise<never> {
  throw new Error(DISABLED);
}

export async function sendPasswordReset(_email: string): Promise<void> {
  throw new Error(DISABLED);
}

export async function signOut(): Promise<void> {
  // no-op
}

export async function signInWithGoogle(): Promise<null> {
  throw new Error(DISABLED);
}
