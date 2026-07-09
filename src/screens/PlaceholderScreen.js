import { ScreenShell } from '../components/ScreenShell';

export function PlaceholderScreen({ title, subtitle, children }) {
  return (
    <ScreenShell title={title} subtitle={subtitle}>
      {children}
    </ScreenShell>
  );
}
