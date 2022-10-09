const express = require('express')
const router = express.Router()
const urlController = require("../controller/urlController")

// URL Shortener APIs
router.post("/url/shorten", urlController.createUrl)

router.get("/:urlCode", urlController.redirectUrl)

// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    })
})


module.exports = router