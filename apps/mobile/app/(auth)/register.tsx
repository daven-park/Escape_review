import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { useAuth } from '../../hooks/useAuth';
import { toErrorMessage } from '../../lib/utils';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const { control, handleSubmit, watch } = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const { registerMutation } = useAuth();

  const onSubmit = async (values: RegisterFormValues) => {
    await registerMutation.mutateAsync({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaWrapper className="bg-white">
      <View className="flex-1 px-5 pt-8">
        <Text className="text-3xl font-bold text-slate-900">회원가입</Text>
        <Text className="mt-2 text-sm text-slate-500">방탈출 예약/후기 서비스를 시작해보세요.</Text>

        <Text className="mb-2 mt-8 text-sm font-semibold text-slate-700">이름</Text>
        <Controller
          control={control}
          name="name"
          rules={{ required: true }}
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              placeholder="홍길동"
            />
          )}
        />

        <Text className="mb-2 mt-5 text-sm font-semibold text-slate-700">이메일</Text>
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
          rules={{ required: true, minLength: 8 }}
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              placeholder="8자 이상"
            />
          )}
        />

        <Text className="mb-2 mt-5 text-sm font-semibold text-slate-700">비밀번호 확인</Text>
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: true,
            validate: (value) => value === watch('password'),
          }}
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
              placeholder="비밀번호 확인"
            />
          )}
        />

        {registerMutation.isError ? (
          <Text className="mt-3 text-sm text-red-600">{toErrorMessage(registerMutation.error)}</Text>
        ) : null}

        <Pressable
          className={`mt-7 rounded-xl px-4 py-4 ${registerMutation.isPending ? 'bg-slate-400' : 'bg-brand-600'}`}
          disabled={registerMutation.isPending}
          onPress={handleSubmit((values) => void onSubmit(values))}
        >
          <Text className="text-center text-base font-semibold text-white">
            {registerMutation.isPending ? '가입 중...' : '회원가입'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaWrapper>
  );
}
