'use client';

import type { User } from '@escape/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Chrome } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { api } from '@/lib/api';
import { setSession } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const schema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
});

type FormValues = z.infer<typeof schema>;

interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);

    try {
      const response = await api.post<AuthResponse>('/auth/login', values);
      setSession(response);
      router.push('/explore');
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '로그인에 실패했습니다.');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
        <h1 className="text-2xl font-bold text-ink-900">로그인</h1>
        <p className="mt-1 text-sm text-ink-500">이메일 계정 또는 Google 계정으로 로그인하세요.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={form.handleSubmit((values) => {
            void onSubmit(values);
          })}
        >
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
              placeholder="********"
            />
            {form.formState.errors.password ? (
              <p className="mt-1 text-xs text-rose-600">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {form.formState.isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <a
          href={`${API_BASE}/auth/google`}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition hover:border-ink-300 hover:bg-ink-50"
        >
          <Chrome className="h-4 w-4" />
          Google로 로그인
        </a>

        <p className="mt-5 text-center text-sm text-ink-500">
          계정이 없나요?{' '}
          <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800">
            회원가입
          </Link>
        </p>
      </section>
    </main>
  );
}
