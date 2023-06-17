const { Op, where } = require('sequelize')
const db = require('./../models')
const users = db.users
const user_profiles = db.user_profiles
const user_posts = db.user_posts
const user_likes = db.user_likes
const transporter = require('./../helper/transporter')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const createPosts = async (req, res) => {
    try {
        const { id, caption, post_image } = req.body

        if (!id) {
            res.status(400).send({
                success: false,
                message: 'please login before posting',
                data: null
            })
        } else if (!caption && !post_image) {
            res.status(400).send({
                success: false,
                message: 'fill at least one of the fields',
                data: null
            })
        } else {
            const findUser = await users.findOne({
                where: { id: id }
            })

            if (!findUser) {
                res.status(404).send({
                    success: false,
                    message: 'user not found',
                    data: null
                })
            } else if (findUser.is_active === false) {
                res.status(404).send({
                    success: false,
                    message: 'user has not verified yet',
                    data: null
                })
            } else if (findUser.is_active === true) {
                const createPost = await user_posts.create({
                    user_id: findUser.id,
                    caption: caption,
                    post_image: post_image
                })

                if (createPost) {
                    res.status(200).send({
                        success: true,
                        message: 'Create new post success',
                        data: {}
                    })
                } else {
                    res.status(400).send({
                        success: false,
                        message: 'Create new post failed',
                        data: null
                    })
                }
            }
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error,
            data: null
        })
    }
}

const getAllPosts = async (req, res) => {
    try {
        const allPost = await user_posts.findAll({
            include: users
        })

        if (allPost) {
            res.status(200).send({
                success: true,
                message: 'get all posts success',
                data: allPost
            })
        } else {
            res.status(404).send({
                success: false,
                message: 'no posts found',
                data: null
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
            data: null
        })
    }
}

const editPosts = async (req, res) => {
    try {
        const { id } = req.params
        const { caption } = req.body

        if (!id) {
            res.status(400).send({
                success: false,
                message: 'id not found',
                data: null
            })
        } else {
            const findPost = await user_posts.findOne({
                where: { id: id }
            })

            if (findPost) {
                if (findPost.post_image == null && !caption || findPost.post_image == null && caption == '') {
                    res.status({
                        success: false,
                        message: 'caption and image cannot empty',
                        data: null
                    })
                } else {
                    const edit = await user_posts.update(
                        { caption: caption },
                        { where: { id: id } }
                    )

                    if (edit) {
                        res.status(200).send({
                            success: true,
                            message: 'edit caption success',
                            data: {}
                        })
                    } else {
                        res.status(400).send({
                            success: false,
                            message: 'failed to edit caption',
                            data: null
                        })
                    }
                }
            }
        }


    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
            data: null
        })
    }
}

const deletePosts = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            res.status(400).send({
                success: false,
                message: 'id not found',
                data: null
            })
        } else {
            const findPost = await user_posts.findOne({
                where: {
                    id: id
                }
            })

            if (findPost) {
                const deleteData = await user_posts.destroy({
                    where: { id: id }
                })

                if (deleteData) {
                    res.status(200).send({
                        success: true,
                        message: 'delete post success',
                        data: {}
                    })
                } else {
                    res.status(400).send({
                        success: false,
                        message: 'delete post failed',
                        data: null
                    })
                }
            } else {
                res.status(404).send({
                    success: false,
                    message: 'post not found',
                    data: null
                })
            }
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
            data: null
        })
    }
}

const countLikes = async (req, res) => {
    try {
        const { post_id } = req.params

        if (!post_id) {
            res.status(400).send({
                success: false,
                message: 'id not found',
                data: null
            })
        } else {
            const findPost = await user_posts.findOne({
                where: { id: post_id }
            })

            if (findPost) {
                const count = await user_likes.findAndCountAll({
                    where: { post_id: Number(post_id) }
                })

                if (count) {
                    res.status(200).send({
                        success: true,
                        message: 'get likes count success',
                        data: count
                    })
                } else {
                    res.status(400).send({
                        success: false,
                        message: 'get likes count failed',
                        data: null
                    })
                }
            } else {
                res.status(404).send({
                    success: false,
                    message: 'post not found',
                    data: null
                })
            }

        }



    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
            data: null
        })
    }
}

module.exports = {
    createPosts,
    getAllPosts,
    editPosts,
    deletePosts,
    countLikes
}
