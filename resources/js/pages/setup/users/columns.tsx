import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface UseColumnsProps {
  onParamsChange: (params: any) => void;
  handleEdit: (user: User) => void;
  handleDelete: (user: User) => void;
}

export const useColumns = ({
  onParamsChange,
  handleEdit,
  handleDelete,
}: UseColumnsProps): ColumnDef<User>[] => {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              onParamsChange({ sort: "name", direction: "asc" })
            }
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              onParamsChange({ sort: "email", direction: "asc" })
            }
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "group.group_name",
      header: "Group",
      cell: ({ row }) => (
        <div>{(row.original as any).group?.group_name || "No Group"}</div>
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
                  This action cannot be undone. This will
                  permanently delete the user
                  <strong> {user.name}</strong> and remove
                  their data from our servers.
                </>
              }
              onContinue={() => handleDelete(user)}
            />
          </div>
        );
      },
    },
  ];
};
