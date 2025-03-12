const mongoose= require('mongoose')
const { redisClient }= require('../services/redisConnection')


exports.handleMongooseConnection= async(URL)=>{
    try{
        await mongoose.connect(URL)
        console.log("Mongoose Connected Successfully.")
    }catch(err){
        console.error("Error in connecting database"+ err.message)
        throw err
    }
}


exports.redisConnection= async ()=>{
    try{
        await redisClient.connect()
        console.log("Redis Connected Successfully")
    }catch(err){
        console.error("Error in Redis Connection", err.message)
        throw err
    }
}


   