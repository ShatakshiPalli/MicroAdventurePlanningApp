import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  icon,
  loading = false,
  style,
}) => {
  const { colors } = useTheme();

  const buttonStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
      ...Shadows.small,
      opacity: disabled || loading ? 0.6 : 1,
      ...(fullWidth && { width: '100%' }),
    },
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    small: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      minHeight: 32,
    },
    medium: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      minHeight: 44,
    },
    large: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      minHeight: 52,
    },
    text: {
      ...Typography.button,
      marginLeft: icon ? Spacing.xs : 0,
    },
    primaryText: {
      color: colors.onPrimary,
    },
    secondaryText: {
      color: colors.onSecondary,
    },
    outlineText: {
      color: colors.primary,
    },
    ghostText: {
      color: colors.primary,
    },
  });

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return buttonStyles.primaryText;
      case 'secondary':
        return buttonStyles.secondaryText;
      case 'outline':
        return buttonStyles.outlineText;
      case 'ghost':
        return buttonStyles.ghostText;
      default:
        return buttonStyles.primaryText;
    }
  };

  return (
    <Pressable
      style={[
        buttonStyles.container,
        buttonStyles[variant],
        buttonStyles[size],
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: colors.primary + '20' }}
    >
      {icon && <View>{icon}</View>}
      <Text style={[buttonStyles.text, getTextStyle()]}>
        {loading ? 'Loading...' : title}
      </Text>
    </Pressable>
  );
};
