import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldTitle,
    FieldGroup,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
    commandsStore,
    type HvacUnitEntry,
    useCommandsStore,
} from "@/store/commands-store";

const hvacUnitCommand = "CSHWHVAC";

const hvacUnitsSearchText = [
    "hvac units",
    "hvac unit",
    "cshwhvac",
    "indoor",
    "master",
    "heating",
    "cooling",
    "address",
].join(" ");

const hvacTypeOptions = [
    { value: 0, label: "NA (0)" },
    { value: 1, label: "OTH - Opentherm (1)" },
    { value: 2, label: "REL - Relais on/off (2)" },
    { value: 3, label: "SAM - Samsung via Intesis (3, Deprecated)" },
    { value: 4, label: "DAI - Daikin RTD-NET Modbus RTU (4)" },
    { value: 5, label: "CMN - Cool Master Net (5)" },
    { value: 6, label: "CMA - Cool Master Net for Aedes (6)" },
    { value: 7, label: "MIT - Mitsubishi via Intesis RTU (7)" },
    { value: 8, label: "COP - Coolplug via Modbus RTU (8)" },
];

type HvacUnitsCategoryProps = {
    searchQuery?: string;
};

export function HvacUnitsCategory({ searchQuery = "" }: HvacUnitsCategoryProps) {
    const { commands, hoveredCommand, lastChange } = useCommandsStore();
    const [isFlashing, setIsFlashing] = useState(false);
    const isHoveredFromList = hoveredCommand === hvacUnitCommand;

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const isSearchMatch =
        !normalizedSearch || hvacUnitsSearchText.includes(normalizedSearch);

    const entries = useMemo(() => commandsStore.getHvacUnitEntries(commands), [commands]);

    useEffect(() => {
        const shouldFlash =
            lastChange?.source === "text" &&
            lastChange.commandKeys.includes(hvacUnitCommand);

        if (!shouldFlash) return;

        setIsFlashing(false);
        const frame = window.requestAnimationFrame(() => setIsFlashing(true));
        const timeout = window.setTimeout(() => setIsFlashing(false), 2000);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timeout);
        };
    }, [lastChange]);

    const updateEntries = (nextEntries: HvacUnitEntry[]) => {
        commandsStore.setHvacUnitEntries(nextEntries);
    };

    if (!isSearchMatch) return null;

    return (
        <FieldGroup className="gap-3 px-2 pb-4">
            <Field
                className={cn(
                    "gap-2",
                    isFlashing && "command-flash",
                    isHoveredFromList && "bg-primary/10 ring-1 ring-primary/50",
                )}
                onMouseEnter={() => commandsStore.setHoveredCommand(hvacUnitCommand)}
                onMouseLeave={() => commandsStore.setHoveredCommand(null)}
            >
                <FieldTitle className="text-sm">HVAC Units</FieldTitle>
                <FieldDescription>
                    Configure up to 10 HVAC units. Each unit has its own type, address, and behavior flags.
                </FieldDescription>
                <FieldContent className="gap-3">
                    {entries.map((entry, index) => (
                        <div
                            key={`hvac-${entry.id}`}
                            className="rounded-md border p-3 space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Unit {entry.id}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const nextEntries = entries.filter((_, i) => i !== index);
                                        updateEntries(nextEntries);
                                    }}
                                >
                                    Remove
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Type</label>
                                    <Select
                                        value={String(entry.type)}
                                        onValueChange={(value) => {
                                            const nextEntries = entries.map((e, i) =>
                                                i === index ? { ...e, type: parseInt(value, 10) } : e,
                                            );
                                            updateEntries(nextEntries);
                                        }}
                                    >
                                        <SelectTrigger className="h-9 w-full bg-background text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hvacTypeOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={String(option.value)}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Address</label>
                                    <Input
                                        type="number"
                                        placeholder="320"
                                        min={0}
                                        max={65535}
                                        value={entry.address}
                                        onChange={(event) => {
                                            const sanitized = event.target.value.replace(/\D/g, "");
                                            const nextEntries = entries.map((e, i) =>
                                                i === index ? { ...e, address: sanitized } : e,
                                            );
                                            updateEntries(nextEntries);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {([
                                    ["master", "Master"],
                                    ["heating", "Heating"],
                                    ["cooling", "Cooling"],
                                    ["allowConflictingMode", "Allow Conflicting Mode"],
                                ] as const).map(([flag, label]) => (
                                    <label
                                        key={flag}
                                        className="flex items-center gap-1.5 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            className="size-4"
                                            checked={entry[flag]}
                                            onChange={(event) => {
                                                const nextEntries = entries.map((e, i) =>
                                                    i === index
                                                        ? { ...e, [flag]: event.target.checked }
                                                        : e,
                                                );
                                                updateEntries(nextEntries);
                                            }}
                                        />
                                        <span>{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {entries.length < 10 && (
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-fit"
                            onClick={() => {
                                const nextId = entries.length > 0
                                    ? Math.max(...entries.map((e) => e.id)) + 1
                                    : 0;
                                updateEntries([
                                    ...entries,
                                    {
                                        id: Math.min(nextId, 9),
                                        type: 0,
                                        address: "320",
                                        master: entries.length === 0,
                                        heating: true,
                                        cooling: true,
                                        allowConflictingMode: false,
                                    },
                                ]);
                            }}
                        >
                            Add HVAC Unit
                        </Button>
                    )}
                </FieldContent>
            </Field>
        </FieldGroup>
    );
}
