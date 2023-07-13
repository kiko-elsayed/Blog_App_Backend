const mongoose = require('mongoose')

module.exports = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_CLOUD_URL)
        console.log("connected to database")
    } catch (error) {
        console.log("cannot connect to database" + error)
    }
}