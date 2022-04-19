const mongoose = require('mongoose');
const dbName = 'whosecode';
mongoose.connect(`mongodb://localhost:27017/${dbName}`);

module.exports = mongoose;
