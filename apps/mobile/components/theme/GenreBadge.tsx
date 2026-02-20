import { Text, View } from 'react-native';
import { Genre } from '../../hooks/useThemes';

const genreLabelMap: Record<Genre, string> = {
  HORROR: '공포',
  THRILLER: '스릴러',
  SF: 'SF',
  FANTASY: '판타지',
  MYSTERY: '미스터리',
  ROMANCE: '로맨스',
  ADVENTURE: '어드벤처',
  OTHER: '기타',
};

interface GenreBadgeProps {
  genre: Genre;
}

export function GenreBadge({ genre }: GenreBadgeProps) {
  return (
    <View className="self-start rounded-full bg-brand-100 px-3 py-1">
      <Text className="text-xs font-semibold text-brand-700">{genreLabelMap[genre]}</Text>
    </View>
  );
}
