import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { Theme } from '../../hooks/useThemes';
import { GenreBadge } from './GenreBadge';

interface ThemeCardProps {
  theme: Theme;
}

export function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <Pressable
      className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white"
      onPress={() => router.push(`/theme/${theme.id}`)}
    >
      {theme.posterUrl ? (
        <Image
          source={{ uri: theme.posterUrl }}
          contentFit="cover"
          style={{ width: '100%', height: 180 }}
        />
      ) : (
        <View className="h-36 items-center justify-center bg-slate-100">
          <Text className="text-slate-500">이미지 없음</Text>
        </View>
      )}

      <View className="gap-2 p-4">
        <GenreBadge genre={theme.genre} />
        <Text className="text-lg font-bold text-slate-900">{theme.name}</Text>
        <Text className="text-sm text-slate-600" numberOfLines={2}>
          {theme.description}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-slate-700">
            난이도 {theme.difficulty}/5 · 공포도 {theme.fearLevel}/5
          </Text>
          <Text className="text-sm font-semibold text-brand-600">{theme.duration}분</Text>
        </View>
      </View>
    </Pressable>
  );
}
