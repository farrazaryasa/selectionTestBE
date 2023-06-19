const { Op } = require('sequelize')
const db = require('./../models')
const users = db.users
const user_profiles = db.user_profiles
const transporter = require('./../helper/transporter')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const userRegister = async (req, res) => {
    try {
        const { name, username, email, password, confirmationPassword } = req.body
        const regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}')
        const strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')

        if (!username || !email || !password || !confirmationPassword) {
            res.status(400).send({
                success: false,
                message: 'fill all the required data',
                data: null
            })
        } else if (password !== confirmationPassword) {
            res.status(400).send({
                success: false,
                message: 'password different',
                data: null
            })
        } else if (regex.test(email) === false) {
            res.status(400).send({
                success: false,
                message: 'email format is incorrect',
                data: null
            })
        } else if (strongPassword.test(password) === false) {
            res.status(400).send({
                success: false,
                message: 'Weak password, Passwords should contain at least 8 characters including an uppercase letter, a symbol, and a number',
                data: null
            })
        } else {
            const findExistingUser = await users.findOne({
                where: {
                    [Op.or]: [
                        { email: email },
                        { username: username }
                    ]
                }
            })

            if (findExistingUser) {
                res.status(400).send({
                    success: false,
                    message: 'user already exists',
                    data: null
                })
            } else {
                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(password, salt)

                const createUser = await users.create({
                    full_name: name,
                    email: email,
                    username: username,
                    password: hashPassword
                })

                if (createUser) {
                    const createProfile = await user_profiles.create({
                        user_id: createUser.id
                    })

                    const payload = { id: createUser.id, email: createUser.email, username: createUser.username, is_active: createUser.is_active, token_counter: createUser.token_counter }
                    const token = jwt.sign(payload, 'secretKey', {
                        expiresIn: '30m'
                    })

                    const sendEmail = await transporter.sendMail({
                        from: 'farrazfersanda@gmail.com',
                        to: email,
                        subject: 'Activation Link',
                        html: `<h1>Verification Link</h1><p>Click link below to activate your account</p>
                        <a href=http://localhost:3000/verification/${token}>Verification Link</a><p>(expired in 30 minutes)</p>`
                    })

                    res.status(200).send({
                        success: true,
                        message: 'User register success',
                        data: { name: createUser.full_name, email: createUser.email, username: createUser.username, token: token }
                    })
                } else {
                    res.status(400).send({
                        success: false,
                        message: 'failed to register new user',
                        data: null
                    })
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

const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            res.status(400).send({
                success: false,
                message: 'please fill all the data',
                data: null
            })
        } else {
            const findUser = await users.findOne({
                where: {
                    [Op.or]: [
                        { email: username },
                        { username: username }
                    ]
                }
            })

            const checkUser = await bcrypt.compare(password, findUser?.password)

            if (checkUser === true) {
                await users.update(
                    { is_login: true, token_counter: findUser.token_counter + 1 },
                    { where: { email: findUser?.email } }
                )

                const updatedFindUser = await users.findOne({
                    where: {
                        [Op.or]: [
                            { email: findUser.email },
                            { username: findUser.username }
                        ]
                    }
                })

                const payload = {
                    id: updatedFindUser.id,
                    name: updatedFindUser.name,
                    email: updatedFindUser.email,
                    username: updatedFindUser.username,
                    is_active: updatedFindUser.is_active,
                    token_counter: updatedFindUser.token_counter
                }

                const token = jwt.sign(payload, 'secretKey')

                res.status(200).send({
                    success: true,
                    message: 'login success',
                    data: {
                        id: updatedFindUser.id,
                        name: updatedFindUser.full_name,
                        email: updatedFindUser.email,
                        username: updatedFindUser.username,
                        is_active: updatedFindUser.is_active,
                        token: token
                    }
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
        console.log(error);
        res.status(500).send({
            success: false,
            message: error.message,
            data: null
        })
    }
}

const verifyUser = async (req, res) => {
    try {
        const { token } = req.params

        const formatToken = 'Bearer ' + token
        splitToken = formatToken.split(" ")[1]
        let verify = jwt.verify(splitToken, 'secretKey')

        if (verify) {
            const findUser = await users.findOne({
                where: {
                    email: verify.email
                }
            })

            if (findUser) {
                if (findUser.token_counter === verify.token_counter) {
                    const activateUser = await users.update(
                        { is_active: true, token_counter: findUser.token_counter + 1 },
                        {
                            where: {
                                email: verify.email
                            }
                        }
                    )

                    if (activateUser) {
                        const findUpdatedUserData = await users.findOne({
                            where: {
                                email: findUser.email
                            }
                        })

                        if (findUpdatedUserData) {
                            const payload = {
                                id: findUpdatedUserData.id,
                                email: findUpdatedUserData.email,
                                username: findUpdatedUserData.username,
                                token_counter: findUpdatedUserData.token_counter
                            }
                            const token = jwt.sign(payload, 'verifyToken')

                            res.status(200).send({
                                success: true,
                                message: 'user activation success',
                                data: {
                                    email: findUpdatedUserData.email,
                                    username: findUpdatedUserData.username,
                                    is_active: findUpdatedUserData.is_active,
                                    token: token
                                }
                            })
                        } else {
                            res.status(400).send({
                                success: false,
                                message: 'verification failed',
                                data: null
                            })
                        }
                    } else {
                        res.status(400).send({
                            success: false,
                            message: 'user activation failed',
                            data: null
                        })
                    }
                } else {
                    res.status(404).send({
                        success: false,
                        message: 'token invalid',
                        data: null
                    })
                }
            }

        } else {
            res.status(404).send({
                success: 'invalid token',
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

const newToken = async (req, res) => {
    try {
        const { id } = req.body

        if (!id) {
            res.status(400).send({
                success: false,
                message: 'user not login yet',
                data: null
            })
        } else {
            const findUser = await users.findOne({
                where: { id: id }
            })

            if (findUser) {
                if (findUser.is_active === false) {
                    const updateTokenCounter = await users.update(
                        { token_counter: findUser.token_counter + 1 },
                        { where: { id: findUser.id } }
                    )
                    const updateUser = await users.findOne({
                        where: { id: findUser.id }
                    })

                    const payload = { id: updateUser.id, email: updateUser.email, username: updateUser.username, is_active: updateUser.is_active, token_counter: updateUser.token_counter }
                    const token = jwt.sign(payload, 'secretKey', {
                        expiresIn: '30m'
                    })

                    const sendEmail = await transporter.sendMail({
                        from: 'farrazfersanda@gmail.com',
                        to: updateUser.email,
                        subject: 'Activation Link',
                        html: `<h1>Verification Link</h1><p>Click link below to activate your account</p>
                        <a href=http://localhost:3000/verification/${token}>Verification Link</a><p>(expired in 30 minutes)</p>`
                    })

                    if (updateTokenCounter && updateUser && sendEmail) {
                        res.status(200).send({
                            success: true,
                            message: 'new verification link has been sent',
                            data: {}
                        })
                    }
                } else {
                    res.status(400).send({
                        success: false,
                        message: 'user already verified',
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

const userLogout = async (req, res) => {
    try {
        const { username } = req.body

        if (!username) {
            res.status(400).send({
                success: false,
                message: 'token missing',
                data: null
            })
        } else {
            const logoutUser = await users.update(
                { is_login: false },
                { where: { username: username } }
            )

            if (logoutUser) {
                res.status(200).send({
                    success: true,
                    message: 'user logout success',
                    data: {}
                })
            } else {
                res.status(400).send({
                    success: false,
                    message: 'user logout failed',
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
    userRegister,
    userLogin,
    verifyUser,
    newToken,
    userLogout
}
