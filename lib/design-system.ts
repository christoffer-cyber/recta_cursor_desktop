// Modern Design System for Arena
// Consistent design tokens and utilities

export const DesignSystem = {
  // Color Palette - Premium consulting theme
  colors: {
    // Primary colors
    primary: {
      50: 'hsl(220, 13%, 97%)',
      100: 'hsl(220, 13%, 94%)',
      200: 'hsl(220, 13%, 88%)',
      300: 'hsl(220, 9%, 64%)',
      400: 'hsl(220, 9%, 46%)',
      500: 'hsl(220, 85%, 35%)', // Main blue
      600: 'hsl(220, 85%, 28%)',
      700: 'hsl(220, 85%, 22%)',
      800: 'hsl(220, 25%, 16%)',
      900: 'hsl(220, 100%, 8%)', // Navy
    },
    
    // Accent colors
    accent: {
      50: 'hsl(45, 100%, 95%)',
      100: 'hsl(45, 100%, 90%)',
      200: 'hsl(45, 100%, 80%)',
      300: 'hsl(45, 100%, 70%)',
      400: 'hsl(45, 100%, 60%)',
      500: 'hsl(45, 100%, 51%)', // Gold
      600: 'hsl(45, 100%, 45%)',
      700: 'hsl(45, 100%, 35%)',
      800: 'hsl(45, 100%, 25%)',
      900: 'hsl(45, 100%, 15%)',
    },
    
    // Neutral colors
    neutral: {
      50: 'hsl(220, 13%, 97%)',
      100: 'hsl(220, 13%, 94%)',
      200: 'hsl(220, 13%, 88%)',
      300: 'hsl(220, 9%, 64%)',
      400: 'hsl(220, 9%, 46%)',
      500: 'hsl(220, 14%, 31%)',
      600: 'hsl(220, 14%, 25%)',
      700: 'hsl(220, 14%, 20%)',
      800: 'hsl(220, 25%, 16%)',
      900: 'hsl(220, 39%, 11%)',
    },
    
    // Semantic colors
    success: {
      50: 'hsl(142, 76%, 96%)',
      500: 'hsl(142, 76%, 36%)',
      600: 'hsl(142, 76%, 28%)',
    },
    
    warning: {
      50: 'hsl(38, 92%, 95%)',
      300: 'hsl(38, 92%, 70%)',
      500: 'hsl(38, 92%, 50%)',
      600: 'hsl(38, 92%, 40%)',
    },
    
    error: {
      50: 'hsl(0, 93%, 96%)',
      500: 'hsl(0, 93%, 60%)',
      600: 'hsl(0, 93%, 50%)',
    },
    
    // Background colors
    background: {
      primary: 'hsl(0, 0%, 100%)',
      secondary: 'hsl(220, 13%, 97%)',
      tertiary: 'hsl(220, 13%, 94%)',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans), "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
      mono: 'var(--font-geist-mono), ui-monospace, "SF Mono", "Monaco", monospace',
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Transitions
  transition: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Gradient utility
  gradient: (direction: string, colors: string[]) => {
    return `linear-gradient(${direction}, ${colors.join(', ')})`;
  },
} as const;

// Utility functions for design system
export const DesignUtils = {
  // Get color with opacity
  colorWithOpacity: (color: string, opacity: number) => {
    return color.replace('hsl(', `hsla(`).replace(')', `, ${opacity})`);
  },
  
  // Get responsive value
  responsive: (values: Record<string, string>) => {
    return Object.entries(values)
      .map(([breakpoint, value]) => {
        if (breakpoint === 'base') return value;
        return `@media (min-width: ${DesignSystem.breakpoints[breakpoint as keyof typeof DesignSystem.breakpoints]}) { ${value} }`;
      })
      .join(' ');
  },
  
  // Create gradient
  gradient: (direction: string, colors: string[]) => {
    return `linear-gradient(${direction}, ${colors.join(', ')})`;
  },
  
  // Create backdrop blur
  backdropBlur: (amount: number) => {
    return `backdrop-filter: blur(${amount}px)`;
  },
};

// Component-specific design tokens
export const ComponentTokens = {
  // Arena Container
  arenaContainer: {
    background: DesignSystem.colors.background.primary,
    minHeight: '100vh',
    fontFamily: DesignSystem.typography.fontFamily.sans,
  },
  
  // Arena Header
  arenaHeader: {
    textAlign: 'center' as const,
    marginBottom: DesignSystem.spacing[6],
    padding: DesignSystem.spacing[8],
    background: DesignSystem.gradient('135deg', [
      DesignSystem.colors.primary[50],
      DesignSystem.colors.background.primary,
    ]),
  },
  
  // Arena Title
  arenaTitle: {
    fontSize: DesignSystem.typography.fontSize['4xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.primary[900],
    marginBottom: DesignSystem.spacing[2],
    letterSpacing: '-0.02em',
  },
  
  // Arena Subtitle
  arenaSubtitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    color: DesignSystem.colors.neutral[600],
    fontWeight: DesignSystem.typography.fontWeight.normal,
    lineHeight: DesignSystem.typography.lineHeight.relaxed,
  },
  
  // Chat Container
  chatContainer: {
    background: DesignSystem.colors.background.primary,
    border: `1px solid ${DesignSystem.colors.neutral[200]}`,
    borderRadius: DesignSystem.borderRadius.lg,
    boxShadow: DesignSystem.boxShadow.sm,
    overflow: 'hidden',
  },
  
  // Message Styles
  message: {
    user: {
      background: DesignSystem.colors.primary[500],
      color: DesignSystem.colors.background.primary,
      borderRadius: DesignSystem.borderRadius.xl,
      padding: `${DesignSystem.spacing[4]} ${DesignSystem.spacing[5]}`,
    },
    assistant: {
      background: DesignSystem.colors.neutral[50],
      color: DesignSystem.colors.neutral[800],
      borderRadius: DesignSystem.borderRadius.xl,
      padding: `${DesignSystem.spacing[4]} ${DesignSystem.spacing[5]}`,
      border: `1px solid ${DesignSystem.colors.neutral[200]}`,
    },
  },
  
  // Button Styles
  button: {
    primary: {
      background: DesignSystem.colors.primary[500],
      color: DesignSystem.colors.background.primary,
      border: `1px solid ${DesignSystem.colors.primary[500]}`,
      borderRadius: DesignSystem.borderRadius.md,
      padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[6]}`,
      fontWeight: DesignSystem.typography.fontWeight.medium,
      fontSize: DesignSystem.typography.fontSize.sm,
      transition: `all ${DesignSystem.transition.fast}`,
    },
    secondary: {
      background: DesignSystem.colors.background.primary,
      color: DesignSystem.colors.neutral[700],
      border: `1px solid ${DesignSystem.colors.neutral[300]}`,
      borderRadius: DesignSystem.borderRadius.md,
      padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[6]}`,
      fontWeight: DesignSystem.typography.fontWeight.medium,
      fontSize: DesignSystem.typography.fontSize.sm,
      transition: `all ${DesignSystem.transition.fast}`,
    },
  },
  
  // Input Styles
  input: {
    background: DesignSystem.colors.background.primary,
    border: `1px solid ${DesignSystem.colors.neutral[300]}`,
    borderRadius: DesignSystem.borderRadius.md,
    padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[4]}`,
    fontSize: DesignSystem.typography.fontSize.base,
    fontFamily: DesignSystem.typography.fontFamily.sans,
    transition: `all ${DesignSystem.transition.fast}`,
    '&:focus': {
      outline: 'none',
      borderColor: DesignSystem.colors.primary[500],
      boxShadow: `0 0 0 2px ${DesignUtils.colorWithOpacity(DesignSystem.colors.primary[500], 0.1)}`,
    },
  },
  
  // Cluster Step Styles
  clusterStep: {
    'not-started': {
      background: DesignUtils.colorWithOpacity(DesignSystem.colors.background.primary, 0.2),
      color: DesignUtils.colorWithOpacity(DesignSystem.colors.background.primary, 0.7),
      border: `2px solid ${DesignUtils.colorWithOpacity(DesignSystem.colors.background.primary, 0.2)}`,
    },
    'in-progress': {
      background: DesignSystem.colors.background.primary,
      color: DesignSystem.colors.primary[900],
      border: `2px solid ${DesignSystem.colors.primary[200]}`,
      boxShadow: DesignSystem.boxShadow.md,
    },
    complete: {
      background: DesignUtils.colorWithOpacity(DesignSystem.colors.background.primary, 0.3),
      color: DesignSystem.colors.background.primary,
      border: `2px solid ${DesignUtils.colorWithOpacity(DesignSystem.colors.background.primary, 0.4)}`,
    },
    'needs-revisit': {
      background: DesignSystem.colors.warning[50],
      color: DesignSystem.colors.primary[900],
      border: `2px solid ${DesignSystem.colors.warning[300]}`,
      boxShadow: DesignSystem.boxShadow.md,
    },
    locked: {
      background: DesignSystem.colors.neutral[100],
      color: DesignSystem.colors.neutral[400],
      border: `2px solid ${DesignSystem.colors.neutral[300]}`,
      opacity: 0.6,
    },
  },
} as const;

export type DesignSystemType = typeof DesignSystem;
export type ComponentTokensType = typeof ComponentTokens;
