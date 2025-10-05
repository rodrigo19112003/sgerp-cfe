"use client";
import { NavbarLink } from "@/types/types/components/navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, useState } from "react";
import { IconButton } from "../buttons/IconButton";
import { MdMenu } from "react-icons/md";

type NavbarProps = {
    links: NavbarLink[];
};

export const Navbar: FC<NavbarProps> = ({ links }) => {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    const baseLinkStyle =
        "w-full md:w-auto py-3 md:mr-5 inline-block text-base font-medium no-underline transition-colors md:hover:text-green-800 mb-1 md:mb-0 rounded-lg md:rounded-none md:px-0";
    const activeLinkStyle =
        "px-3 md:px-0 w-full md:w-auto bg-green-cfe md:bg-transparent py-3 md:mr-5 inline-block text-base font-medium no-underline transition-colors text-white md:text-green-cfe mb-1 md:mb-0 rounded-lg md:rounded-none";

    return (
        <nav>
            <IconButton
                onClick={() => setIsVisible((prevValue) => !prevValue)}
                className="bg-white hover:bg-gray-50 block md:hidden"
            >
                <MdMenu className="text-gray-800" />
            </IconButton>
            <ul
                className={`absolute w-full p-3 bg-gray-50 md:bg-transparent -mx-3 mt-3 md:m-0 md:relative md:p-0 md:flex rounded-lg md:rounded-none ${
                    isVisible ? "block" : "hidden"
                } md:block border border-gray-300 md:border-none`}
            >
                {links.map((link) => (
                    <li key={link.route}>
                        <Link
                            onClick={() => setIsVisible(false)}
                            className={
                                pathname === link.route
                                    ? activeLinkStyle
                                    : baseLinkStyle
                            }
                            href={link.route}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
