const asyncHandler = require('express-async-handler')
const {Category , validateCreateCategory} = require('../models/Category')


// create new category --- (/api/categories) -- post --- only admin
module.exports.createCategoryCtrl = asyncHandler( async(req,res)=>{
    // validation
    const{error} = validateCreateCategory( req.body )
    if ( error ){
        return res.status(400).json({message : error.message})
    }
    // create category
    const category =await Category.create({
        user : req.user._id,
        title : req.body.title
    });

    // send response to the client
    res.status(200).json(category)
})


// get all category --- (/api/categories) -- get --- public
module.exports.getAllCategoriesCtrl = asyncHandler( async(req,res)=>{
    const categories = await Category.find()
    res.status(200).json(categories)
})


// delete single category --- (/api/categories/:id) -- delete --- only admin
module.exports.deleteCategoriesCtrl = asyncHandler( async(req,res)=>{
    const category= await Category.findById(req.params.id)
    if (!category) {
        return res.status(404).json({message : "category not found"})
    }
    await Category.findByIdAndDelete(req.params.id)

    res.status(200).json({
        message : "category deleted successfully",
        categoryId : category._id
    })
})





