import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";

type TimesCategoryProps = {
    searchQuery?: string;
};

export function TimesCategory({ searchQuery = "" }: TimesCategoryProps) {
    return (
        <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-4 md:grid-cols-2">
            <CommandField command="CSHWCHA" searchQuery={searchQuery} />
            <CommandField command="CSHWCHU" searchQuery={searchQuery} />
            <CommandField command="CSHWCCA" searchQuery={searchQuery} />
            <CommandField command="CSHWCCU" searchQuery={searchQuery} />
            <CommandField command="CSHWCTT" searchQuery={searchQuery} />
            <CommandField command="CSHWHCT" searchQuery={searchQuery} />
            <CommandField command="CSHWTHC" searchQuery={searchQuery} />
            <CommandField command="CSHWMLS" searchQuery={searchQuery} />
        </FieldGroup>
    );
}