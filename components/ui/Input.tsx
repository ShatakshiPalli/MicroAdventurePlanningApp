import { BorderRadius, Spacing, Typography } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: 'outlined' | 'filled';
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outlined',
  containerStyle,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const inputStyles = StyleSheet.create({
    container: {
      marginVertical: Spacing.xs,
    },
    label: {
      ...Typography.body2,
      color: colors.text,
      marginBottom: Spacing.xs,
      fontWeight: '600',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: BorderRadius.md,
      borderWidth: variant === 'outlined' ? 1.5 : 0,
      borderColor: error ? colors.error : (isFocused ? colors.primary : colors.border),
      backgroundColor: variant === 'filled' ? colors.surface : 'transparent',
      paddingHorizontal: Spacing.md,
      minHeight: 48,
    },
    input: {
      flex: 1,
      ...Typography.body1,
      color: colors.text,
      paddingVertical: Spacing.sm,
      marginLeft: leftIcon ? Spacing.sm : 0,
      marginRight: rightIcon ? Spacing.sm : 0,
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    error: {
      ...Typography.caption,
      color: colors.error,
      marginTop: Spacing.xs,
    },
  });

  return (
    <View style={[inputStyles.container, containerStyle]}>
      {label && <Text style={inputStyles.label}>{label}</Text>}
      <View style={inputStyles.inputContainer}>
        {leftIcon && (
          <View style={inputStyles.iconContainer}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={inputStyles.input}
          placeholderTextColor={colors.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <Pressable
            style={inputStyles.iconContainer}
            onPress={onRightIconPress}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error && <Text style={inputStyles.error}>{error}</Text>}
    </View>
  );
};
