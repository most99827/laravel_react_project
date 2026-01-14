import React from 'react';
import { usePrivilege } from '@/hooks/use-privilege';

interface ProtectProps {
    privilege?: string;
    privileges?: string[];
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export function Protect({ privilege, privileges, fallback = null, children }: ProtectProps) {
    const { can, canAny } = usePrivilege();

    if (privilege && can(privilege)) {
        return <>{children}</>;
    }

    if (privileges && canAny(privileges)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
