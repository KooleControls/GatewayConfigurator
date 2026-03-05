import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";
import { IndoorUnitsCategory } from "./indoor-units-category";

type HvacCategoryProps = {
    searchQuery?: string;
};

export function HvacCategory({ searchQuery = "" }: HvacCategoryProps) {
    return (
        <div className="space-y-4">
            <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-2 md:grid-cols-2">
                <CommandField command="CSHWCHT" searchQuery={searchQuery} />
                <CommandField command="CSHWCCT" searchQuery={searchQuery} />
                <CommandField command="CSHWBOR" searchQuery={searchQuery} />
                <CommandField command="CSHWCFS" searchQuery={searchQuery} />
                <CommandField command="CSHWCSW" searchQuery={searchQuery} />
                <CommandField command="CSHWRAE" searchQuery={searchQuery} />
            </FieldGroup>
            <IndoorUnitsCategory searchQuery={searchQuery} />
        </div>
    );
}
