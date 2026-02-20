import { FlashList } from '@shopify/flash-list';
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { ErrorView } from '../../components/common/ErrorView';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { ThemeCard } from '../../components/theme/ThemeCard';
import { useFeaturedThemes, useSearchThemes } from '../../hooks/useThemes';
import { toErrorMessage } from '../../lib/utils';

export default function SearchTabScreen() {
  const [keyword, setKeyword] = useState('');
  const trimmedKeyword = keyword.trim();
  const searchQuery = useSearchThemes(trimmedKeyword);
  const featuredQuery = useFeaturedThemes();

  const isSearching = trimmedKeyword.length > 0;
  const data = useMemo(
    () => (isSearching ? searchQuery.data ?? [] : featuredQuery.data ?? []),
    [featuredQuery.data, isSearching, searchQuery.data],
  );
  const isLoading = isSearching ? searchQuery.isLoading : featuredQuery.isLoading;
  const isError = isSearching ? searchQuery.isError : featuredQuery.isError;
  const error = isSearching ? searchQuery.error : featuredQuery.error;

  if (isLoading) {
    return <LoadingSpinner label="검색 결과를 불러오는 중..." />;
  }

  if (isError) {
    return (
      <ErrorView
        message={toErrorMessage(error)}
        onRetry={() => void (isSearching ? searchQuery.refetch() : featuredQuery.refetch())}
      />
    );
  }

  return (
    <SafeAreaWrapper>
      <View className="px-4 pt-2">
        <Text className="mb-3 text-2xl font-bold text-slate-900">테마 검색</Text>
        <TextInput
          className="rounded-xl border border-slate-300 bg-white px-4 py-3"
          placeholder="테마명/장르/매장명으로 검색"
          value={keyword}
          onChangeText={setKeyword}
        />
      </View>
      <FlashList
        data={data}
        renderItem={({ item }) => <ThemeCard theme={item} />}
        estimatedItemSize={260}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-slate-500">검색 결과가 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaWrapper>
  );
}
