'use client';

import type { User } from '@escape/types';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { api } from '@/lib/api';
import { setSession } from '@/lib/auth';

const schema = z
  .object({
    name: z.string().min(2, '이름은 2자 이상이어야 합니다.').max(50),
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    confirmPassword: z.string().min(8, '비밀번호를 확인해주세요.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);

    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      setSession(response);
      router.push('/explore');
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '회원가입에 실패했습니다.');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
        <h1 className="text-2xl font-bold text-ink-900">회원가입</h1>
        <p className="mt-1 text-sm text-ink-500">Escape Review 계정을 생성하세요.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={form.handleSubmit((values) => {
            void onSubmit(values);
          })}
        >
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-ink-700">
              이름
            </label>
            <input
              id="name"
              type="text"
              {...form.register('name')}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="홍길동"
            />
            {form.formState.errors.name ? (
              <p className="mt-1 text-xs text-rose-600">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-ink-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              {...form.register('email')}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="you@example.com"
            />
            {form.formState.errors.email ? (
              <p className="mt-1 text-xs text-rose-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-ink-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              {...form.register('password')}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            {form.formState.errors.password ? (
              <p className="mt-1 text-xs text-rose-600">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-ink-700">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...form.register('confirmPassword')}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            {form.formState.errors.confirmPassword ? (
              <p className="mt-1 text-xs text-rose-600">{form.formState.errors.confirmPassword.message}</p>
            ) : null}
          </div>

          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {form.formState.isSubmitting ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          이미 계정이 있나요?{' '}
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            로그인
          </Link>
        </p>
      </section>
    </main>
  );
}
