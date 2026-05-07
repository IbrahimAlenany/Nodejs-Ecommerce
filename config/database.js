const mongoose = require('mongoose');

const db = () => {mongoose.connect(process.env.DATABASE_URI).then((conn) => {
    console.log(`server conected on ${conn.connection.host}`)
})
.catch((error) => {
    console.error(`data base error : ${error}`);
})
};

module.exports = db;