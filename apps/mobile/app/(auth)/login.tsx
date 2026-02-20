import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { useAuth } from '../../hooks/useAuth';
import { toErrorMessage } from '../../lib/utils';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { loginMutation } = useAuth();

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaWrapper className="bg-white">
      <View className="flex-1 px-5 pt-8">
        <Text className="text-3xl font-bold text-slate-900">환영합니다</Text>
        <Text className="mt-2 text-sm text-slate-500">이메일로 로그인하고 예약/후기를 확인하세요.</Text>

        <Text className="mb-2 mt-8 text-sm font-semibold text-slate-700">이메일</Text>
        <Controller
          control={control}
          name="email"
          rules={{ required: true }}
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              autoCapitalize="none"
              keyboardType="email-address"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              placeholder="you@example.com"
            />
          )}
        />

        <Text className="mb-2 mt-5 text-sm font-semibold text-slate-700">비밀번호</Text>
        <Controller
          control={control}
          name="password"
          rules={{ required: true }}
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              placeholder="비밀번호"
            />
          )}
        />

        {loginMutation.isError ? (
          <Text className="mt-3 text-sm text-red-600">{toErrorMessage(loginMutation.error)}</Text>
        ) : null}

        <Pressable
          className={`mt-7 rounded-xl px-4 py-4 ${loginMutation.isPending ? 'bg-slate-400' : 'bg-brand-600'}`}
          disabled={loginMutation.isPending}
          onPress={handleSubmit((values) => void onSubmit(values))}
        >
          <Text className="text-center text-base font-semibold text-white">
            {loginMutation.isPending ? '로그인 중...' : '로그인'}
          </Text>
        </Pressable>

        <Pressable className="mt-4 self-center" onPress={() => router.push('/(auth)/register')}>
          <Text className="text-sm text-brand-600">계정이 없나요? 회원가입</Text>
        </Pressable>
      </View>
    </SafeAreaWrapper>
  );
}
