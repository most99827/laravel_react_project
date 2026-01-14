import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Settings, Shield, Users } from 'lucide-react';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';

import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
        privilege: 'dashboard.open',
    },
    {
        title: 'Setup',
        href: '#',
        icon: Settings,
        items: [
            {
                title: 'Users',
                href: '/setup/users',
                icon: Users,
                privilege: 'setup.users',
            },
            {
                title: 'Security Group',
                href: '/setup/groups',
                icon: Shield,
                privilege: 'setup.security_groups',
            }
        ]
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const privileges = auth.privileges || {};

    const checkPrivilege = (privilege?: string) => {
        if (!privilege) return true;

        const keys = privilege.split('.');
        let current = privileges;

        for (const key of keys) {
            if (current[key] === undefined) return false;
            current = current[key];
        }

        return current == 1 || current === '1' || current === true;
    };

    const filterNavItems = (items: NavItem[]): NavItem[] => {
        return items.filter(item => {
            // Check own privilege
            const hasPrivilege = checkPrivilege(item.privilege);
            if (!hasPrivilege) return false;

            // Check children privilege
            if (item.items) {
                item.items = filterNavItems(item.items);
                if (item.items.length === 0 && item.href === '#') return false;
            }

            return true;
        });
    };

    const visibleNavItems = filterNavItems(mainNavItems);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
