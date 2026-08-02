const express = require('express');

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
} = require('../utils/validators/uservalidator');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
} = require('../services/userServices');

const router = express.Router();

router.route('/')
.get(getUsers)
.post(uploadUserImage,
  resizeImage,
  createUserValidator,
  createUser);
router
  .route('/:id')
  .get(getUserValidator, getUser)
  .put(uploadUserImage,
    resizeImage,
    updateUserValidator,
    updateUser)
  .delete(deleteUserValidator, deleteUser);


module.exports = router;
