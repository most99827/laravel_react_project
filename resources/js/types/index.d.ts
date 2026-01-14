import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    privileges: Record<string, any>;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {

    title: string;
    href: string; // Removed NonNullable<InertiaLinkProps['href']> to simplify for now, logic remains
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[]; // Allow nesting
    privilege?: string; // Dot notation for privilege check (e.g. 'dashboard.open')
}

export interface SharedData {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
