import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = 'medium',
  title,
  subtitle,
}) => {
  const { colors } = useTheme();

  const cardStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    },
    elevated: {
      ...Shadows.medium,
    },
    outlined: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    default: {},
    paddingNone: {},
    paddingSmall: {
      padding: Spacing.sm,
    },
    paddingMedium: {
      padding: Spacing.md,
    },
    paddingLarge: {
      padding: Spacing.lg,
    },
    header: {
      marginBottom: Spacing.sm,
    },
    title: {
      ...Typography.h3,
      color: colors.text,
      marginBottom: subtitle ? Spacing.xs / 2 : 0,
    },
    subtitle: {
      ...Typography.body2,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={[
      cardStyles.container,
      cardStyles[variant],
      cardStyles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof cardStyles],
      style,
    ]}>
      {(title || subtitle) && (
        <View style={cardStyles.header}>
          {title && <Text style={cardStyles.title}>{title}</Text>}
          {subtitle && <Text style={cardStyles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  );
};
