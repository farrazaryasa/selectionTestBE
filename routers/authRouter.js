const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('./../middleware/auth')

const router = express.Router()

router.post('/register', authController.userRegister)
router.post('/login', authController.userLogin)
router.post('/logout', authController.userLogout)
router.patch('/verification/new', authController.newToken)
router.patch('/verification/:token', authController.verifyUser)

module.exports = router


