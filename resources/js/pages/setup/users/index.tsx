import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import { useColumns } from './columns';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { type BreadcrumbItem, type User } from '@/types';
import UserForm from './UserForm';

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface SysAdminGroup {
    id: number;
    group_name: string;
}

interface Props {
    users: PaginatedUsers;
    sys_admin_groups: SysAdminGroup[];
}

import { index, destroy } from '@/routes/users';

export default function Index({ users, sys_admin_groups }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            href: index().url,
        },
    ];

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsCreating(true);
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    };

    const handleDelete = (user: User) => {
        router.delete(destroy({ user: user.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                handleCancel();
            }
        });
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingUser(null);
    };

    const onParamsChange = (params: any) => {
        const currentParams = new URLSearchParams(window.location.search);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                currentParams.set(key, params[key]);
            } else {
                currentParams.delete(key);
            }
        });
        router.get(index().url, Object.fromEntries(currentParams), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = useColumns({ onParamsChange, handleEdit, handleDelete });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Users</h2>
                    <Button onClick={() => {
                        handleCancel();
                        setIsCreating(true);
                        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Add New User
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={users.data}
                    meta={users}
                    onParamsChange={onParamsChange}
                />

                {isCreating && (
                    <UserForm
                        key={editingUser ? editingUser.id : 'new'}
                        user={editingUser}
                        sys_admin_groups={sys_admin_groups}
                        onSuccess={() => {
                            handleCancel();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </AppLayout>
    );
}
