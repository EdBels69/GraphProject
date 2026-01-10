import express from 'express'
import { ArticleController } from '../controllers/ArticleController'

const router = express.Router()

router.post('/', ArticleController.create)
router.get('/', ArticleController.getAll)
router.get('/:id', ArticleController.getById)

router.put('/:id', async (req, res) => {
  return res.status(501).json({ error: 'Update not fully implemented' })
})

router.delete('/:id', async (req, res) => {
  return res.status(501).json({ error: 'Delete not implemented' })
})

export default router
