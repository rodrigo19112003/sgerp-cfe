"use client";
import { User } from "@/types/types/model/users";
import UserRoles from "@/types/enums/user_roles";
import { FC, useContext } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import AuthContext from "@/contexts/auth/context";

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
    const profile = useContext(AuthContext);
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
                            className={`${
                                profile.userProfile?.employeeNumber !==
                                user.employeeNumber
                                    ? "text-gray-800 hover:text-red-500"
                                    : ""
                            }flex items-center justify-center `}
                            disabled={
                                profile.userProfile?.employeeNumber ===
                                user?.employeeNumber
                            }
                            onClick={() => onDelete(user)}
                        >
                            <FaTrashAlt />
                        </button>
                    </li>
                    <li className="flex justify-center items-center">
                        <button
                            className={`${
                                profile.userProfile?.employeeNumber !==
                                user.employeeNumber
                                    ? "text-gray-800 hover:text-red-500"
                                    : ""
                            }flex items-center justify-center `}
                            disabled={
                                profile.userProfile?.employeeNumber ===
                                user?.employeeNumber
                            }
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
