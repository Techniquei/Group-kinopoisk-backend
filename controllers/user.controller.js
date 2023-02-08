import { pool } from "../db.js"
import bcrypt from "bcryptjs"
import { validationResult } from "express-validator"
import jsonwebtoken from "jsonwebtoken"
import { SECRET_KEY } from "./config.js"

const generateAccessToken = (id)  => {
    const payload = {
        id
    }
    return jsonwebtoken.sign(payload, SECRET_KEY, {expiresIn:"24h"})
}

export const authMiddleware = (req, res, next)=>{
    try{
        const token = req.headers.authorization.split(' ')[1]
        if(!token){
            return res.status(403).json({message: "Пользователь не авторизован"})
        }
        const decodedData =  jsonwebtoken.verify(token, SECRET_KEY)
        console.log(decodedData)
        req.userId = decodedData.id
        next()
    }catch(e){
        console.log(e)
        return res.status(403).json({message: "Пользователь не авторизован"})
    }
}

class UserController {
    async createUser(req, res){
        try{
            const errors = validationResult(req)
            console.log(errors)
            if(!errors.isEmpty()){
                return res.status(400).json({message: 'Неверные данные', errors})
            }
            const {name, password} = req.body
            const duplicates = await pool.query(`SELECT * FROM person WHERE name = $1`, [name])
            console.log(duplicates)
            if (duplicates.rows.length>0){
                return res.status(400).json({message: "Пользователь с таким именем уже существует"})
            }
            const hashPassword = bcrypt.hashSync(password, 2)
            await  pool.query(`INSERT INTO person (name, password) values ($1, $2) RETURNING *`, [name, hashPassword])
            return res.json({message: `Пользователь ${name} успешно зарегистрирован`}) 
        } catch (e) {
            console.log(e)
            res.status(400).json({message:'Ошибка при регистрации'})
        }
        
    }

    async getUser(req, res){
        const id = req.userId
        const users = await pool.query(`SELECT * FROM person WHERE id = $1`, [id])
        res.json(users.rows[0])
    }

    async getAllUsers(req, res){
        const users = await pool.query(`SELECT * FROM person`)
        res.json(users.rows)
    }

    async authentication(req, res){
        try {
            const {name, password} = req.body
            const users = await pool.query(`SELECT * FROM person WHERE name = $1`, [name])
            if(users.rows.length===0){
                return res.status(400).json('Неверный логин')
            }
            const validPassword = bcrypt.compareSync(password, users.rows[0].password)
            if(!validPassword){
                return res.status(400).json('Неверный пароль')
            }
            const user = users.rows[0]
            const token = generateAccessToken(user.id)
            return res.json({token})
        } catch (error) {
            console.log(error)
            res.status(400).json({message:'Ошибка авторизации'})
        }
        
    }

    async updateUser(req, res){
        const id  = req.userId
        const { name, password} = req.body
        const newHashPassword = bcrypt.hashSync(password, 2)
        const user = await pool.query(`UPDATE person set name = $1, password = $2 where id = $3 returning *`, [name, newHashPassword, id])
        res.json(user.rows[0])
    }
}

export const userController = new UserController()