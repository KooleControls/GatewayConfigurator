import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";

export function InputsCategory() {
    return (
        <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-4 md:grid-cols-2">
            <CommandField command="CSHWCIC" />
        </FieldGroup>
    );
}