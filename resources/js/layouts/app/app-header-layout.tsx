import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren, ReactNode } from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    headerRight?: React.ReactNode;
}

export default function AppLayout({
                                      children,
                                      breadcrumbs,
                                      headerRight,
                                  }: PropsWithChildren<AppLayoutProps>) {
    return (
        <AppShell>
            <AppHeader breadcrumbs={breadcrumbs} headerRight={headerRight} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
