const express = require('express')
const app = express()
const PORT = 4567
const cors = require('cors')

//import router
const { authRouter, usersRouter, postsRouter } = require('./routers')


app.use(express.static('public'))
app.use(express.json())
app.use(cors())

//test application connection
app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "Selection test database connection success",
        data: {}
    })
})

app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/posts', postsRouter)

app.listen(PORT, () => {
    console.log("server run on port : ", PORT);
})
