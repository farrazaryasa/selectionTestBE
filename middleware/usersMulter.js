const multer = require('multer')
const fs = require('fs')

const defaultPath = 'public'

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        let isDirectoryExist = fs.existsSync(`${defaultPath}/imageUsers`);
        if (!isDirectoryExist) {
            await fs.promises.mkdir(`${defaultPath}/imageUsers`, {
                recursive: true,
            });
        }
        if (file.fieldname === 'image') {
            cb(null, `${defaultPath}/imageUsers`);
        }
    },
    filename: (req, file, cb) => {
        cb(null, 'UIMG-' + Date.now() + Math.round(Math.random() * 1000000000) + '.' + file.mimetype.split('/')[1])
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype.split('/')[1] === "jpg" || file.mimetype.split('/')[1] === "jpeg" || file.mimetype.split('/')[1] === "png") {
        cb(null, true)
    } else {
        cb(new Error("file not supported"))
    }
}

exports.usersMulter = multer({ storage: storage, fileFilter: fileFilter })