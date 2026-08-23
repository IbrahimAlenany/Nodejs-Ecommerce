const mongoose = require('mongoose');

const reviewSchema = new mpngoose.Schema(
    {
        title: {
            type: String,
        },
        ratings: {
            type: Number,
            min: [1,'Min ratings value is 1.0'],
            max: [4,'Max ratings value is 5.0'],
        },
        user: {
            type : mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to user'],
        },
        product: {
            type : mongoose.Schema.ObjectId,
            ref: 'Product',
            required: [true, 'Review must belong to product'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);