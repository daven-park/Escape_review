import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { ErrorView } from '../../components/common/ErrorView';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { ReviewForm } from '../../components/review/ReviewForm';
import { useCreateReview } from '../../hooks/useReviews';
import { toErrorMessage } from '../../lib/utils';

export default function ReviewWriteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const themeId = typeof id === 'string' ? id : '';
  const createReviewMutation = useCreateReview(themeId);

  if (!themeId) {
    return <ErrorView message="유효하지 않은 테마 경로입니다." />;
  }

  return (
    <SafeAreaWrapper className="bg-white" edges={['bottom', 'left', 'right', 'top']}>
      <View className="px-4 pt-3">
        <Text className="text-xl font-bold text-slate-900">리뷰 작성</Text>
        <Text className="mt-1 text-sm text-slate-500">테마 플레이 경험을 기록하고 다른 유저와 공유하세요.</Text>
      </View>
      <ReviewForm
        isSubmitting={createReviewMutation.isPending}
        onSubmit={async (values) => {
          try {
            await createReviewMutation.mutateAsync(values);
            Alert.alert('저장 완료', '리뷰가 등록되었습니다.');
            router.back();
          } catch (error) {
            Alert.alert('오류', toErrorMessage(error));
          }
        }}
      />
    </SafeAreaWrapper>
  );
}
