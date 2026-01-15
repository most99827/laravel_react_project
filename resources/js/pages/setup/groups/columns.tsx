import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

export interface SysAdminGroup {
    id: number;
    group_name: string;
    privilege: any;
    created_at: string;
}

interface UseColumnsProps {
    onParamsChange: (params: any) => void;
    handleEdit: (group: SysAdminGroup) => void;
    handleDelete: (group: SysAdminGroup) => void;
}

export const useColumns = ({
    onParamsChange,
    handleEdit,
    handleDelete,
}: UseColumnsProps): ColumnDef<SysAdminGroup>[] => {
    return [
        {
            accessorKey: "group_name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            onParamsChange({ sort: "group_name", direction: "asc" })
                        }
                    >
                        Group Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="lowercase">{row.getValue("group_name")}</div>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            cell: ({ row }) =>
                new Date(row.getValue("created_at")).toLocaleDateString(),
        },
        {
            id: "actions",
            header: "Actions",
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
                                    This action cannot be undone. This will
                                    permanently delete the group
                                    <strong> {group.group_name}</strong> and
                                    remove it from our servers.
                                </>
                            }
                            onContinue={() => handleDelete(group)}
                        />
                    </div>
                );
            },
        },
    ];
};
