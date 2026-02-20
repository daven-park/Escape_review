import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';
import { colors } from '../../constants/colors';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 24 }: StarRatingProps) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((index) => {
        const filled = index <= value;
        return (
          <Pressable
            key={index}
            onPress={() => onChange?.(index)}
            disabled={!onChange}
            accessibilityRole="button"
            accessibilityLabel={`${index}점`}
          >
            <Ionicons
              name={filled ? 'star' : 'star-outline'}
              size={size}
              color={filled ? colors.star : '#CBD5E1'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
