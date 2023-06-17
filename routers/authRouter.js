const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router()

router.post('/register', authController.userRegister)
router.post('/login', authController.userLogin)
router.patch('/verification/:token', authController.verifyUser)

module.exports = router


