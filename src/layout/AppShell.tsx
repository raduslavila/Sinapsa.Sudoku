import type { PropsWithChildren, ReactNode } from 'react';

type AppShellProps = PropsWithChildren<{
  header?: ReactNode;
  footer?: ReactNode;
}>;

export function AppShell({ header, footer, children }: AppShellProps) {
  return (
    <div className="app-shell">
      {header}
      <main className="app-content">
        <div className="app-content-inner">{children}</div>
      </main>
      {footer}
    </div>
  );
}
