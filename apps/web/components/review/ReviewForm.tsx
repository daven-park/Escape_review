'use client';

import type { DifficultyLabel } from '@escape/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, ImagePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { StarRating } from '@/components/review/StarRating';
import { useCreateReview } from '@/hooks/useReviews';
import { getAccessToken } from '@/lib/auth';

const difficultyOptions: Array<{ value: DifficultyLabel; label: string }> = [
  { value: 'EASY', label: '쉬움' },
  { value: 'NORMAL', label: '보통' },
  { value: 'HARD', label: '어려움' },
  { value: 'VERY_HARD', label: '매우 어려움' },
];

const schema = z.object({
  rating: z.number().min(0.5).max(5),
  content: z.string().min(20, '후기를 20자 이상 작성해주세요.').max(2000),
  difficulty: z.enum(['EASY', 'NORMAL', 'HARD', 'VERY_HARD']),
  playedAt: z.string().min(1, '플레이 날짜를 선택해주세요.'),
  spoilerWarning: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface ReviewFormProps {
  themeId: string;
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('이미지를 읽을 수 없습니다.'));
    reader.readAsDataURL(file);
  });
}

export function ReviewForm({ themeId }: ReviewFormProps) {
  const router = useRouter();
  const createReview = useCreateReview(themeId);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: 4,
      content: '',
      difficulty: 'NORMAL',
      playedAt: new Date().toISOString().slice(0, 10),
      spoilerWarning: false,
    },
  });

  useEffect(() => {
    const nextPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  async function onSubmit(values: FormValues) {
    if (!getAccessToken()) {
      router.push('/login');
      return;
    }

    setFormError(null);

    try {
      const uploadedImages = await Promise.all(files.map((file) => toDataUrl(file)));

      await createReview.mutateAsync({
        themeId,
        rating: values.rating,
        content: values.content,
        images: uploadedImages,
        difficulty: values.difficulty,
        playedAt: values.playedAt,
        spoilerWarning: values.spoilerWarning,
      });

      router.push(`/themes/${themeId}`);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '리뷰 등록 중 오류가 발생했습니다.');
    }
  }

  function handleFileChange(nextFiles: FileList | null) {
    if (!nextFiles) {
      return;
    }

    const selected = Array.from(nextFiles).filter((file) => file.type.startsWith('image/'));
    setFiles(selected.slice(0, 5));
  }

  return (
    <form
      onSubmit={form.handleSubmit((values) => {
        void onSubmit(values);
      })}
      className="space-y-6 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft"
    >
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-700">평점 (0.5점 단위)</p>
        <StarRating
          value={form.watch('rating')}
          onChange={(rating) => form.setValue('rating', rating, { shouldValidate: true })}
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-2 block text-sm font-semibold text-ink-700">
          후기 내용
        </label>
        <textarea
          id="content"
          rows={7}
          {...form.register('content')}
          className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm text-ink-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          placeholder="문제 구성, 인테리어, 난이도 체감 등을 자세히 남겨주세요."
        />
        {form.formState.errors.content ? (
          <p className="mt-1 text-xs text-rose-600">{form.formState.errors.content.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="difficulty" className="mb-2 block text-sm font-semibold text-ink-700">
            체감 난이도
          </label>
          <select
            id="difficulty"
            {...form.register('difficulty')}
            className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm text-ink-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="playedAt" className="mb-2 block text-sm font-semibold text-ink-700">
            플레이 날짜
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-ink-400" />
            <input
              id="playedAt"
              type="date"
              {...form.register('playedAt')}
              className="w-full rounded-xl border border-ink-200 py-3 pl-10 pr-4 text-sm text-ink-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink-700">이미지 업로드 (최대 5장)</label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 bg-ink-50 p-6 text-center">
          <ImagePlus className="h-5 w-5 text-ink-500" />
          <span className="text-sm text-ink-600">이미지를 드래그하거나 클릭해서 선택하세요.</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => handleFileChange(event.target.files)}
          />
        </label>

        {previews.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map((preview, index) => (
              <img
                key={`${preview}-${index}`}
                src={preview}
                alt={`선택 이미지 ${index + 1}`}
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        ) : null}
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          {...form.register('spoilerWarning')}
          className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
        />
        스포일러를 포함한 리뷰입니다.
      </label>

      {formError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p> : null}

      <button
        type="submit"
        disabled={createReview.isPending}
        className="inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {createReview.isPending ? '등록 중...' : '리뷰 등록'}
      </button>
    </form>
  );
}
