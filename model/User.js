const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        required: true,
        minlength: 4
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
        validator: function(v) {
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        required: true,
        minlength: 6
    }
});

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;