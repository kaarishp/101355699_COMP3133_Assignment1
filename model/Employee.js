const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    first_name: { 
        type: String, 
        required: true 
    },
    last_name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true ,
        trim: true,
        validate: {
        validator: function(v) {
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
        }
    },
    gender: { 
        type: String, 
        enum: ['Male', 'Female', 'Other'] 
    },
    salary: { 
        type: Number, 
        required: true 
    }
});

const employeeModel = mongoose.model('Employee', employeeSchema);
module.exports = employeeModel;