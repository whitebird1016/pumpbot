const express = require('express');
const userController = require("../controllers/user.controller.js");

const router = express.Router();

router.get("/users", userController.getUsers)
router.post("/adduser", userController.addUser)
router.get("/getgeneratedkey", userController.getGeneratedKey)
router.post("/removekey", userController.removeKey)
router.post("/getavailableusers", userController.getAvailableUsers)

module.exports = router;