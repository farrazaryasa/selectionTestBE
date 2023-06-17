const { Op, where } = require('sequelize')
const db = require('./../models')
const users = db.users
const user_profiles = db.user_profiles
const user_likes = db.user_likes
const user_posts = db.user_posts
const transporter = require('./../helper/transporter')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const getProfile = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            res.status(400).send({
                success: false,
                message: 'format path incorrect',
                data: null
            })
        } else {
            const findUser = await user_profiles.findOne({
                where: {
                    user_id: id
                },
                include:
                {
                    model: users,
                    attributes: ['full_name', 'username', 'email']
                }
            })

            if (findUser) {
                res.status(200).send({
                    success: true,
                    message: 'get user profile success',
                    data: findUser
                })
            } else {
                res.status(404).send({
                    success: false,
                    message: 'user not found',
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

const editProfile = async (req, res) => {
    try {
        const { id } = req.params
        const { bio, full_name, username } = req.body
        // const profile_picture = req.file
        // const background_picture = req.file

        if (!id) {
            res.status(400).send({
                success: false,
                message: 'incorrect path format',
                data: null
            })
        } else {
            const findUser = await user_profiles.findOne({
                where: { user_id: id },
                include: [{
                    model: users,
                    attributes: ['full_name', 'username', 'email']
                }]
            })

            if (findUser) {
                if (username) {
                    const findUsername = await users.findOne({
                        where: { username: username }
                    })

                    if (findUsername === null) {
                        const changeUsername = await users.update(
                            { username: username },
                            { where: { id: findUser.user_id } }
                        )
                        res.status(200).send({
                            success: true,
                            message: 'username change success',
                            data: {}
                        })
                    } else if (findUsername.id === findUser.user_id) {
                        res.status(400).send({
                            success: false,
                            message: 'username cannot be the same as previous',
                            data: null
                        })
                    } else if (findUsername) {
                        res.status(400).send({
                            success: false,
                            message: 'username has been taken',
                            data: null
                        })
                    }
                }
                if (bio) {
                    const changeBio = await user_profiles.update(
                        { bio: bio },
                        { where: { user_id: findUser.user_id } }
                    )
                    if (changeBio) {
                        res.status(200).send({
                            success: true,
                            message: 'change bio success',
                            data: {}
                        })
                    } else {
                        res.status(400).send({
                            success: false,
                            message: 'change bio failed',
                            data: null
                        })
                    }
                }
                if (full_name) {
                    const changeFullName = await users.update(
                        { full_name: full_name },
                        { where: { id: findUser.user_id } }
                    )

                    if (changeFullName) {
                        res.status(200).send({
                            success: true,
                            message: 'update full name success',
                            data: {}
                        })
                    } else {
                        res.status(400).send({
                            success: false,
                            message: 'update full name failed',
                            data: {}
                        })
                    }
                }

            } else {
                res.status(404).send({
                    success: false,
                    message: 'user not found',
                    data: {}
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

const likeOrUnlikePosts = async (req, res) => {
    try {
        const { user_id, post_id } = req.body

        if (!user_id || !post_id) {
            res.status(400).send({
                success: false,
                message: 'post id or user id not found',
                data: null
            })
        } else {
            const findUser = await users.findOne({
                where: { id: user_id }
            })
            const findPost = await user_posts.findOne({
                where: { id: post_id }
            })

            if (findUser && findPost) {
                const findLike = await user_likes.findOne({
                    where: { post_id: findPost.id, user_id: findUser.id }
                })

                if (findLike) {
                    const unlike = await user_likes.destroy({
                        where: { post_id: findPost.id, user_id: findUser.id }
                    })

                    if (unlike) {
                        res.status(200).send({
                            success: true,
                            message: 'user unlike post success',
                            data: {}
                        })
                    } else {
                        res.status(400).send({
                            success: false,
                            message: 'user unlike failed',
                            data: null
                        })
                    }

                } else {
                    const like = await user_likes.create(
                        { post_id: findPost.id, user_id: findUser.id }
                    )

                    if (like) {
                        res.status(200).send({
                            success: true,
                            message: 'user like post success',
                            data: {}
                        })
                    } else {
                        res.status(400).send({
                            success: false,
                            message: 'user like post failed',
                            data: null
                        })
                    }
                }
            } else {
                res.status(404).send({
                    success: false,
                    message: 'user or post not found',
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
    getProfile,
    editProfile,
    likeOrUnlikePosts
}
