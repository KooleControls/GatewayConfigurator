import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";

export function ModbusCategory() {
    return (
        <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-4 md:grid-cols-2">
            <CommandField command="CSHWMTY" />
            <CommandField command="CSHWMIP" />
            <CommandField command="CSHWMPN" />
            <CommandField command="CSHWMBD" />
            <CommandField command="CSHWMTO" />
            <CommandField command="CSHWMRE" />
            <CommandField command="CSHWMIV" />
        </FieldGroup>
    );
}
