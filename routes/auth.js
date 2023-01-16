const {Router} = require('express');
const { crearUsuario, loginUsuario, obtenerUsuarios, obtenerUsuarioPorId, revalidarToken } = require('../controllers/auth');
const router = Router()

const { validarJWT } = require('../middlewares/validar-jwt');

router.get('/', obtenerUsuarios)

router.post('/', crearUsuario)

router.post('/login', loginUsuario)

router.use(validarJWT);

// router.put('/update/:id', updateUser)

// router.put('/updateProfile/:id', updateUserProfile)

// router.delete('/delete/:id', deleteUser)


router.get('/user', obtenerUsuarioPorId)

router.get('/renew', revalidarToken)



module.exports = router;