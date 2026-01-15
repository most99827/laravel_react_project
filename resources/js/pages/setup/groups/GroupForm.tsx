import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, Square } from 'lucide-react';
import { store, update } from '@/routes/groups';

interface Props {
    group: any | null;
    availablePrivileges: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function GroupForm({ group, availablePrivileges, onSuccess, onCancel }: Props) {
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

    // Transform the nested JSON object from DB back to flat array for checkboxes
    const initialPrivileges = group && group.privilege ? getAllKeys(group.privilege) : [];

    const { data, setData, post, put, processing, errors, transform } = useForm({
        group_name: group?.group_name || '',
        privilege: initialPrivileges as string[],
    });

    // Transform data before submission
    transform((data) => ({
        ...data,
        privilege: buildPrivilegeObject(data.privilege),
    }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                onSuccess();
            }
        };

        if (group) {
            put(update({ group: group.id }).url, options);
        } else {
            post(store().url, options);
        }
    };

    const handleCheckboxChange = (permissionKey: string, checked: boolean) => {
        if (checked) {
            setData('privilege', [...data.privilege, permissionKey]);
        } else {
            setData('privilege', data.privilege.filter((p) => p !== permissionKey));
        }
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


    return (
        <Card className="mt-8 border-2 border-primary/20">
            <CardHeader>
                <CardTitle>{group ? 'Edit Security Group' : 'Create New Security Group'}</CardTitle>
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
                        <Button type="submit" disabled={processing}>{group ? 'Update Group' : 'Save Group'}</Button>
                        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
