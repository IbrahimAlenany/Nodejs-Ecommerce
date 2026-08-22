const express = require('express');

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
} = require('../utils/validators/uservalidator');

const authServices = require('../services/authService');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
} = require('../services/userServices');

const router = express.Router();

router.put('/changePassword/:id', changeUserPassword)

router.use(authServices.protect, authServices.allowedTo('admin','manager'))

router.route('/')
.get(getUsers)
.post(
  uploadUserImage,
  resizeImage,
  createUserValidator,
  createUser);
router
  .route('/:id')
  .get(getUserValidator, getUser)
  .put(
    uploadUserImage,
    resizeImage,
    updateUserValidator,
    updateUser)
  .delete(deleteUserValidator, deleteUser);


module.exports = router;
