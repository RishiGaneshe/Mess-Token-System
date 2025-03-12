const cron = require('node-cron')
const User = require('../models/signUpSchema')


exports.inactiveUsersDeletionCronJob= async ()=>{
    try{
        cron.schedule('* * * * *', async () => {
            try {
              const now = new Date();
              const twoMinutesAgo = new Date(now - 2 * 60 * 1000)
          
              const inactiveUsers = await User.find({
                isActive: false,
                updatedAt: { $lte: twoMinutesAgo }
              })
              
              if (inactiveUsers.length > 0) {
                const deleteResult = await User.deleteMany({
                  _id: { $in: inactiveUsers.map(user => user._id) }
                })
                console.log(`Deleted ${deleteResult.deletedCount} inactive users.`)
              }

            } catch (err) {
              console.error("Error deleting inactive users:", err)
            }
          })

    }catch(err){
        console.error("Error deleting inactive users Cron Job:", err)
        throw err
    }
}