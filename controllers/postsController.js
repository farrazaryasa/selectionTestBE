const db = require('./../models')
const users = db.users
const user_profiles = db.user_profiles
const user_posts = db.user_posts
const user_likes = db.user_likes
const user_comments = db.user_comments
const sequelize = db.sequelize
const jwt = require('jsonwebtoken')

const createPosts = async (req, res) => {
    try {
        const { caption } = req.body
        const image = req.file
        let token = req.headers.authorization
        token = token.split(" ")[1]
        const userToken = jwt.verify(token, 'secretKey')

        if (!userToken) {
            res.status(400).send({
                success: false,
                message: 'please login before posting',
                data: null
            })
        } else if (!image) {
            res.status(400).send({
                success: false,
                message: 'please upload picture',
                data: null
            })
        } else {
            const findUser = await users.findOne({
                where: { email: userToken.email }
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
                    post_image: image?.filename
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
        console.log(error);
        res.status(500).send({
            success: false,
            message: error,
            data: null
        })
    }
}

const getAllPosts = async (req, res) => {
    try {
        const { page } = req.query
        const pageNum = Number(page)
        const paginationLimit = pageNum * 3
        console.log(typeof (page));
        const allPost = await user_posts.findAndCountAll({
            attributes: ['id', 'caption', 'post_image', [sequelize.fn('DATE', sequelize.col('user_posts.createdAt')), 'createdAt']],
            include: {
                model: users,
                attributes: ['username', 'email']
            },
            limit: paginationLimit
        })

        if (allPost) {
            res.status(200).send({
                success: true,
                message: 'get all posts success',
                data: {
                    allPost,
                    total_page: allPost.count / 3
                }
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

const getPostDetails = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            res.status(400).send({
                success: false,
                message: 'post id missing',
                data: null
            })
        } else {
            const result = await user_posts.findOne(
                {
                    where: { id: id },
                    attributes: ['id', 'user_id', 'caption', 'post_image', [sequelize.fn('DATE', sequelize.col('user_posts.createdAt')), 'createdAt']],
                    include: {
                        model: users,
                        attributes: ['username', 'email']
                    }
                }
            )

            if (result) {
                res.status(200).send({
                    success: true,
                    message: 'get post detail success',
                    data: result
                })
            } else {
                res.status(404).send({
                    success: false,
                    message: 'post not found',
                    data: result
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

const editPosts = async (req, res) => {
    try {
        const { id } = req.params
        const { caption } = req.body
        let token = req.headers.authorization
        token = token.split(" ")[1]
        const userToken = jwt.verify(token, 'secretKey')

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

            if (!findPost) {
                res.status(404).send({
                    success: false,
                    message: 'post not found',
                    data: null
                })
            } else if (findPost.user_id === userToken.id) {
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
            } else {
                res.status(400).send({
                    success: false,
                    message: 'cannot edit other user posts',
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

const deletePosts = async (req, res) => {
    try {
        const { id } = req.params
        let token = req.headers.authorization
        token = token.split(" ")[1]
        const userToken = jwt.verify(token, 'secretKey')

        if (!id) {
            res.status(400).send({
                success: false,
                message: 'id not found',
                data: null
            })
        } else {
            const findPost = await user_posts.findOne({
                where: {
                    id: Number(id)
                }
            })

            if (!findPost) {
                res.status(404).send({
                    success: false,
                    message: 'post not found',
                    data: null
                })

            } else if (findPost.user_id === userToken.id) {
                const deleteData = await user_posts.destroy({
                    where: { id: id }
                })

                const deleteLikesData = await user_likes.destroy({
                    where: { post_id: id }
                })

                res.status(200).send({
                    success: true,
                    message: 'delete post success',
                    data: {}
                })

            } else if (findPost.id !== userToken.id) {
                res.status(400).send({
                    success: false,
                    message: 'cannot delete other user posts',
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

const getComments = async (req, res) => {
    try {
        const { post_id } = req.params

        if (!post_id) {
            res.status(400).send({
                success: false,
                message: 'comment id not found',
                data: null
            })
        } else {
            const findPost = await user_posts.findOne({
                where: { id: post_id }
            })

            if (findPost) {
                const findComments = await user_comments.findAll(
                    {
                        where: { post_id: post_id },
                        include: [{
                            model: users,
                            attributes: ['username']
                        }, {
                            model: user_posts
                        }],
                        order: [['createdAt', 'DESC']],
                        limit: 5
                    },

                )

                if (findComments) {
                    res.status(200).send({
                        success: true,
                        message: 'get all comment success',
                        data: findComments
                    })
                } else {
                    res.status(404).send({
                        success: true,
                        message: 'no comment found',
                        data: null
                    })
                }
            } else {
                res.status(404).send({
                    success: true,
                    message: 'post not found',
                    data: null
                })
            }

        }
    } catch (error) {
        res.status(500).send({
            success: true,
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
    countLikes,
    getComments,
    getPostDetails
}
