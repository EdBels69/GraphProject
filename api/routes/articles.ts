import express from 'express'
import { ArticleController } from '../controllers/ArticleController'

const router = express.Router()

router.post('/', ArticleController.create)
router.get('/', ArticleController.getAll)
router.get('/:id', ArticleController.getById)

router.put('/:id', ArticleController.update)
router.delete('/:id', ArticleController.delete)

export default router
