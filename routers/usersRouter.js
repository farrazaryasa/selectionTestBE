const express = require('express');
const usersController = require('../controllers/usersController');

const router = express.Router()

router.get('/:id', usersController.getProfile)
router.patch('/:id', usersController.editProfile)
router.post('/likes', usersController.likeOrUnlikePosts)

module.exports = router
