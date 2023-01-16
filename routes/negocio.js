const {Router} = require('express');
const { getNegocio, crearNegocio, actualizarNegocio } = require('../controllers/negocio');
const router = Router()

const { validarJWT } = require('../middlewares/validar-jwt');

router.get('/', getNegocio)

router.use(validarJWT);

router.post('/', crearNegocio)

router.put('/:id', actualizarNegocio)


// router.put('/update/:id', updateUser)

// router.delete('/delete/:id', deleteUser)

module.exports = router;