const okRouter = require("express").Router()

okRouter.get("/200", (_, res)=>res.status(200).send("all is right"))

module.exports = okRouter