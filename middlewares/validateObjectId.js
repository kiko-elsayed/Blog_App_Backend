const mongoose = require('mongoose')

module.exports = (req,res,next)=>{
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(401).json({message : "invalid Id"})
        
    }
    next();
}