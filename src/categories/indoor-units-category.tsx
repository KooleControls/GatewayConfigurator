import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldTitle,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
    commandsStore,
    type IndoorUnitEntry,
    useCommandsStore,
} from "@/store/commands-store";

const indoorUnitFlashCommands = new Set<string>([
    "CSHWMODIUCLEAR",
    "CSHWMODIUADD",
    "CSHWMODIUADB",
]);

const indoorUnitsSearchText = [
    "indoor units",
    "indoor unit",
    "master",
    "address",
    "cshwmodiuclear",
    "cshwmodiuadd",
    "cshwmodiuadb",
].join(" ");

type IndoorUnitsCategoryProps = {
    searchQuery?: string;
};

export function IndoorUnitsCategory({ searchQuery = "" }: IndoorUnitsCategoryProps) {
    const { commands, lastChange } = useCommandsStore();
    const [isFlashing, setIsFlashing] = useState(false);

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const isSearchMatch =
        !normalizedSearch || indoorUnitsSearchText.includes(normalizedSearch);

    const entries = useMemo(() => commandsStore.getIndoorUnitEntries(commands), [commands]);

    useEffect(() => {
        const shouldFlash =
            lastChange?.source === "text" &&
            lastChange.commandKeys.some((commandKey) => indoorUnitFlashCommands.has(commandKey));

        if (!shouldFlash) {
            return;
        }

        setIsFlashing(false);
        const frame = window.requestAnimationFrame(() => {
            setIsFlashing(true);
        });
        const timeout = window.setTimeout(() => {
            setIsFlashing(false);
        }, 2000);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timeout);
        };
    }, [lastChange]);

    const updateEntries = (nextEntries: IndoorUnitEntry[]) => {
        commandsStore.setIndoorUnitEntries(nextEntries);
    };

    if (!isSearchMatch) {
        return null;
    }

    return (
        <FieldGroup className="gap-3 px-2 pb-4">
            <Field className={cn("gap-2", isFlashing && "command-flash")}>
                <FieldTitle className="text-sm">Indoor Units</FieldTitle>
                <FieldDescription>
                    Raw commands always keep order: CSHWMODIUCLEAR, then each indoor-unit add command.
                </FieldDescription>
                <FieldContent className="gap-2">
                    {entries.map((entry, index) => (
                        <div key={`${entry.command}-${index}`} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
                            <Input
                                type="number"
                                placeholder="320"
                                value={entry.address}
                                onChange={(event) => {
                                    const sanitizedAddress = event.target.value.replace(/\D/g, "");
                                    const nextEntries = entries.map((currentEntry, currentIndex) =>
                                        currentIndex === index
                                            ? { ...currentEntry, address: sanitizedAddress }
                                            : currentEntry,
                                    );

                                    updateEntries(nextEntries);
                                }}
                            />
                            <label className="flex h-9 items-center gap-2 rounded-md border border-input px-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="size-4"
                                    checked={entry.isMaster}
                                    onChange={(event) => {
                                        const nextEntries = entries.map((currentEntry, currentIndex) =>
                                            currentIndex === index
                                                ? { ...currentEntry, isMaster: event.target.checked }
                                                : currentEntry,
                                        );

                                        updateEntries(nextEntries);
                                    }}
                                />
                                <span>Master</span>
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const nextEntries = entries.filter((_, currentIndex) => currentIndex !== index);
                                    updateEntries(nextEntries);
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="secondary"
                        className="w-fit"
                        onClick={() => {
                            updateEntries([
                                ...entries,
                                { command: "CSHWMODIUADD", address: "320", isMaster: true },
                            ]);
                        }}
                    >
                        Add Indoor Unit
                    </Button>
                </FieldContent>
            </Field>
        </FieldGroup>
    );
}
