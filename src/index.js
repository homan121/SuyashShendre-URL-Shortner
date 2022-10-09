const express = require('express')
const mongoose = require('mongoose')
const route = require("./route/route")
const app = express()

app.use(express.json())

mongoose.connect("mongodb+srv://root:1234@suyashshendre.wfinbwt.mongodb.net/group52Database?retryWrites=true&w=majority", { useNewUrlParser: true })
.then(() => console.log("MongoDb Connected..."))
.catch(err => console.log(err))

app.use("/",route)

app.listen(3000, () =>
    console.log("Express App Is Running On 3000.")
)