const express = require('express');
const postsController = require('../controllers/postsController');

const router = express.Router()

router.post('/', postsController.createPosts)
router.get('/', postsController.getAllPosts)
router.patch('/:id', postsController.editPosts)
router.delete('/:id', postsController.deletePosts)
router.get('/likes/:post_id', postsController.countLikes)

module.exports = router
