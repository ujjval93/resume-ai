const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "username already exists"],
        required: true,
    },
    email: {
        type: String,
        unique: [true, "email already exists"],
        required: true,
    },
    password: {
        type: String,
        require: true,
    }
})


module.exports = mongoose.model('User', userSchema);