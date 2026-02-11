"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "use-debounce";

export interface ComboboxOption {
    value: string;
    label: string;
    subtitle?: string;
    metadata?: any;
}

interface ComboboxProps {
    options?: ComboboxOption[];
    value?: string;
    onValueChange?: (value: string, option?: ComboboxOption) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    fetchOptions?: (search: string) => Promise<ComboboxOption[]>;
    disabled?: boolean;
    className?: string;
}

export function Combobox({
    options: staticOptions = [],
    value,
    onValueChange,
    placeholder = "Selecione...",
    searchPlaceholder = "Buscar...",
    emptyText = "Nenhum resultado encontrado.",
    fetchOptions,
    disabled = false,
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [debouncedSearch] = useDebounce(search, 300);
    const [options, setOptions] = React.useState<ComboboxOption[]>(staticOptions);
    const [isLoading, setIsLoading] = React.useState(false);

    // Fetch options when search changes (if fetchOptions is provided)
    React.useEffect(() => {
        if (!fetchOptions) {
            setOptions(staticOptions);
            return;
        }

        const loadOptions = async () => {
            setIsLoading(true);
            try {
                const results = await fetchOptions(debouncedSearch);
                setOptions(results);
            } catch (error) {
                console.error("Error fetching options:", error);
                setOptions([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadOptions();
    }, [debouncedSearch, fetchOptions, staticOptions]);

    const selectedOption = options.find((option) => option.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command shouldFilter={!fetchOptions}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>{emptyText}</CommandEmpty>
                                <CommandGroup>
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            onSelect={(currentValue) => {
                                                onValueChange?.(
                                                    currentValue === value ? "" : currentValue,
                                                    option
                                                );
                                                setOpen(false);
                                                setSearch("");
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === option.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span>{option.label}</span>
                                                {option.subtitle && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {option.subtitle}
                                                    </span>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
