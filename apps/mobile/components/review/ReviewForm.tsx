import { Controller, useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { DifficultyLabel, ReviewFormInput } from '../../hooks/useReviews';
import { StarRating } from './StarRating';

const difficulties: DifficultyLabel[] = ['EASY', 'NORMAL', 'HARD', 'VERY_HARD'];

interface ReviewFormProps {
  defaultValues?: Partial<ReviewFormInput>;
  onSubmit: (values: ReviewFormInput) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function ReviewForm({ defaultValues, onSubmit, isSubmitting = false }: ReviewFormProps) {
  const { control, setValue, watch, handleSubmit } = useForm<ReviewFormInput>({
    defaultValues: {
      rating: defaultValues?.rating ?? 5,
      content: defaultValues?.content ?? '',
      images: defaultValues?.images ?? [],
      difficulty: defaultValues?.difficulty ?? 'NORMAL',
      playedAt: defaultValues?.playedAt ?? new Date().toISOString().slice(0, 10),
      spoilerWarning: defaultValues?.spoilerWarning ?? false,
    },
  });

  const images = watch('images') ?? [];
  const currentDifficulty = watch('difficulty');
  const spoilerWarning = watch('spoilerWarning');

  const onPickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (result.canceled) {
      return;
    }

    const selected = result.assets.map((asset) => asset.uri);
    setValue('images', [...images, ...selected], { shouldDirty: true });
  };

  return (
    <ScrollView className="flex-1 px-4 py-4">
      <Text className="mb-2 text-sm font-semibold text-slate-800">평점</Text>
      <Controller
        control={control}
        name="rating"
        render={({ field }) => <StarRating value={field.value} onChange={field.onChange} size={30} />}
      />

      <Text className="mb-2 mt-5 text-sm font-semibold text-slate-800">난이도 체감</Text>
      <View className="mb-3 flex-row flex-wrap gap-2">
        {difficulties.map((value) => {
          const active = currentDifficulty === value;
          return (
            <Pressable
              key={value}
              className={`rounded-full px-4 py-2 ${active ? 'bg-brand-600' : 'bg-slate-200'}`}
              onPress={() => setValue('difficulty', value, { shouldDirty: true })}
            >
              <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-slate-700'}`}>
                {value}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mb-2 text-sm font-semibold text-slate-800">플레이 날짜 (YYYY-MM-DD)</Text>
      <Controller
        control={control}
        name="playedAt"
        rules={{ required: true }}
        render={({ field }) => (
          <TextInput
            value={field.value}
            onChangeText={field.onChange}
            className="mb-4 rounded-xl border border-slate-300 bg-white px-4 py-3"
            placeholder="2026-02-20"
          />
        )}
      />

      <Text className="mb-2 text-sm font-semibold text-slate-800">리뷰 내용</Text>
      <Controller
        control={control}
        name="content"
        rules={{ required: true, minLength: 10 }}
        render={({ field }) => (
          <TextInput
            multiline
            value={field.value}
            onChangeText={field.onChange}
            className="min-h-[120px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800"
            placeholder="테마의 장단점과 난이도 체감을 적어주세요."
            textAlignVertical="top"
          />
        )}
      />

      <View className="mb-4 mt-4 flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
        <Text className="text-sm text-slate-700">스포일러 포함</Text>
        <Switch
          value={spoilerWarning}
          onValueChange={(value) => setValue('spoilerWarning', value, { shouldDirty: true })}
        />
      </View>

      <Pressable className="mb-3 rounded-xl bg-slate-800 px-4 py-3" onPress={onPickImage}>
        <Text className="text-center font-semibold text-white">사진 추가</Text>
      </Pressable>

      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
          <View className="flex-row gap-2">
            {images.map((uri) => (
              <Image key={uri} source={{ uri }} contentFit="cover" style={{ width: 100, height: 100, borderRadius: 10 }} />
            ))}
          </View>
        </ScrollView>
      ) : null}

      <Pressable
        className={`rounded-xl px-4 py-4 ${isSubmitting ? 'bg-slate-400' : 'bg-brand-600'}`}
        onPress={handleSubmit((values) => void onSubmit(values))}
        disabled={isSubmitting}
      >
        <Text className="text-center text-base font-semibold text-white">
          {isSubmitting ? '저장 중...' : '리뷰 저장'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
