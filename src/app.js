require('dotenv').config()
const express = require('express') 
const app = express()
const cors = require('cors')
const facebookRouter = require('./routes/facebookRoutes')
const okRouter = require('./routes/okRoute')
const politicsRouter = require('./routes/politicsRoute')

app.use(cors({
  origin: "*",
  methods: "*"
}))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use("/", facebookRouter, okRouter, politicsRouter)

module.exports = app