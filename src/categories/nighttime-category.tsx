import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";

type NighttimeCategoryProps = {
    searchQuery?: string;
};

export function NighttimeCategory({ searchQuery = "" }: NighttimeCategoryProps) {
    return (
        <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-4 md:grid-cols-2">
            <CommandField command="CSHWDTN" searchQuery={searchQuery} />
            <CommandField command="CSHWTVN" searchQuery={searchQuery} />
            <CommandField command="CSHWCDN" searchQuery={searchQuery} />
            <CommandField command="CSHWENT" searchQuery={searchQuery} />
            <CommandField command="CSHWNTR" searchQuery={searchQuery} />
            <CommandField command="CSHWNTD" searchQuery={searchQuery} />
        </FieldGroup>
    );
}