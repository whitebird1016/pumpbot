const User = require('../models/User');

// @route    POST api/adduser
// @desc     Register user
// @access   Public

const addUser = async (req, res) => {
    try {
        const { discord_id, key_type, key, ip_address, expire_time, expire_date, checkbind } = req.body;

        const user = await User.findOne({
            discord_id: discord_id
        });
        const keydata = await User.findOne({
            key: key && key,
            discord_id: { $exists: false }
        })
        if (user && discord_id) {
            const upDateUser = {
                discord_id: discord_id,
                key_type: key_type && key_type,
                key: key && key,
                ip_address: ip_address && ip_address,
                expire_date: expire_date ? expire_date : expire_time && new Date(Date.now() + expire_time),
                create_date: new Date(),
                checkbind: checkbind
            };
            await User.findByIdAndUpdate(user._id,
                { $set: upDateUser },
                { upsert: true })
                .then((updateUser) => res.json(updateUser))
                .catch((err) => console.log(err))

        } else if (keydata && !discord_id) {
            const upDateUser = {
                key: key,
                checkbind: checkbind
            };
            await User.findByIdAndUpdate(keydata._id,
                { $set: upDateUser },
                { upsert: true })
                .then((updateUser) => res.json(updateUser))
                .catch((err) => console.log(err))
        } else if (discord_id !== "" && !user) {
            const newUser = await new User({
                discord_id: discord_id,
                key_type: key_type,
                key: key && key,
                expire_date: expire_date ? expire_date : expire_time && new Date(Date.now() + expire_time),
                create_date: new Date(),
                checkbind: checkbind,
                ip_address: ip_address && ip_address
            });
            console.log(newUser, "new")
            newUser.save().then((user) => res.json(user));
        } else {
            const newUser = await new User({
                key_type: key_type,
                key: key && key,
                expire_date: expire_date ? expire_date : expire_time && new Date(Date.now() + expire_time),
                create_date: new Date(),
                checkbind: checkbind
            });
            console.log(newUser, "new")
            newUser.save().then((user) => res.json(user));
        }
    } catch (error) {
        console.log(error)
    }
}

// @route    GET api/users
// @desc     Will Get User Information
// @access   Public

const getUsers = async (req, res) => {
    try {
        const user = await User.find();
        res.json(user);
    } catch (error) {
        console.log(error)
    }
}

// @route    GET api/getgeneratedkey
// @desc     Will Get Generated Information
// @access   Public


const getGeneratedKey = async (req, res) => {
    try {
        const user = await User.find({ discord_id: { $exists: false } });

        res.json(user);
    } catch (error) {
        console.log(error)
    }
}

// @route    GET api/removekey
// @desc     Will Get Generated Information
// @access   Public


const removeKey = async (req, res) => {
    try {
        const { key } = req.body;
        const users = await User.find({
            key: key,
            discord_id: { $exists: true }
        });
        await User.deleteMany({
            key: key,
            // discord_id: { $exists: false }
        })
        console.log(users, "user")
        res.json(users);
    } catch (error) {
        console.log(error)
    }
}

// @route    GET api/getavailableusers
// @desc     Will Get User Information
// @access   Public

const getAvailableUsers = async (req, res) => {
    try {
        const users = await User.find({
            discord_id: { $exists: true },
            ip_address: { $exists: true }
        });
        res.json(users);
    } catch (error) {
        console.log(error)
    }
}

module.exports = { addUser, getUsers, getGeneratedKey, removeKey, getAvailableUsers };