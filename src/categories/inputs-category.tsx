import { CommandField } from "@/components/command-field";
import { FieldGroup } from "@/components/ui/field";

type InputsCategoryProps = {
    searchQuery?: string;
};

export function InputsCategory({ searchQuery = "" }: InputsCategoryProps) {
    return (
        <FieldGroup className="grid grid-cols-1 gap-6 px-2 pb-4 md:grid-cols-2">
            <CommandField command="CSHWCIC" searchQuery={searchQuery} />
            <CommandField command="CSHWRDR" searchQuery={searchQuery} />
        </FieldGroup>
    );
}