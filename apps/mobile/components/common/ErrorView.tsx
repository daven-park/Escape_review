import { Pressable, Text, View } from 'react-native';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({
  message = '요청 처리 중 오류가 발생했습니다.',
  onRetry,
}: ErrorViewProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-center text-sm text-red-600">{message}</Text>
      {onRetry ? (
        <Pressable className="mt-3 rounded-lg bg-slate-900 px-4 py-2" onPress={onRetry}>
          <Text className="text-sm font-semibold text-white">다시 시도</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
