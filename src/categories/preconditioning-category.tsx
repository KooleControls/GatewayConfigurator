import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";

export function PreconditioningCategory() {
    return (
        <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-4 md:grid-cols-2">
            <CommandField command="CSHWPTM" />
            <CommandField command="CSHWPHT" />
            <CommandField command="CSHWPCT" />
            <CommandField command="CSHWATS" />
            <CommandField command="CSHWETS" />
            <CommandField command="CSHWDHC" />
            <CommandField command="CSHWDCC" />
        </FieldGroup>
    );
}