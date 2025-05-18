import React from "react";
import Image from "next/image";

// Example props: user = { name, email, avatarUrl, role }
const Profile = ({ user }) => {
    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg flex flex-col items-center">
            <div className="mb-4">
                <Image
                    src={user?.avatarUrl || "/default-avatar.png"}
                    alt="User Avatar"
                    width={96}
                    height={96}
                    className="rounded-full object-cover border"
                />
            </div>
            <h2 className="text-2xl font-bold mb-2">{user?.name || "User"}</h2>
            <p className="text-gray-600 mb-1">{user?.email || "No email provided"}</p>
            <p className="text-blue-500 font-semibold">{user?.role || "Member"}</p>
        </div>
    );
};

export default Profile;
