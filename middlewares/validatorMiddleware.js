const { validaionResult } = require('validator');
const validatorMiddleware = (req, res, next) => {
    const errors = validaionResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next();
};

module.exports = validatorMiddleware;