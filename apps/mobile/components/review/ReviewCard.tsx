import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { ScrollView, Text, View } from 'react-native';
import { Review } from '../../hooks/useReviews';
import { formatDate } from '../../lib/utils';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <View className="mb-3 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-slate-900">{review.user.name}</Text>
        <Text className="text-xs text-slate-500">{formatDate(review.createdAt)}</Text>
      </View>

      <View className="mb-2 flex-row items-center justify-between">
        <StarRating value={review.rating} />
        <View className="flex-row items-center gap-1">
          <Ionicons name="heart" size={14} color="#ef4444" />
          <Text className="text-xs text-slate-600">{review.likeCount}</Text>
        </View>
      </View>

      <Text className="mb-3 text-sm leading-5 text-slate-700">{review.content}</Text>

      {review.images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {review.images.map((uri) => (
              <Image
                key={uri}
                source={{ uri }}
                contentFit="cover"
                style={{ width: 96, height: 96, borderRadius: 8 }}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}
