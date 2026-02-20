import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { Store } from '../../hooks/useThemes';

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  return (
    <Pressable
      className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white"
      onPress={() => router.push(`/store/${store.id}`)}
    >
      {store.imageUrl ? (
        <Image
          source={{ uri: store.imageUrl }}
          contentFit="cover"
          style={{ width: '100%', height: 140 }}
        />
      ) : (
        <View className="h-28 items-center justify-center bg-slate-100">
          <Text className="text-slate-500">매장 이미지 없음</Text>
        </View>
      )}
      <View className="gap-1 p-4">
        <Text className="text-base font-bold text-slate-900">{store.name}</Text>
        <Text className="text-sm text-slate-600">{store.address}</Text>
        {store.phone ? <Text className="text-sm text-slate-500">{store.phone}</Text> : null}
      </View>
    </Pressable>
  );
}
