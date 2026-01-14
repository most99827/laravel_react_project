import { usePage } from '@inertiajs/react';
import { Auth } from '@/types';

export function usePrivilege() {
    const { auth } = usePage<any>().props;
    const privileges = auth.privileges || {};

    /**
     * Check if the user has a specific privilege.
     * @param privilege The privilege string to check (e.g., 'dashboard.open').
     * @returns boolean
     */
    const can = (privilege: string): boolean => {
        if (!privilege) return false;

        const keys = privilege.split('.');
        let current = privileges;

        for (const key of keys) {
            if (current[key] === undefined) return false;
            current = current[key];
        }

        return current == 1 || current === '1' || current === true;
    };

    /**
     * Check if the user has ANY of the provided privileges.
     * @param privilegesList Array of privileges to check.
     * @returns boolean
     */
    const canAny = (privilegesList: string[]): boolean => {
        return privilegesList.some(p => can(p));
    };

    return { can, canAny, user: auth.user };
}
