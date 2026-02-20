import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ApiResponse, apiClient } from '../lib/api';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../lib/auth';
import { useAuthStore } from '../store/authStore';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  name: string;
}

interface AuthResponseData {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken?: string;
}

async function requestLogin(payload: LoginPayload): Promise<AuthResponseData> {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
  return response.data.data;
}

async function requestRegister(payload: RegisterPayload): Promise<AuthResponseData> {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
  return response.data.data;
}

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isHydrated,
    setAuth,
    clearAuth,
    setHydrated,
  } = useAuthStore();

  useEffect(() => {
    if (isHydrated) {
      return;
    }

    const hydrate = async () => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();
      if (!accessToken) {
        setHydrated(true);
        return;
      }

      setAuth({
        user: {
          id: 'local-user',
          email: '',
          name: '사용자',
        },
        accessToken,
        refreshToken: refreshToken ?? undefined,
      });
      setHydrated(true);
    };

    void hydrate();
  }, [isHydrated, setAuth, setHydrated]);

  const loginMutation = useMutation({
    mutationFn: requestLogin,
    onSuccess: async (result) => {
      await saveTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      setAuth({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: requestRegister,
    onSuccess: async (result) => {
      await saveTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      setAuth({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    },
  });

  const logout = async () => {
    await clearTokens();
    clearAuth();
  };

  return {
    user,
    isAuthenticated,
    isHydrated,
    loginMutation,
    registerMutation,
    logout,
  };
}

export type { LoginPayload, RegisterPayload };
