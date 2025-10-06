"use client";
import { IconButton } from "@/components/buttons/IconButton";
import { useParam } from "@/hooks/useParam";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ChangeEventHandler,
    FormEventHandler,
    useEffect,
    useState,
} from "react";
import { IoSearch } from "react-icons/io5";

type SearchbarProps = {
    placeholder?: string;
    buttonSearchTittle: string;
};

export const Searchbar = ({
    placeholder,
    buttonSearchTittle,
}: SearchbarProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { paramValue: searchParam } = useParam("busqueda", "");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchQueryChange: ChangeEventHandler<HTMLInputElement> = (
        e
    ) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        const sanitizedSearchQuery = searchQuery.trim().toLowerCase();

        const params = new URLSearchParams(searchParams);
        if (sanitizedSearchQuery) {
            params.set("busqueda", sanitizedSearchQuery);
        } else {
            params.delete("busqueda");
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        setSearchQuery(searchParam);
    }, [searchParam]);

    return (
        <form onSubmit={handleSearch} className="flex items-center mb-9">
            <input
                type="text"
                placeholder={placeholder}
                className="mr-5"
                value={searchQuery}
                onChange={handleSearchQueryChange}
            />
            <IconButton type="submit" title={buttonSearchTittle}>
                <IoSearch />
            </IconButton>
        </form>
    );
};
