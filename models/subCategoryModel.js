const mongoose = require('mongoose');

const subCategoryModel = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: [true, 'SubCategory must be unique'],
            minlength: [2, 'To short subcategory name'],
            maxlength: [32, 'To short subcategory name']
        },
        slug: {
            type: String,
            lowercase: true,
        },
        category: {
            type: mongoose.Schema.ObjectId,
            ref: 'Category',
            required: [true, 'Subcategory must be belong to parent category'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('subCategory', subCategoryModel)