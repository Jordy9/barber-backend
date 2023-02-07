const {Router} = require('express');
const { getRating, crearRating } = require('../controllers/rating');
const router = Router()

const { validarJWT } = require('../middlewares/validar-jwt');

router.use(validarJWT);

router.get('/', getRating)

router.post('/', crearRating)

module.exports = router;