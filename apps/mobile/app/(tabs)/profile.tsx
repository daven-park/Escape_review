import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileTabScreen() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-4 py-3">
        <Text className="text-2xl font-bold text-slate-900">프로필</Text>

        {isAuthenticated && user ? (
          <View className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-lg font-semibold text-slate-900">{user.name}</Text>
            <Text className="mt-1 text-sm text-slate-500">{user.email || '이메일 미등록'}</Text>

            <View className="mt-4 flex-row gap-2">
              <View className="flex-1 rounded-xl bg-slate-100 p-3">
                <Text className="text-xs text-slate-500">북마크</Text>
                <Text className="text-lg font-bold text-slate-900">0</Text>
              </View>
              <View className="flex-1 rounded-xl bg-slate-100 p-3">
                <Text className="text-xs text-slate-500">작성 리뷰</Text>
                <Text className="text-lg font-bold text-slate-900">0</Text>
              </View>
            </View>

            <Pressable
              className="mt-4 rounded-xl bg-slate-900 px-4 py-3"
              onPress={() => void logout()}
            >
              <Text className="text-center font-semibold text-white">로그아웃</Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-sm text-slate-600">로그인 후 북마크와 내 리뷰를 관리할 수 있습니다.</Text>
            <Pressable
              className="mt-4 rounded-xl bg-brand-600 px-4 py-3"
              onPress={() => router.push('/(auth)/login')}
            >
              <Text className="text-center font-semibold text-white">로그인</Text>
            </Pressable>
            <Pressable
              className="mt-2 rounded-xl border border-slate-300 px-4 py-3"
              onPress={() => router.push('/(auth)/register')}
            >
              <Text className="text-center font-semibold text-slate-800">회원가입</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaWrapper>
  );
}
