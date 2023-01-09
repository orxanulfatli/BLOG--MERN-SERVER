import mongoose from "mongoose";
import constants from '../constants/index'




mongoose.connect(`${constants.DB}`).then(() => {
    console.log('db is connecting')
}).catch((err) => {
    console.log(err)
})