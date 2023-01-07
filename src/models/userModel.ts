import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please add your name"],
        trim: true,
        maxLength:[20,"Your name is up to 20 chars long"]
    },
    account: {
        type: String,
        required: [true, "Please add your email or phone"],
        trim: true,
        unique:true
    },
    password: {
        type: String,
        required: [true, "Please add your password"],
        trim:true
    },
    avatar: {
        type: String,
        default:'https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=1024x1024&w=is&k=20&c=-mUWsTSENkugJ3qs5covpaj-bhYpxXY-v9RDpzsw504='
    },
    role: {
        type: String,
        default: 'user'//admin
    },
    type: {
        type: String,
        default:'normal'//fast
    }
}, {
    timestamps:true
})

export default model('User', userSchema)