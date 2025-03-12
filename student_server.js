require('dotenv').config()
const express= require('express')
const cors= require('cors')
const { handleMongooseConnection, redisConnection }= require('./services/connection.js')
const cookieParser= require('cookie-parser')
const USER= require('./routes/user.routes.js')
const STUDENT= require('./routes/student.routes.js')
const OWNER= require('./routes/owner.routes.js')
const COMMON= require('./routes/common.routes.js')
const { setRoleStudent, setRoleOwner, setRoleCommon }= require('./middlewares/setRoles.js')
const { tokenAuthentication }= require('./middlewares/authMiddleware.js')
const { inactiveUsersDeletionCronJob }= require('./services/cronJob.js')


const app= express()
const port= process.env.PORT || 7000


const URL= process.env.Mongo_URL_Live 
// const URL= process.env.Mongo_URL_Local 
// const URL= process.env.MONGO_URL_Docker || "mongodb://db:27017/mess"


handleMongooseConnection(URL)

redisConnection()

inactiveUsersDeletionCronJob()


const allowedOrigins = [
    "http://192.168.1.1:8081", "http://192.168.1.3:8081", "http://192.168.1.4:8081", 
    "http://192.168.1.5:8081", "http://192.168.1.6:8081", "http://192.168.1.7:8081", 
    "http://192.168.1.8:8081", "http://192.168.1.9:8081", "http://192.168.1.10:8081"
]
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) { 
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,                    
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true}))


app.use("/", USER)
app.use("/student", setRoleStudent, tokenAuthentication, STUDENT)                            //  tokenAuthentication
app.use("/owner", setRoleOwner, tokenAuthentication, OWNER)                                  //  tokenAuthentication
app.use("/common", setRoleCommon, tokenAuthentication, COMMON)                               //  tokenAuthentication



app.listen(port, ()=>{ console.log(`Server Started on Port ${port}.`)})