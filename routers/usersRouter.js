const express = require('express');
const usersController = require('../controllers/usersController');
const { verifyToken } = require('./../middleware/auth')
const { usersMulter } = require('./../middleware/usersMulter')

const router = express.Router()

router.get('/', verifyToken, usersController.getProfile)
router.patch('/', verifyToken, usersMulter.single('image'), usersController.editProfile)
router.post('/likes', verifyToken, usersController.likeOrUnlikePosts)
router.post('/comments', verifyToken, usersController.commentPosts)
router.get('/posts', verifyToken, usersController.getUserPosts)

module.exports = router
