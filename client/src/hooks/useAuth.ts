import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { gqlClient } from '@/lib/graphql';
import { setAuth } from '@/store/auth';
import type { AuthPayload } from '@/lib/types';

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id name email role }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user { id name email role }
    }
  }
`;

export function useLogin() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (vars: { email: string; password: string }) =>
      gqlClient.request<{ login: AuthPayload }>(LOGIN_MUTATION, vars).then((d) => d.login),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate('/');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (vars: { name: string; email: string; password: string }) =>
      gqlClient.request<{ register: AuthPayload }>(REGISTER_MUTATION, vars).then((d) => d.register),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate('/');
    },
  });
}
