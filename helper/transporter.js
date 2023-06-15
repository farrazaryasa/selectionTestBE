const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'farrazfersanda@gmail.com',
        pass: 'ugywmfqxmntxmani'
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = transporter