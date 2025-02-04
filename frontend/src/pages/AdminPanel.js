import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../components/Navigation';
import { Link } from 'react-router-dom';
import AdminTab from '../components/AdminTab';

const AdminPanel = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [category, setCategory] = useState('web-server');
    const [data, setData] = useState([]);

    // Challenge input fields
    const [newCategory, setNewCategory] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState(0);
    const [flag, setFlag] = useState('');
    const [dockerImage, setDockerImage] = useState('');
    const [dropletName, setDropletName] = useState('');
    const [dropletSize, setDropletSize] = useState('');

    // Fixed values
    const dashboardPort = 80;  // Fixed external port
    const internalPort = 8080; // Fixed internal port

    // Check if user is admin
    useEffect(() => {
        axios.get("http://localhost:3000/api/user/profile", {
            headers: { "Authorization": "Bearer " + localStorage.getItem('token') }
        })
            .then((response) => {
                if (response.data.data.role === 2) {
                    setIsAdmin(true);
                }
            })
            .catch(error => console.error("Error fetching user profile:", error));
    }, []);

    // Fetch challenges based on category
    useEffect(() => {
        getChallenges(category);
    }, [category]);

    const getChallenges = (selectedCategory) => {
        axios.get(`http://localhost:3000/api/chall/getChallenges/${selectedCategory}`, {
            headers: { "Authorization": "Bearer " + localStorage.getItem('token') }
        })
            .then((res) => setData(res.data.data))
            .catch(error => console.error("Error fetching challenges:", error));
    };

    // Create Challenge function
    const createChallenge = async (event) => {
        event.preventDefault(); // Prevent page reload

        if (!name || !description || !points || !flag || !dockerImage || !dropletName || !dropletSize) {
            alert("Please fill all required fields.");
            return;
        }

        await axios.post(`http://localhost:3000/api/chall/create/${category}`, {
            name,
            description,
            points,
            flags: flag,
            docker_image: dockerImage,
            droplet_name: dropletName,
            droplet_size: dropletSize,
            dashboard_port: dashboardPort // Fixed value
        }, {
            headers: { "Authorization": "Bearer " + localStorage.getItem('token') }
        })
            .then(res => {
                alert("Challenge Created at: " + res.data.challenge_url);
                getChallenges(category);
            })
            .catch(err => {
                alert("Error creating challenge.");
                console.error(err);
            });
    };

    return (
        <div>
            <Navigation />
            {!isAdmin ? (
                <div className="double-divider title header">
                    You do not have access to this page. Please go back to the Home page.
                    <div className="divider centered">
                        <button className="button is-link">
                            <Link to="/">Home page</Link>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="double-divider centered">
                    <h2 className="title">Admin Panel - Manage Challenges</h2>

                    {/* Category Selection */}
                    <div className="field">
                        <label className="label">Select a Category</label>
                        <div className="select">
                            <select onChange={(e) => setCategory(e.target.value)}>
                                <option value="web-server">Web Server</option>
                                <option value="steganography">Steganography</option>
                                <option value="cracking">Cracking</option>
                                <option value="programmation">Programming</option>
                                <option value="cryptography">Cryptography</option>
                                <option value="add">Add a new category</option>
                            </select>
                        </div>
                    </div>

                    {/* Display Challenges */}
                    {category !== "add" ? (
                        <div className="table-container">
                            <table className="table is-hoverable is-fullwidth is-striped">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Points</th>
                                    <th>Validated Users</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.map((chall) => <AdminTab key={"Tab" + chall._id} chall={chall} />)}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="field">
                            <label className="label">New Category Name</label>
                            <input className="input" type="text" onChange={(e) => setNewCategory(e.target.value)} placeholder="Enter new category" required />
                        </div>
                    )}

                    {/* Challenge Creation Form */}
                    <h3 className="title">Create a New Challenge</h3>
                    <form onSubmit={createChallenge}>
                        <div className="field">
                            <label className="label">Challenge Name</label>
                            <input className="input" type="text" onChange={(e) => setName(e.target.value)} placeholder="Challenge Name" required />
                        </div>

                        <div className="field">
                            <label className="label">Description</label>
                            <input className="input" type="text" onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
                        </div>

                        <div className="field">
                            <label className="label">Points</label>
                            <input className="input" type="number" onChange={(e) => setPoints(e.target.value)} placeholder="Points" required />
                        </div>

                        <div className="field">
                            <label className="label">Flag</label>
                            <input className="input" type="text" onChange={(e) => setFlag(e.target.value)} placeholder="CTF Flag" required />
                        </div>

                        <div className="field">
                            <label className="label">Docker Image</label>
                            <input className="input" type="text" onChange={(e) => setDockerImage(e.target.value)} placeholder="Docker Image (e.g. ctfd/ctfd:latest)" required />
                        </div>

                        <div className="field">
                            <label className="label">Droplet Name</label>
                            <input className="input" type="text" onChange={(e) => setDropletName(e.target.value)} placeholder="Droplet Name" required />
                        </div>

                        <div className="field">
                            <label className="label">Droplet Size</label>
                            <input className="input" type="text" onChange={(e) => setDropletSize(e.target.value)} placeholder="Droplet Size (e.g. s-1vcpu-2gb)" required />
                        </div>

                        {/* Ports are fixed to 80:8080 */}
                        <div className="field">
                            <p className="control">
                                <strong>Dashboard Port:</strong> {dashboardPort}
                            </p>
                            <p className="control">
                                <strong>Internal Port:</strong> {internalPort}
                            </p>
                        </div>

                        <div className="field">
                            <button className="button is-primary" type="submit">Create Challenge</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
