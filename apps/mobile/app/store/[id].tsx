import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { ErrorView } from '../../components/common/ErrorView';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { ThemeCard } from '../../components/theme/ThemeCard';
import { useStore, useThemesByStore } from '../../hooks/useThemes';
import { toErrorMessage } from '../../lib/utils';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const storeId = typeof id === 'string' ? id : '';
  const storeQuery = useStore(storeId);
  const themesQuery = useThemesByStore(storeId);

  if (storeQuery.isLoading || themesQuery.isLoading) {
    return <LoadingSpinner label="매장 정보를 불러오는 중..." />;
  }

  if (storeQuery.isError) {
    return <ErrorView message={toErrorMessage(storeQuery.error)} onRetry={() => void storeQuery.refetch()} />;
  }

  if (themesQuery.isError) {
    return <ErrorView message={toErrorMessage(themesQuery.error)} onRetry={() => void themesQuery.refetch()} />;
  }

  const store = storeQuery.data;
  if (!store) {
    return <ErrorView message="매장을 찾을 수 없습니다." />;
  }

  return (
    <SafeAreaWrapper>
      <FlashList
        data={themesQuery.data ?? []}
        renderItem={({ item }) => <ThemeCard theme={item} />}
        estimatedItemSize={260}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View className="mb-4 mt-2 rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-xl font-bold text-slate-900">{store.name}</Text>
            <Text className="mt-2 text-sm text-slate-600">{store.address}</Text>
            {store.phone ? <Text className="mt-1 text-sm text-slate-500">{store.phone}</Text> : null}
            {store.website ? <Text className="mt-1 text-sm text-brand-600">{store.website}</Text> : null}
            <Text className="mt-4 text-sm font-semibold text-slate-700">등록된 테마</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-slate-500">등록된 테마가 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaWrapper>
  );
}
