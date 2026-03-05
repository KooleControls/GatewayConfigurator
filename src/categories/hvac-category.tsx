import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";
import { IndoorUnitsCategory } from "./indoor-units-category";

export function HvacCategory() {
    return (
        <div className="space-y-4">
            <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-2 md:grid-cols-2">
                <CommandField command="CSHWCHT" />
                <CommandField command="CSHWCCT" />
                <CommandField command="CSHWBOR" />
            </FieldGroup>
            <IndoorUnitsCategory />
        </div>
    );
}
