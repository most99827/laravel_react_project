import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, ArrowUpDown, Pencil, Trash2 } from 'lucide-react';

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

export default function Index({ users, sys_admin_groups }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            href: '/setup/users',
        },
    ];

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsCreating(true);
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    };

    const handleDelete = (user: User) => {
        router.delete(`/setup/users/${user.id}`, {
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
        router.get('/setup/users', Object.fromEntries(currentParams), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => onParamsChange({ sort: 'name', direction: 'asc' })}
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => onParamsChange({ sort: 'email', direction: 'asc' })}
                    >
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
        },
        {
            accessorKey: 'group.group_name', // Accessing nested property if loaded
            header: 'Group',
            cell: ({ row }) => <div>{(row.original as any).group?.group_name || 'No Group'}</div>,
        },
        {
            accessorKey: 'created_at',
            header: 'Created At',
            cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(user)}
                            title="Edit"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>

                        <ConfirmDialog
                            trigger={
                                <Button
                                    variant="outline"
                                    size="icon"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            }
                            description={
                                <>
                                    This action cannot be undone. This will permanently delete the user
                                    <strong> {user.name}</strong> and remove their data from our servers.
                                </>
                            }
                            onContinue={() => handleDelete(user)}
                        />
                    </div>
                );
            },
        },
    ];

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
