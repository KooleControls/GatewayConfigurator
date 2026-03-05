import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";

export function TimesCategory() {
    return (
        <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-4 md:grid-cols-2">
            <CommandField command="CSHWCHA" />
            <CommandField command="CSHWCHU" />
            <CommandField command="CSHWCCA" />
            <CommandField command="CSHWCCU" />
            <CommandField command="CSHWCTT" />
            <CommandField command="CSHWHCT" />
            <CommandField command="CSHWTHC" />
            <CommandField command="CSHWMLS" />
        </FieldGroup>
    );
}