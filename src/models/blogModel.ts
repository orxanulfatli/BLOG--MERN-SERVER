import { Schema,model } from 'mongoose';

const blogSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    title: {
        type: String,
        require: true,
        trim: true,
        minLength: 10,
        maxLength: 50
    },
    content: {
        type: String,
        require: true,
        minLength: 2000
    },
    description: {
        type: String,
        require: true,
        trim: true,
        minLength: 50,
        maxLength: 200
    },
    thumbnail: {
        type: String,
        require: true
    },
    category: { type: Schema.Types.ObjectId, ref: 'category' }
}, {
    timestamps: true
});

export default model('blog', blogSchema)