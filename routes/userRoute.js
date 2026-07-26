const express = require('express');

// const {
//   getUserValidator,
//   createUserValidator,
//   updateUserValidator,
//   deleteUserValidator,
// } = require('../utils/validators/userValidator');

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
  createUser);
router
  .route('/:id')
  .get(getUser)
  .put(uploadUserImage,
    resizeImage,
    updateUser)
  .delete(deleteUser);

module.exports = router;
