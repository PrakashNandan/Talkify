const generateToken = require("../config/generateToken");
const bcrypt = require('bcrypt');
const User = require("../model/userModel");

exports.register = async (req, res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        return res.status(422).json({ error: "Please fill all the required fields" });
    }

    // Additional input validation (e.g., email format)
    // Password strength validation can be added here

    try {
        const userExist = await User.findOne({ email: email });

        if (userExist) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new User({ name, email, password:hashedPassword, pic });

        await user.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token : generateToken(user._id)
            },
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "Please fill all the required fields" });
    }

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token : generateToken(user._id)
            },
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
}


exports.getAllusers = async (req, res) => {


    const keyword = req.query.search
    ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ],
    }
    : {};

    try {
        const users = await User.find({ ...keyword }).find({ _id: { $ne: req.user._id } })
        res.status(200).json(users);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }




}
