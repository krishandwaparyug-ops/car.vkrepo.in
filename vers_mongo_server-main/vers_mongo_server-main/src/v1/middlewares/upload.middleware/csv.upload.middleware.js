const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/readableExcelFile');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, ''));
    }
});

const csvUpload = multer({ storage: storage });
module.exports = csvUpload
