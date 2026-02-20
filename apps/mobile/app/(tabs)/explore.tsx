import { FlashList } from '@shopify/flash-list';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ErrorView } from '../../components/common/ErrorView';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { StoreCard } from '../../components/store/StoreCard';
import { useStoresByRegion } from '../../hooks/useThemes';
import { toErrorMessage } from '../../lib/utils';

const regions = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전'];

export default function ExploreTabScreen() {
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const regionParam = useMemo(
    () => (selectedRegion === '전체' ? undefined : selectedRegion),
    [selectedRegion],
  );
  const { data, isLoading, isError, error, refetch } = useStoresByRegion(regionParam);

  if (isLoading) {
    return <LoadingSpinner label="지역 매장을 불러오는 중..." />;
  }

  if (isError) {
    return <ErrorView message={toErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  return (
    <SafeAreaWrapper>
      <FlashList
        data={data ?? []}
        renderItem={({ item }) => <StoreCard store={item} />}
        estimatedItemSize={200}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View className="mb-3">
            <Text className="mb-3 text-2xl font-bold text-slate-900">지역별 매장 탐색</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2 pb-1">
                {regions.map((region) => {
                  const active = selectedRegion === region;
                  return (
                    <Pressable
                      key={region}
                      className={`rounded-full px-4 py-2 ${active ? 'bg-brand-600' : 'bg-slate-200'}`}
                      onPress={() => setSelectedRegion(region)}
                    >
                      <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-700'}`}>
                        {region}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        }
      />
    </SafeAreaWrapper>
  );
}
