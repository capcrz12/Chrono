export const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#E8E8E8',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  primary: '#2D2D2D',
  primaryLight: '#F5F5F5',
  accent: '#2563EB',
  accentLight: '#EFF6FF',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
};
