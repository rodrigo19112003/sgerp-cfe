"use client";
import { User } from "@/types/types/model/users";
import UserRoles from "@/types/enums/user_roles";
import { FC } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";

type UsersProps = {
    users: {
        id: number;
        employeeNumber: string;
        fullName: string;
        email: string;
        roles: UserRoles[];
    }[];
    onDelete: (user: User) => void;
    onModify: (user: User) => void;
};

export const Users: FC<UsersProps> = ({ users, onDelete, onModify }) => {
    return (
        <>
            {users.map((user) => (
                <ul
                    key={user.id}
                    className="grid grid-cols-4 gap-4 sm:gap-6 lg:gap-8 bg-gray-50 p-4 border border-gray-300"
                >
                    <li className="flex justify-center items-center">
                        <p className="text-xs sm:text-sm lg:text-base font-regular text-gray-800 text-center break-words">
                            {user.employeeNumber}
                        </p>
                    </li>
                    <li className="flex justify-center items-center">
                        <p className="text-xs sm:text-sm lg:text-base font-regular text-gray-800 text-center break-words">
                            {user.fullName}
                        </p>
                    </li>
                    <li className="flex justify-center items-center">
                        <button
                            className="flex items-center justify-center text-gray-800 hover:text-red-500"
                            onClick={() => onDelete(user)}
                        >
                            <FaTrashAlt />
                        </button>
                    </li>
                    <li className="flex justify-center items-center">
                        <button
                            className="flex items-center justify-center text-gray-800 hover:text-red-500"
                            onClick={() => onModify(user)}
                        >
                            <FaEdit />
                        </button>
                    </li>
                </ul>
            ))}
        </>
    );
};
