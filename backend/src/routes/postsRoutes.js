import express from 'express'
import { createPost } from '../controllers/postController.js'
import { buildResponse } from '../utils/buildResponse.js'
import handleHttpError from '../utils/handleHttpError.js'
import Post from '../models/postModels.js'

const router = express.Router()

router.post('/', createPost({ Post, buildResponse, handleHttpError }))

export default router