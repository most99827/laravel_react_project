import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useColumns, type SysAdminGroup } from './columns';
import GroupForm from './GroupForm';
import { index, destroy } from '@/routes/groups';

interface Props {
    groups: {
        data: SysAdminGroup[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    availablePrivileges: any;
}

export default function Index({ groups, availablePrivileges }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingGroup, setEditingGroup] = useState<SysAdminGroup | null>(null);

    const handleEdit = (group: SysAdminGroup) => {
        setEditingGroup(group);
        setIsCreating(true);
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    };

    const handleDelete = (group: SysAdminGroup) => {
        router.delete(destroy({ group: group.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                handleCancel();
            }
        });
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingGroup(null);
    };

    const onParamsChange = (params: any) => {
        const currentParams = new URLSearchParams(window.location.search);
        Object.keys(params).forEach(key => {
            if (params[key]) currentParams.set(key, params[key]);
            else currentParams.delete(key);
        });
        router.get(index().url, Object.fromEntries(currentParams), { preserveState: true });
    };

    const columns = useColumns({ onParamsChange, handleEdit, handleDelete });

    return (
        <AppLayout breadcrumbs={[{ title: 'Security Groups', href: index().url }]}>
            <Head title="Security Groups" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Security Groups</h2>
                    <Button onClick={() => {
                        handleCancel();
                        setIsCreating(true);
                        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Group
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={groups.data}
                    meta={groups}
                    onParamsChange={onParamsChange}
                />

                {isCreating && (
                    <GroupForm
                        key={editingGroup ? editingGroup.id : 'new'}
                        group={editingGroup}
                        availablePrivileges={availablePrivileges}
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
