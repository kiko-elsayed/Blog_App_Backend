const router = require('express').Router()
const { createCategoryCtrl,getAllCategoriesCtrl,deleteCategoriesCtrl } = require('../controllres/categoryController')
const { verifyTokenAndAdmin}= require('../middlewares/verifyToken')
const validateObjectId = require('../middlewares/validateObjectId')

// /api/categories
router.route("/")
    .post(verifyTokenAndAdmin , createCategoryCtrl)
    .get(getAllCategoriesCtrl)
    

router.route("/:id")
    .delete(validateObjectId , verifyTokenAndAdmin ,deleteCategoriesCtrl)


module.exports = router