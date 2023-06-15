const express = require('express')
const app = express()
const PORT = 4567
const cors = require('cors')


app.use(express.static('public'))
app.use(express.json())
app.use(cors())

//test application connection
app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "selection test database connection success",
        data: {}
    })
})

app.listen(PORT, () => {
    console.log("server run on port : ", PORT);
})
