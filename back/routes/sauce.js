const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauce');

router.get('/', auth, sauceCtrl.getAllSauce)
router.post('/', auth, multer, sauceCtrl.getAllSauce)
router.get('/:id', auth, sauceCtrl.getAllSauce);
router.put('/:id', auth, multer, sauceCtrl.getAllSauce);
router.delete('/:id', auth, sauceCtrl.getAllSauce);
router.post('/:id/like', auth, sauceCtrl.getAllSauce);


module.exports = router;
