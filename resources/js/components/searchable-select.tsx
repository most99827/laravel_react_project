import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
    value: string
    label: string
}

interface SearchableSelectProps {
    options: Option[]
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
    disabled?: boolean
    loadOptions?: (query: string) => Promise<Option[]>
}

export function SearchableSelect({
    options: initialOptions = [],
    value,
    onValueChange,
    placeholder = "Select option...",
    emptyMessage = "No results found.",
    className,
    disabled = false,
    loadOptions,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [options, setOptions] = React.useState<Option[]>(initialOptions)
    const [loading, setLoading] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")

    React.useEffect(() => {
        // Only reset to initialOptions if we are NOT currently searching/loading
        // This prevents the list from flickering back to defaults if parent re-renders while user is searching
        if (searchTerm === "" && !loading) {
            setOptions(initialOptions)
        }
    }, [initialOptions, searchTerm, loading])

    React.useEffect(() => {
        if (!loadOptions) return

        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const results = await loadOptions(searchTerm)
                setOptions(results)
            } catch (error) {
                console.error("Failed to load options:", error)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm, loadOptions])

    // Find label for current value, checking both initial and loaded options in case it's not currently in the list
    // This is a simplification; ideally, we'd fetch the specific label if missing, 
    // but typically frameworks pass the full object or we preload the current value's option.
    const selectedLabel = options.find((option) => option.value === value)?.label
        || initialOptions.find((option) => option.value === value)?.label

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                    type="button"
                >
                    {value ? (selectedLabel || value) : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={!loadOptions}>
                    <CommandInput
                        placeholder={placeholder}
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList>
                        {loading && <div className="p-2 text-sm text-muted-foreground text-center">Loading...</div>}
                        {!loading && (
                            <>
                                <CommandEmpty>{emptyMessage}</CommandEmpty>
                                <CommandGroup>
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.label} // shadcn uses label for filtering if value is not provided, but here we use label as value for the item content
                                            onSelect={() => {
                                                onValueChange(option.value)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === option.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
