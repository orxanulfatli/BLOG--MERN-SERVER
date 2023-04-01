import {Schema,model} from 'mongoose'

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        
    }
}, {
    timestamps: true
})

export default model('category', categorySchema)