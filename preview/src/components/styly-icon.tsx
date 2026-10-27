import { createElement } from 'react';
import { Platform, Text } from 'react-native';

export type StylyIconName = 'home' | 'wardrobe' | 'style' | 'laundry' | 'profile' | 'camera';

const paths: Record<StylyIconName, string> = {
  home: '<path d="M4 5.5h6.5V12H4zM13.5 5.5H20V9h-6.5zM13.5 12H20v6.5h-6.5zM4 15h6.5v3.5H4z"/>',
  wardrobe: '<path d="M8.2 7.1c0-2 1.2-3.4 3.1-3.4 1.3 0 2.3.8 2.3 1.9 0 1.2-.8 1.9-1.8 2.5"/><path d="m11.8 8.1-8 6.2c-.8.6-.4 1.9.6 1.9h15.2c1 0 1.4-1.3.6-1.9l-8.4-6.2Z"/>',
  style: '<path d="M12 3.2c.45 4.2 2.6 6.35 6.8 6.8-4.2.45-6.35 2.6-6.8 6.8-.45-4.2-2.6-6.35-6.8-6.8 4.2-.45 6.35-2.6 6.8-6.8Z"/><circle cx="18.4" cy="17.8" r="1.9"/>',
  laundry: '<path d="M8.2 5 6 7.2l-2.5 1.2 2 4.2 2-1v7.2h9v-7.2l2 1 2-4.2L18 7.2 15.8 5c-1.1 1.2-2.3 1.8-3.8 1.8S9.3 6.2 8.2 5Z"/><path d="M8.8 14.2h6.4"/>',
  profile: '<circle cx="12" cy="8" r="3.2"/><path d="M5.2 19.5c.7-4 3-6 6.8-6s6.1 2 6.8 6"/><path d="M4 21h16"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3v10H4Z"/><circle cx="12" cy="13" r="3.3"/><path d="M17.5 10.2h.01"/>',
};

const fallback: Record<StylyIconName, string> = { home: '▦', wardrobe: '⌁', style: '✦', laundry: '♢', profile: '○', camera: '◇' };

export function StylyIcon({ name, color = '#87858B', size = 22, active = false }: { name: StylyIconName; color?: string; size?: number; active?: boolean }) {
  if (Platform.OS !== 'web') return <Text style={{ color, fontSize: size }}>{fallback[name]}</Text>;
  return createElement('svg', {
    'aria-hidden': true,
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    fill: 'none',
    stroke: color,
    strokeWidth: active ? 2.05 : 1.55,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    dangerouslySetInnerHTML: { __html: paths[name] },
  });
}
