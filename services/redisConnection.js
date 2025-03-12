const { createClient }= require('@redis/client')
const redisURL=  process.env.Redis_URL_Live 


exports.redisClient= createClient({
    'url': redisURL
})