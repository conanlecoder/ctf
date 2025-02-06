const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const createUser = async (req, res) => {
    try {
        req.body.role = 1;
        var newUser = await User.create(req.body);
        var token = jwt.sign(
            { _id: newUser._id },
            process.env.JWT_SECRET,
            {
                expiresIn: "3h",
            }
        );
        newUser.token = token;
        newUser.password = null;
        res.status(201).json({success: true, msg: "Successfully created your account.", user: newUser});
    } catch (err) {
        console.log(err)
        res.status(400).json({success: false, msg: "Error during creation of your account."});
    }
}
const updateUserRole = async (req, res, user_id) => {
    try {
        const { role } = req.body;
        if (role !== 1 && role !== 2) {
            return res.status(400).json({ success: false, msg: "Invalid role value." });
        }
        await User.findByIdAndUpdate(user_id, { role });
        res.status(200).json({ success: true, msg: "User role updated successfully." });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Error updating user role." });
    }
};
const getProfile = async (req, res) => {
    try {
        res.status(200).json({success: true, msg: "Successfully Found your profile", data: req.user});
    } catch (err) {
        res.status(400).json({success: false, msg: "This account do not exists"});
    }
}

const loginUser = async (req, res) => {
    try {
        var tempUser = await User.findOne({username: req.body.username});
        if (!tempUser) {
            res.status(404).json({success: false, msg: "Error during logging to your account."});
            return;
        }
        var isMatch = await tempUser.checkPassword(req.body.password, tempUser.password);

        if (!isMatch) {
            res.status(401).json({success: false, msg: "Error during logging to your account."});
            return;
        }

        var token = jwt.sign(
            { _id: tempUser._id },
            process.env.JWT_SECRET,
            {
                expiresIn: "3h",
            }
        );
        tempUser.token = token;
        tempUser.password = null;
        res.status(201).json({success: true, msg: "Successfully logged to your account.", user: tempUser});
    } catch (err) {
        console.log(err)
        res.status(400).json({success: false, msg: "Error during logging of your account."});
    }
}

const updateUser = async (req, res, user_id) => {
    try {
        req.body.role = 1;
        await User.findByIdAndUpdate(user_id, req.body);
        res.status(200).json({success: true, msg: "Successfully updated your account."});
    } catch (err) {
        res.status(400).json({success: false, msg: "Error during update of your account."});
    }
}

const deleteUser = async (req, res, user_id) => {
    try {
        await User.findByIdAndDelete(user_id);
        res.status(200).json({success: true, msg: "Successfully deleted your account."});
    } catch (err) {
        res.status(400).json({success: false, msg: "Error during deletion of your account."});
    }
}
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password -token'); // Exclude sensitive data
        res.status(200).json({ success: true, msg: "Users retrieved successfully.", data: users });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Error retrieving users." });
    }
};
module.exports = {
    createUser,
    getProfile,
    loginUser,
    updateUser,
    deleteUser,
    updateUserRole,
    getAllUsers
}