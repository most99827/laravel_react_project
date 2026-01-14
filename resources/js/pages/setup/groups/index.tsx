import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, ArrowUpDown, CheckSquare, Square, Pencil, Trash2 } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/confirm-dialog';

interface SysAdminGroup {
    id: number;
    group_name: string;
    privilege: any; // Can be nested object from DB
    created_at: string;
}

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
    availablePrivileges: any; // Nested object structure
}

export default function Index({ groups, availablePrivileges }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const buildPrivilegeObject = (keys: string[]) => {
        const result: any = {};
        keys.forEach(key => {
            const parts = key.split('.');
            let current = result;
            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    current[part] = "1";
                } else {
                    current[part] = current[part] || {};
                    current = current[part];
                }
            });
        });
        return result;
    };

    const [editingGroup, setEditingGroup] = useState<SysAdminGroup | null>(null);

    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        group_name: '',
        privilege: [] as string[],
    });

    // Transform data before submission
    transform((data) => ({
        ...data,
        privilege: buildPrivilegeObject(data.privilege),
    }));

    const handleEdit = (group: SysAdminGroup) => {
        setEditingGroup(group);
        // Transform the nested JSON object from DB back to flat array for checkboxes
        const flatPrivileges = group.privilege ? getAllKeys(group.privilege) : [];

        setData({
            group_name: group.group_name,
            privilege: flatPrivileges,
        });
        setIsCreating(true); // Re-use the creation form visibility
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    };

    const handleDelete = (group: SysAdminGroup) => {
        router.delete(`/setup/groups/${group.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                // Start fresh
                handleCancel();
            }
        });
    };

    const columns: ColumnDef<SysAdminGroup>[] = [
        {
            accessorKey: 'group_name',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => onParamsChange({ sort: 'group_name', direction: 'asc' })} // Simplified toggle logic for demo, usually we check current state
                    >
                        Group Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase">{row.getValue("group_name")}</div>,
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
                const group = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(group)}
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
                                    This action cannot be undone. This will permanently delete the group
                                    <strong> {group.group_name}</strong> and remove it from our servers.
                                </>
                            }
                            onContinue={() => handleDelete(group)}
                        />
                    </div>
                );
            },
        },
    ];

    const handleCancel = () => {
        setIsCreating(false);
        setEditingGroup(null);
        reset();
    };

    const onParamsChange = (params: any) => {
        const currentParams = new URLSearchParams(window.location.search);
        Object.keys(params).forEach(key => {
            if (params[key]) currentParams.set(key, params[key]);
            else currentParams.delete(key);
        });
        router.get(window.location.pathname, Object.fromEntries(currentParams), { preserveState: true });
    };

    const handleCheckboxChange = (permissionKey: string, checked: boolean) => {
        if (checked) {
            setData('privilege', [...data.privilege, permissionKey]);
        } else {
            setData('privilege', data.privilege.filter((p) => p !== permissionKey));
        }
    };

    const getAllKeys = (obj: any, prefix = ''): string[] => {
        let keys: string[] = [];
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const currentKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null) {
                keys = [...keys, ...getAllKeys(value, currentKey)];
            } else {
                keys.push(currentKey);
            }
        });
        return keys;
    };

    const handleSelectAll = () => {
        if (availablePrivileges) {
            setData('privilege', getAllKeys(availablePrivileges));
        }
    };

    const handleRemoveAll = () => {
        setData('privilege', []);
    };

    const renderPrivileges = (privileges: any, parentKey = '', isRoot = true) => {
        if (!privileges) return null;

        const content = Object.keys(privileges).map((key) => {
            const value = privileges[key];
            const currentKey = parentKey ? `${parentKey}.${key}` : key;

            if (typeof value === 'object' && value !== null) {
                // If it's a top-level group (isRoot), wrap it in a card/column
                if (isRoot) {
                    return (
                        <div key={currentKey} className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm">
                            <h4 className="font-semibold capitalize text-base mb-3 border-b pb-2">{key.replace(/_/g, ' ')}</h4>
                            <div className="space-y-2">
                                {renderPrivileges(value, currentKey, false)}
                            </div>
                        </div>
                    );
                }

                // Nested groups
                return (
                    <div key={currentKey} className="ml-4 mt-2">
                        <h5 className="font-medium capitalize text-sm mb-1 text-muted-foreground">{key.replace(/_/g, ' ')}</h5>
                        <div className="pl-2 border-l-2">
                            {renderPrivileges(value, currentKey, false)}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div key={currentKey} className="flex items-center space-x-2">
                        <Checkbox
                            id={currentKey}
                            checked={data.privilege.includes(currentKey)}
                            onCheckedChange={(checked) => handleCheckboxChange(currentKey, checked as boolean)}
                        />
                        <Label htmlFor={currentKey} className="capitalize cursor-pointer text-sm font-normal">
                            {key.replace(/_/g, ' ')}
                        </Label>
                    </div>
                );
            }
        });

        if (isRoot) {
            return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{content}</div>;
        }

        return content;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                handleCancel();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        if (editingGroup) {
            put(`/setup/groups/${editingGroup.id}`, options);
        } else {
            post('/setup/groups', options);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Security Groups', href: '/setup/groups' }]}>
            <Head title="Security Groups" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Security Groups</h2>
                    <Button onClick={() => {
                        handleCancel(); // Reset any existing state
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
                    <Card className="mt-8 border-2 border-primary/20">
                        <CardHeader>
                            <CardTitle>{editingGroup ? 'Edit Security Group' : 'Create New Security Group'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <Label htmlFor="group_name">Group Name</Label>
                                    <Input
                                        id="group_name"
                                        value={data.group_name}
                                        onChange={(e) => setData('group_name', e.target.value)}
                                        className="mt-1 max-w-md"
                                        placeholder="e.g. Managers"
                                        required
                                    />
                                    {errors.group_name && <span className="text-red-500 text-sm">{errors.group_name}</span>}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base">Privileges</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleSelectAll}
                                                className="h-8"
                                            >
                                                <CheckSquare className="mr-2 h-4 w-4" /> Apply All
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveAll}
                                                className="h-8"
                                            >
                                                <Square className="mr-2 h-4 w-4" /> Remove All
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        {renderPrivileges(availablePrivileges)}
                                    </div>
                                    {errors.privilege && <span className="text-red-500 text-sm">{errors.privilege}</span>}
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>{editingGroup ? 'Update Group' : 'Save Group'}</Button>
                                    <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
