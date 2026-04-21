export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const getToken = (): string | null => localStorage.getItem('token');

export const getUser = (): StoredUser | null => {
  const raw = localStorage.getItem('user');
  return raw ? (JSON.parse(raw) as StoredUser) : null;
};

export const setAuth = (token: string, user: StoredUser): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthed = (): boolean => !!getToken();
