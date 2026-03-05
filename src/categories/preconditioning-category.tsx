import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";

type PreconditioningCategoryProps = {
    searchQuery?: string;
};

export function PreconditioningCategory({ searchQuery = "" }: PreconditioningCategoryProps) {
    return (
        <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-4 md:grid-cols-2">
            <CommandField command="CSHWPTM" searchQuery={searchQuery} />
            <CommandField command="CSHWPHT" searchQuery={searchQuery} />
            <CommandField command="CSHWPCT" searchQuery={searchQuery} />
            <CommandField command="CSHWATS" searchQuery={searchQuery} />
            <CommandField command="CSHWETS" searchQuery={searchQuery} />
            <CommandField command="CSHWDHC" searchQuery={searchQuery} />
            <CommandField command="CSHWDCC" searchQuery={searchQuery} />
        </FieldGroup>
    );
}