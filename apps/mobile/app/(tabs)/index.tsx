import { FlashList } from '@shopify/flash-list';
import { Text, View } from 'react-native';
import { ErrorView } from '../../components/common/ErrorView';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { ThemeCard } from '../../components/theme/ThemeCard';
import { useFeaturedThemes } from '../../hooks/useThemes';
import { toErrorMessage } from '../../lib/utils';

export default function HomeTabScreen() {
  const { data, isLoading, isError, error, refetch } = useFeaturedThemes();

  if (isLoading) {
    return <LoadingSpinner label="인기 테마를 불러오는 중..." />;
  }

  if (isError) {
    return <ErrorView message={toErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  return (
    <SafeAreaWrapper>
      <FlashList
        data={data ?? []}
        renderItem={({ item }) => <ThemeCard theme={item} />}
        estimatedItemSize={280}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28 }}
        ListHeaderComponent={
          <View className="mb-3">
            <Text className="text-2xl font-bold text-slate-900">인기 테마</Text>
            <Text className="mt-1 text-sm text-slate-500">지금 가장 많이 예약되는 테마를 확인하세요.</Text>
          </View>
        }
      />
    </SafeAreaWrapper>
  );
}
