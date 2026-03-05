import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";

type ThermostatCategoryProps = {
    searchQuery?: string;
};

export function ThermostatCategory({ searchQuery = "" }: ThermostatCategoryProps) {
    return (
        <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-4 md:grid-cols-2">
            <CommandField command="CSHWTHR" searchQuery={searchQuery} />
            <CommandField command="CSHWMIT" searchQuery={searchQuery} />
            <CommandField command="CSHWMXT" searchQuery={searchQuery} />
            <CommandField command="CSHWSCC" searchQuery={searchQuery} />
            <CommandField command="CSHWMCT" searchQuery={searchQuery} />
            <CommandField command="CSHWHYS" searchQuery={searchQuery} />
        </FieldGroup>
    );
}