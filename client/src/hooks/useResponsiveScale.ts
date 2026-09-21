import { useWindowDimensions } from 'react-native';

export function useResponsiveScale(): number {
  const { width } = useWindowDimensions();
  if (width >= 1400) return 1.7;
  if (width >= 1100) return 1.45;
  if (width >= 800) return 1.2;
  return 1;
}