var express = require('express');
var router = express.Router();
var User = require('../../controllers/userController');
const auth = require('../middleware/auth');

/*
@ param: req, res
@ Utils: Create an user
@ endpoint: /api/user/create
@ Method: POST - public
*/
router.post('/register', function (req, res) {
  User.createUser(req, res);
})

/*
@ param: req, res
@ Utils: Create an user
@ endpoint: /api/user/login
@ Method: POST - public
*/
router.post('/login', function (req, res) {
  User.loginUser(req, res);
})

/*
@ param: req, res
@ Utils: Get an user
@ endpoint: /api/user/profile
@ Method: GET - private (auth required)
*/
router.get('/profile', auth, function (req, res) {
  User.getProfile(req, res);
})

/*
@ param: req, res
@ Utils: Patch an user
@ endpoint: /api/user/profile
@ Method: PATCH - private (auth required)
*/
router.patch('/profile', auth, function (req, res) {
  var user_id = req.user._id;
  User.updateUser(req, res, user_id);
})
router.patch('/updateRole/:id', auth, function (req, res) {
  if (req.user.role === 2) { // Only admins can update roles
    User.updateUserRole(req, res, req.params.id);
  } else {
    res.status(401).json({ success: false, msg: "Unauthorized" });
  }
});
router.get('/getAllUsers', auth, function (req, res) {
  if (req.user.role === 2) { // Only admins can fetch all users
    User.getAllUsers(req, res);
  } else {
    res.status(401).json({ success: false, msg: "Unauthorized" });
  }
});
/*
@ param: req, res
@ Utils: Delete an user
@ endpoint: /api/user/profile
@ Method: DELETE - private (auth required)
*/
router.delete('/profile', auth, function (req, res) {
  var user_id = req.user._id;
  User.deleteUser(req, res, user_id);
})

module.exports = router;