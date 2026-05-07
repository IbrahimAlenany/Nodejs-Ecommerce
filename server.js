const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });
const morgan = require('morgan');


//database connection
const database = require('./config/database');
database();

//middelwares
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log(`mode: ${process.env.NODE_ENV}`)
}
app.use(express.json());

//routs
app.use('/api/v1/categories', categoryRoute);


app.get('/', (resq,res) => {
    res.send('App v1')
})

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`APP Running on ${port}`);
})