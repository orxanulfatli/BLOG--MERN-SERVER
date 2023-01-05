import mongoose from "mongoose";


const URI = process.env.MONGODB_URL

mongoose.connect(`${URI}`).then(() => {
    console.log('db is connecting')
}).catch((err) => {
    console.log(err)
})