import Router from 'express'
import { check } from 'express-validator'
import { authMiddleware, userController } from '../controllers/user.controller.js'

const router = new Router()

router.post('/user', [
    check('name', 'Имя не может быть пустым').notEmpty(),
    check('password', 'Пароль не может быть короче 4 символов').isLength({min: 4})
], userController.createUser)
router.get('/user', authMiddleware, userController.getUser)
router.put('/user', authMiddleware, userController.updateUser)
router.get('/users', authMiddleware, userController.getAllUsers)
router.get('/auth', userController.authentication)

export default router 



