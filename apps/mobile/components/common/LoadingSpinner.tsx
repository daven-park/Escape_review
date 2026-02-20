import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = '불러오는 중...' }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center px-4">
      <ActivityIndicator size="large" color="#2f5dff" />
      <Text className="mt-2 text-sm text-slate-500">{label}</Text>
    </View>
  );
}
