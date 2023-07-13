const express = require('express')
const connectedToDb =require('./config/connectedToDb');
const xss = require('xss-clean')
const rateLimiting = require('express-rate-limit')
const cors = require('cors')
const hpp = require('hpp')
const helmet = require('helmet')
const errorHandler = require('./middlewares/error');
require('dotenv').config();

//connect to DB
connectedToDb();

//init App
const app=express()

//middleware
app.use(express.json())

// Security Headers (helmet)
app.use(helmet())

// prevent http param pollution
app.use(hpp())

// prevent XSS (cross Site Scripting) Attacks
app.use(xss())

//rate limit
app.use(rateLimiting({
    WindowMs : 10 * 60 * 1000,  // 10 min
    max      :  100   ,          // كل عشر دقائق يبعت requist
}))

// cors policy
app.use(cors({
    origin: "http://localhost:3000"
}))

//routes
app.use("/api/auth" , require('./routes/authRoute'))
app.use("/api/users" , require('./routes/usersRoute'))
app.use("/api/posts" , require('./routes/postsRoute'))
app.use("/api/comments" , require('./routes/commentsRoute'))
app.use("/api/categories" , require('./routes/categoryRoute'))
app.use("/api/password" , require('./routes/passwordRoute'))


// error handler middleware
app.use(errorHandler)


const PORT =process.env.PORT || 8000

app.listen(PORT ,()=>{
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${ PORT }`)
})