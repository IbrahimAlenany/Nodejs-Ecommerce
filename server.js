const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });
const morgan = require('morgan');
const ApiError = require('./utils/ApiError');
const categoryRoute = require('./routes/categoryRoute');
const subcategoryRoute = require('./routes/subCategoryRoute');
const ErrorMiddleware = require('./middlewares/errorMiddleware');
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
app.use('/api/v1/subcategories', subcategoryRoute);

app.all('*error', (req, res, next) => {
    next(new ApiError(`canot find this route: ${req.originalUrl}`, 400));
})

app.use(ErrorMiddleware);

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`APP Running on ${port}`);
});

//Handle rejection outside express
process.on('unhandledRejection', (err) => {
    console.error(`unhandledRejection Errors : ${err.name} | ${err.message}`);
    server.close(() => {
        console.error('shutting down...');
        process.exit(1);
    })
})