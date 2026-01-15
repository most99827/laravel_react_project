import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { useMemo } from 'react';
import { store, update } from '@/routes/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/searchable-select';
import { User } from '@/types';

interface SysAdminGroup {
    id: number;
    group_name: string;
}

interface UserFormProps {
    user: User | null;
    sys_admin_groups: SysAdminGroup[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UserForm({ user, sys_admin_groups, onSuccess, onCancel }: UserFormProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        group_id: user?.group_id?.toString() || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                reset();
                onSuccess();
            }
        };

        if (user) {
            put(update({ user: user.id }).url, options);
        } else {
            post(store().url, options);
        }
    };

    const loadGroups = async (query: string) => {
        const response = await axios.get('/setup/groups/search', { params: { query } });
        return response.data;
    };

    const groupOptions = useMemo(() => sys_admin_groups.map(group => ({
        value: group.id.toString(),
        label: group.group_name
    })), [sys_admin_groups]);

    return (
        <Card className="mt-8 border-2 border-primary/20">
            <CardHeader>
                <CardTitle>{user ? 'Edit User' : 'Create New User'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1"
                                placeholder="John Doe"
                                required
                            />
                            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1"
                                placeholder="john@example.com"
                                required
                            />
                            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                        </div>

                        <div>
                            <Label htmlFor="password">Password {user && '(Leave blank to keep current)'}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1"
                                required={!user}
                            />
                            {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
                        </div>

                        <div>
                            <Label htmlFor="group_id">Security Group</Label>
                            <SearchableSelect
                                value={data.group_id}
                                onValueChange={(value) => setData('group_id', value)}
                                options={groupOptions}
                                loadOptions={loadGroups}
                                placeholder="Select a Group"
                                disabled={false}
                            />
                            {errors.group_id && <span className="text-red-500 text-sm">{errors.group_id}</span>}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>{user ? 'Update User' : 'Save User'}</Button>
                        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
