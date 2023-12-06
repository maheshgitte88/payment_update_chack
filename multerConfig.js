const multer = require('multer');

const storage = multer.memoryStorage(); // Use memory storage for file buffering
const upload = multer({ storage: storage });

module.exports = upload;
