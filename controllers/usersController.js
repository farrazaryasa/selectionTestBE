const db = require('./../models')
const users = db.users
const user_profiles = db.user_profiles
const user_likes = db.user_likes
const user_posts = db.user_posts
const user_comments = db.user_comments
const sequelize = db.sequelize
const jwt = require('jsonwebtoken')

const getProfile = async (req, res) => {
    try {
        let token = req.headers.authorization
        token = token.split(" ")[1]
        const userToken = jwt.verify(token, 'secretKey')

        if (!userToken) {
            res.status(400).send({
                success: false,
                message: 'format path incorrect',
                data: null
            })
        } else {
            const findUser = await user_profiles.findOne({
                where: {
                    user_id: userToken.id
                },
                include:
                {
                    model: users,
                    attributes: ['full_name', 'username', 'email', 'is_active']
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
        const { bio, full_name, username } = req.body
        const image = req.file
        let token = req.headers.authorization
        token = token.split(" ")[1]
        const userToken = jwt.verify(token, 'secretKey')

        if (!userToken) {
            res.status(400).send({
                success: false,
                message: 'incorrect path format',
                data: null
            })
        } else {
            const findUser = await user_profiles.findOne({
                where: { user_id: userToken.id },
                include: [{
                    model: users,
                    attributes: ['full_name', 'username', 'email', 'is_active']
                }]
            })

            if (findUser) {
                if (findUser.user.is_active === true) {
                    if (username) {
                        const findUsername = await users.findOne({
                            where: { username: username }
                        })

                        if (findUsername === null) {
                            const changeUsername = await users.update(
                                { username: username },
                                { where: { id: findUser.user_id } }
                            )

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
                        if (!changeBio) {
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

                        if (!changeFullName) {
                            res.status(400).send({
                                success: false,
                                message: 'update full name failed',
                                data: {}
                            })
                        }
                    }
                    if (image) {
                        const changeImage = await user_profiles.update(
                            { profile_picture: image?.filename },
                            { where: { user_id: findUser.user_id } }
                        )

                        if (!changeImage) {
                            res.status(400).send({
                                success: false,
                                message: 'update profile picture failed',
                                data: {}
                            })
                        }
                    }

                    res.status(200).send({
                        success: true,
                        message: 'data updated success',
                        data: null
                    })

                } else {
                    res.status(400).send({
                        success: false,
                        message: 'user not verified',
                        data: null
                    })
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
        const { post_id } = req.body
        let token = req.headers.authorization
        token = token.split(" ")[1]
        const userToken = jwt.verify(token, 'secretKey')

        if (!userToken || !post_id) {
            res.status(400).send({
                success: false,
                message: 'post id or user id not found',
                data: null
            })
        } else {
            const findUser = await users.findOne({
                where: { id: userToken.id }
            })
            const findPost = await user_posts.findOne({
                where: { id: post_id }
            })

            if (findUser && findPost) {
                if (findUser.is_active === true) {
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
                    res.status(400).send({
                        success: false,
                        message: 'user not verified',
                        data: null
                    })
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

const commentPosts = async (req, res) => {
    try {
        const { post_id, comment } = req.body
        let token = req.headers.authorization
        token = token.split(" ")[1]
        const userToken = jwt.verify(token, 'secretKey')

        if (!post_id || !comment || !userToken) {
            res.status(400).send({
                success: false,
                message: 'id and comment not found',
                data: null
            })
        } else {
            const findUser = await users.findOne({
                where: { id: userToken.id }
            })
            const findPost = await user_posts.findOne({
                where: { id: post_id }
            })

            if (findUser && findPost) {

                if (findUser.is_active === true) {
                    const createComment = await user_comments.create(
                        { post_id: findPost.id, user_id: findUser.id, comment: comment }
                    )

                    if (createComment) {
                        res.status(200).send({
                            success: true,
                            message: 'comment created successfully',
                            data: {}
                        })
                    } else {
                        res.status(400).send({
                            success: false,
                            message: 'create comment failed',
                            data: {}
                        })
                    }
                } else {
                    res.status(400).send({
                        success: false,
                        message: 'user is not verified',
                        data: {}
                    })
                }

            } else {
                res.status(404).send({
                    success: false,
                    message: 'user or post not found',
                    data: {}
                })
            }
        }

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
            data: {}
        })
    }
}

const getUserPosts = async (req, res) => {
    try {
        let token = req.headers.authorization
        token = token.split(" ")[1]
        const userToken = jwt.verify(token, 'secretKey')

        if (!userToken) {
            res.status(400).send({
                success: false,
                message: 'missing token',
                data: null
            })
        } else {
            const findUser = await users.findOne({
                where: { id: userToken.id }
            })

            if (findUser) {
                const findPosts = await user_posts.findAndCountAll({
                    where: { user_id: findUser.id },
                    attributes: ['id', 'user_id', 'caption', 'post_image', [sequelize.fn('DATE', sequelize.col('user_posts.createdAt')), 'createdAt']],
                    include: [{
                        model: users,
                        attributes: ['username', 'email']
                    }]
                })

                if (findPosts) {
                    res.status(200).send({
                        success: true,
                        message: 'all user posts',
                        data: findPosts
                    })
                } else {
                    res.status(400).send({
                        success: false,
                        message: 'get user post failed',
                        data: null
                    })
                }
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

module.exports = {
    getProfile,
    editProfile,
    likeOrUnlikePosts,
    commentPosts,
    getUserPosts
}
