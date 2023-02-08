import { pool } from "../db.js"


class FilmsController {
    async addFilm(req, res){
        try {
            const {filmId} = req.body
            const {userId} = req
            const duplicates = await pool.query(`SELECT * FROM films WHERE film_id = $1`, [filmId])
            if(duplicates.rows.length>0){
                return res.status(400).json({message: "Фильм уже добавлен"})
            }
            const newFilm = await pool.query(`INSERT INTO films (film_id, user_id) values ($1, $2) RETURNING *`, [filmId, userId])
            res.json(newFilm.rows)
        } catch (error) {
            return res.status(400).json({message: "Произошла ошибка"})
        }
        
    }

    async getFilmsByUser(req, res){
        const id = req.userId
        const films = await pool.query(`SELECT * FROM films WHERE user_id = $1`, [id])
        res.json(films.rows)
    }

}

export const filmsController = new FilmsController()