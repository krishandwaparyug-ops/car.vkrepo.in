const mongoose = require('mongoose')

const checkObjectId = (_id) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return false
    }
    return true
}

module.exports = checkObjectId