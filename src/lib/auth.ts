import { apiFetch } from '@/lib/apiFetch';
import { regenerateCartToken, resetCartTokenCache } from '@/lib/cart/getCartToken';
import { apiRequest } from '@/lib/http';

// Centralized auth change event helper
export const AUTH_EVENT = 'auth:changed' as const;
export type AuthAction =
  | 'login'
  | 'logout'
  | 'refresh'
  | 'profile'
  | 'password'
  | 'avatar'
  | 'revokeToken'
  | 'revokeOtherTokens';

function emitAuthChanged(action: AuthAction) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(AUTH_EVENT, { detail: { action, ts: Date.now() } })
  );
}

type LoginPayload = { email: string; password: string };

type RegisterPayload = { 
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  birth_date: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
};

export async function login(payload: LoginPayload) {
  const json = await apiRequest<unknown>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  // Refresh cart token after successful login
  try {
    await regenerateCartToken();
  } catch {
    // ignore token refresh failure
  }
  // Notify listeners (e.g., header) that auth changed
  emitAuthChanged('login');
  return json;
}

export async function register(payload: RegisterPayload) {
  return apiRequest<unknown>('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
}

export async function logout() {
  try {
    await apiFetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      credentials: 'include',
    });
  } catch {
    // ignore
  }
  // After logout, drop any cached cart token and generate guest token
  try {
    resetCartTokenCache({ clearCookie: true });
    await regenerateCartToken();
  } catch {
    // ignore token refresh failure
  }
  emitAuthChanged('logout');
}

// Optionally supply a Bearer token to avoid relying on HttpOnly cookies.
// When token is provided, we send Authorization and do not include credentials.
export async function me() {
  return apiRequest<unknown>('/api/auth/me', {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
}

// --- New helpers for extended auth flows ---

export async function refresh() {
  const json = await apiRequest<unknown>('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  emitAuthChanged('refresh');
  return json;
}

type UpdateProfilePayload = {
  name: string;
};

export async function updateProfile(payload: UpdateProfilePayload) {
  const json = await apiRequest<unknown>('/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  emitAuthChanged('profile');
  return json;
}

type ChangePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export async function changePassword(payload: ChangePasswordPayload) {
  const json = await apiRequest<unknown>('/api/auth/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  emitAuthChanged('password');
  return json;
}

export async function updateAvatar(file: File) {
  const form = new FormData();
  form.append('avatar', file);
  const json = await apiRequest<unknown>('/api/auth/avatar', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: form,
    credentials: 'include',
  });

  emitAuthChanged('avatar');
  return json;
}

export async function listTokens() {
  return apiRequest<unknown>('/api/auth/tokens', {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
}

export async function revokeToken(id: string | number) {
  const json = await apiRequest<unknown>(`/api/auth/tokens/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });

  emitAuthChanged('revokeToken');
  return json;
}

export async function revokeOtherTokens() {
  const json = await apiRequest<unknown>('/api/auth/tokens/revoke-others', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });

  emitAuthChanged('revokeOtherTokens');
  return json;
}

// --- Forgot / Reset password ---

type ForgotPasswordPayload = {
  email: string;
};

export async function forgotPassword(payload: ForgotPasswordPayload) {
  return apiRequest<unknown>('/api/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
}

type ResetPasswordPayload = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export async function resetPassword(payload: ResetPasswordPayload) {
  return apiRequest<unknown>('/api/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
}

// --- Email & Phone change flows ---

type RequestEmailChangePayload = {
  new_email: string;
  method?: 'magic_link' | 'otp';
};

type ChangeRequestData = {
  type: 'email' | 'phone';
  method: 'magic_link' | 'otp';
  rid: number;
  token_expires_at?: string;
  otp_expires_at?: string;
  expires_in: number;
  delivery: string;
};

export type ChangeRequestResponse = {
  status: 'success';
  message: string;
  data: ChangeRequestData;
};

export async function requestEmailChange(payload: RequestEmailChangePayload) {
  return apiRequest<ChangeRequestResponse>('/api/auth/email/change/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
}

type VerifyEmailMagicPayload = {
  id: number;
  token: string;
};

export async function verifyEmailChangeMagic(payload: VerifyEmailMagicPayload) {
  const json = await apiRequest<unknown>('/api/auth/email/change/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  emitAuthChanged('profile');
  return json;
}

type VerifyOtpPayload = { otp: string };

export async function verifyEmailChangeOtp(payload: VerifyOtpPayload) {
  const json = await apiRequest<unknown>('/api/auth/email/change/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  emitAuthChanged('profile');
  return json;
}

type RequestPhoneChangePayload = { new_phone: string };

export async function requestPhoneChange(payload: RequestPhoneChangePayload) {
  return apiRequest<ChangeRequestResponse>('/api/auth/phone/change/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
}

export async function verifyPhoneChangeOtp(payload: VerifyOtpPayload) {
  const json = await apiRequest<unknown>('/api/auth/phone/change/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  emitAuthChanged('profile');
  return json;
}

type VerifyPhoneMagicPayload = { id: number; token: string };

export async function verifyPhoneChangeMagic(payload: VerifyPhoneMagicPayload) {
  const json = await apiRequest<unknown>('/api/auth/phone/change/verify-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  emitAuthChanged('profile');
  return json;
}
