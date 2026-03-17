import { useMemo } from "react";
import { CommandField } from "@/components/command-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { IndoorUnitsCategory } from "./indoor-units-category";
import { HvacUnitsCategory } from "./hvac-units-category";
import { commandsStore, useCommandsStore } from "@/store/commands-store";

type HvacCategoryProps = {
    searchQuery?: string;
};

export function HvacCategory({ searchQuery = "" }: HvacCategoryProps) {
    const { commands } = useCommandsStore();

    const hasLegacy = useMemo(() => commandsStore.hasLegacyHvacCommands(commands), [commands]);
    const hasNew = useMemo(() => commandsStore.hasNewHvacCommands(commands), [commands]);

    // Show legacy UI only when legacy commands are present and no new-style commands exist
    const showLegacy = hasLegacy && !hasNew;

    return (
        <div className="space-y-4">
            {showLegacy ? (
                <>
                    <div className="flex items-center gap-2 px-2">
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Legacy mode</Badge>
                        <span className="text-xs text-muted-foreground">
                            Using deprecated CSHWCHT/CSHWCCT + indoor-unit commands.
                        </span>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="ml-auto"
                            onClick={() => commandsStore.upgradeLegacyHvac()}
                        >
                            Upgrade to CSHWHVAC
                        </Button>
                    </div>
                    <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-2 md:grid-cols-2">
                        <CommandField command="CSHWCHT" searchQuery={searchQuery} />
                        <CommandField command="CSHWCCT" searchQuery={searchQuery} />
                        <CommandField command="CSHWBOR" searchQuery={searchQuery} />
                        <CommandField command="CSHWCFS" searchQuery={searchQuery} />
                        <CommandField command="CSHWCSW" searchQuery={searchQuery} />
                        <CommandField command="CSHWRAE" searchQuery={searchQuery} />
                    </FieldGroup>
                    <IndoorUnitsCategory searchQuery={searchQuery} />
                </>
            ) : (
                <>
                    <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-2 md:grid-cols-2">
                        <CommandField command="CSHWCFS" searchQuery={searchQuery} />
                        <CommandField command="CSHWCSW" searchQuery={searchQuery} />
                        <CommandField command="CSHWRAE" searchQuery={searchQuery} />
                    </FieldGroup>
                    <HvacUnitsCategory searchQuery={searchQuery} />
                </>
            )}
        </div>
    );
}
