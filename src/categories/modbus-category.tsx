import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";

type ModbusCategoryProps = {
    searchQuery?: string;
};

export function ModbusCategory({ searchQuery = "" }: ModbusCategoryProps) {
    return (
        <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-4 md:grid-cols-2">
            <CommandField command="CSHWMTY" searchQuery={searchQuery} />
            <CommandField command="CSHWMIP" searchQuery={searchQuery} />
            <CommandField command="CSHWMPN" searchQuery={searchQuery} />
            <CommandField command="CSHWMBD" searchQuery={searchQuery} />
            <CommandField command="CSHWMTO" searchQuery={searchQuery} />
            <CommandField command="CSHWMRE" searchQuery={searchQuery} />
            <CommandField command="CSHWMIV" searchQuery={searchQuery} />
        </FieldGroup>
    );
}
