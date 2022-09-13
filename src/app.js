require('dotenv').config()
const express = require('express') 
const app = express()
const cors = require('cors')
const facebookRouter = require('./routes/facebookRoutes')
const okRouter = require('./routes/okRoute')

app.use(cors({
  origin: "*",
  methods: "*"
}))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use("/", facebookRouter, okRouter)

module.exports = app