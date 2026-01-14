import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types"
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<User>[] = [
    {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return <div>{date.toLocaleDateString()}</div>;
    },
  },
]
