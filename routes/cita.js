const {Router} = require('express');
const { getCita, getCitaList, crearCita, actualizarCita } = require('../controllers/cita');
const router = Router()

const { validarJWT } = require('../middlewares/validar-jwt');

router.get('/', getCita)

router.get('/list', getCitaList)

router.use(validarJWT);

router.post('/', crearCita)

router.put('/:id', actualizarCita)


// router.put('/update/:id', updateUser)

// router.delete('/delete/:id', deleteUser)

module.exports = router;