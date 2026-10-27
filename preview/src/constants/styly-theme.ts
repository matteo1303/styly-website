import { Platform } from 'react-native';

export const StylyColors = { ink: '#F5F3EE', muted: '#AAA8B0', canvas: '#090909', surface: '#141414', line: '#302C2B', sage: '#E94E1B', sageSoft: '#2A1510', gold: '#C8A06A', white: '#FFFFFF', demo: '#24130F', black: '#090909' } as const;
export const StylySpacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 } as const;
export const StylyRadii = { sm: 10, md: 16, lg: 22, pill: 999 } as const;
export const StylyFonts = { display: Platform.select({ ios: 'Avenir Next', android: 'sans-serif-medium', default: 'Manrope' }), body: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'Manrope' }) } as const;
