import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable } from 'react-native';

interface BookmarkButtonProps {
  isBookmarked?: boolean;
  onToggle?: (nextValue: boolean) => void;
}

export function BookmarkButton({ isBookmarked = false, onToggle }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const onPress = () => {
    const next = !bookmarked;
    setBookmarked(next);
    onToggle?.(next);
  };

  return (
    <Pressable
      className="h-9 w-9 items-center justify-center rounded-full bg-white"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="북마크 토글"
    >
      <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color="#0f172a" />
    </Pressable>
  );
}
