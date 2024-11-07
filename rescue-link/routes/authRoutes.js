const express = require('express');
const router = express.Router();
const userController = require('../controllers/authController');

router.post('/register', userController.register);
router.get('/users/:user_id', userController.getUserById);
router.get('/users/:user_id/role', userController.getUserRole);
router.get('/users', userController.getAllUsers);
router.delete('/users/delete/:user_id', userController.unregisterUser);
router.delete('/users/unregister', userController.unregisterAllUsers);
router.post('/login', userController.login);
router.post('/logout', userController.logout);


module.exports = router;
