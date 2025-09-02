const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddlewares')
const {signup, login, userInfo, updateProfile} = require('./authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/:id',authMiddleware, userInfo);
router.patch('/:id', authMiddleware, updateProfile)

module.exports = router;
