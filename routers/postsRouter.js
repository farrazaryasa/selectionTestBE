const express = require('express');
const postsController = require('../controllers/postsController');
const { verifyToken } = require('./../middleware/auth')
const { postsMulter } = require('./../middleware/postsMulter')

const router = express.Router()

router.post('/', verifyToken, postsMulter.single('image'), postsController.createPosts)
router.get('/', verifyToken, postsController.getAllPosts)
router.get('/:id', verifyToken, postsController.getPostDetails)
router.patch('/:id', verifyToken, postsController.editPosts)
router.delete('/:id', verifyToken, postsController.deletePosts)
router.get('/likes/:post_id', verifyToken, postsController.countLikes)
router.get('/comments/:post_id', verifyToken, postsController.getComments)

module.exports = router
