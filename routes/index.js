const express = require('express');
const controller = require('../controller');

const router = express.Router();

/* GET home page. */
router.get('/', controller.home);

router.get('/login', controller.login);

router.get('/logout', controller.logout);

router.get('/oauthredirect', controller.oauthredirect);

module.exports = router;
