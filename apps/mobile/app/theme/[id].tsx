import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ErrorView } from '../../components/common/ErrorView';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { BookmarkButton } from '../../components/common/BookmarkButton';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { ReviewCard } from '../../components/review/ReviewCard';
import { GenreBadge } from '../../components/theme/GenreBadge';
import { useInfiniteReviews } from '../../hooks/useReviews';
import { useTheme } from '../../hooks/useThemes';
import { toErrorMessage } from '../../lib/utils';

export default function ThemeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const themeId = typeof id === 'string' ? id : '';
  const themeQuery = useTheme(themeId);
  const reviewsQuery = useInfiniteReviews(themeId);

  if (themeQuery.isLoading) {
    return <LoadingSpinner label="테마 정보를 불러오는 중..." />;
  }

  if (themeQuery.isError) {
    return <ErrorView message={toErrorMessage(themeQuery.error)} onRetry={() => void themeQuery.refetch()} />;
  }

  if (!themeQuery.data) {
    return <ErrorView message="테마를 찾을 수 없습니다." />;
  }

  const theme = themeQuery.data;
  const reviews = reviewsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <SafeAreaWrapper>
      <FlashList
        data={reviews}
        renderItem={({ item }) => <ReviewCard review={item} />}
        estimatedItemSize={220}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (reviewsQuery.hasNextPage && !reviewsQuery.isFetchingNextPage) {
            void reviewsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View className="mb-4 mt-2 rounded-2xl border border-slate-200 bg-white p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <GenreBadge genre={theme.genre} />
                <Text className="mt-2 text-xl font-bold text-slate-900">{theme.name}</Text>
              </View>
              <BookmarkButton />
            </View>
            <Text className="mt-3 text-sm leading-5 text-slate-700">{theme.description}</Text>
            <Text className="mt-3 text-sm text-slate-600">
              난이도 {theme.difficulty}/5 · 공포도 {theme.fearLevel}/5 · 인원 {theme.playerMin}~{theme.playerMax}
              명 · {theme.duration}분
            </Text>
            <Pressable
              className="mt-4 rounded-xl bg-brand-600 px-4 py-3"
              onPress={() => router.push(`/review/${theme.id}`)}
            >
              <Text className="text-center font-semibold text-white">리뷰 작성</Text>
            </Pressable>
            <Text className="mt-5 text-sm font-semibold text-slate-800">리뷰</Text>
          </View>
        }
        ListFooterComponent={
          reviewsQuery.isFetchingNextPage ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#2f5dff" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          reviewsQuery.isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="small" color="#2f5dff" />
              <Text className="mt-2 text-slate-500">리뷰를 불러오는 중...</Text>
            </View>
          ) : reviewsQuery.isError ? (
            <ErrorView message={toErrorMessage(reviewsQuery.error)} onRetry={() => void reviewsQuery.refetch()} />
          ) : (
            <View className="items-center py-10">
              <Text className="text-slate-500">아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요.</Text>
            </View>
          )
        }
      />
    </SafeAreaWrapper>
  );
}
