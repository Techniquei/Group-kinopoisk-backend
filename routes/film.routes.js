import { Router } from "express";
import { filmsController } from "../controllers/films.controller.js";
import { authMiddleware } from "../controllers/user.controller.js";

const router = new Router()

router.post('/addFilm', authMiddleware, filmsController.addFilm)
router.get('/films', authMiddleware, filmsController.getFilmsByUser)



export default router