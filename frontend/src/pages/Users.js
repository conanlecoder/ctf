import React, { useState, useEffect } from "react";
import axios from "axios";
import Navigation from "../components/Navigation";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if the current user is an admin
        axios
            .get("http://localhost:3000/api/user/profile", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            })
            .then((response) => {
                if (response.data.data.role === 2) {
                    setIsAdmin(true);
                    fetchUsers();
                }
            })
            .catch((error) => {
                console.error("Error fetching user profile:", error);
            });
    }, []);

    const fetchUsers = () => {
        axios
            .get("http://localhost:3000/api/user/getAllUsers", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            })
            .then((response) => {
                setUsers(response.data.data);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            });
    };

    const updateUserRole = (userId, role) => {
        axios
            .patch(
                `http://localhost:3000/api/user/updateRole/${userId}`,
                { role },
                {
                    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
                }
            )
            .then(() => {
                alert("User role updated successfully!");
                fetchUsers(); // Refresh the user list
            })
            .catch((error) => {
                console.error("Error updating user role:", error);
            });
    };

    return (
        <div>
            <Navigation />
            {isAdmin ? (
                <div className="container">
                    <h1 className="title">Manage Users</h1>
                    <table className="table is-fullwidth is-striped">
                        <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.username}</td>
                                <td>{user.role === 2 ? "Admin" : "User"}</td>
                                <td>
                                    <button
                                        className="button is-warning"
                                        onClick={() => updateUserRole(user._id, user.role === 2 ? 1 : 2)}
                                    >
                                        {user.role === 2 ? "Demote to User" : "Promote to Admin"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="title header">
                    You do not have access to this page.
                </div>
            )}
        </div>
    );
};

export default Users;