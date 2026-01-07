import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

interface ArticleNode {
  id: string
  title: string
  year: number
  citations: number
  category: string
  author: string
  abstract: string
  keywords: string[]
}

const articles: ArticleNode[] = [
  { id: 'a1', title: 'P53 signaling pathway in cancer', year: 2023, citations: 145, category: 'Oncology', author: 'Smith et al.', abstract: 'This study investigates...', keywords: ['P53', 'cancer', 'signaling'] },
  { id: 'a2', title: 'MDM2 regulation mechanisms', year: 2022, citations: 98, category: 'Oncology', author: 'Johnson et al.', abstract: 'MDM2 is a key regulator...', keywords: ['MDM2', 'P53', 'regulation'] },
  { id: 'a3', title: 'AKT1 network analysis', year: 2024, citations: 87, category: 'Bioinformatics', author: 'Williams et al.', abstract: 'Network analysis of AKT1...', keywords: ['AKT1', 'network', 'bioinformatics'] },
  { id: 'a4', title: 'EGFR inhibition strategies', year: 2023, citations: 112, category: 'Oncology', author: 'Brown et al.', abstract: 'Novel EGFR inhibitors...', keywords: ['EGFR', 'inhibition', 'cancer'] },
  { id: 'a5', title: 'PTEN tumor suppressor', year: 2021, citations: 234, category: 'Oncology', author: 'Davis et al.', abstract: 'PTEN role in tumor...', keywords: ['PTEN', 'tumor', 'suppressor'] },
  { id: 'a6', title: 'ATP metabolism in cancer', year: 2024, citations: 76, category: 'Metabolism', author: 'Garcia et al.', abstract: 'Metabolic changes in cancer...', keywords: ['ATP', 'metabolism', 'cancer'] },
  { id: 'a7', title: 'Glucose transport mechanisms', year: 2022, citations: 89, category: 'Metabolism', author: 'Martinez et al.', abstract: 'Glucose transport pathways...', keywords: ['glucose', 'transport', 'metabolism'] },
  { id: 'a8', title: 'BAX apoptosis pathway', year: 2023, citations: 67, category: 'Oncology', author: 'Lee et al.', abstract: 'BAX-mediated apoptosis...', keywords: ['BAX', 'apoptosis', 'cancer'] }
]

router.post('/', (req, res) => {
  try {
    const { title, year, citations, category, author, abstract, keywords } = req.body
    const article: ArticleNode = {
      id: uuidv4(),
      title,
      year: year || new Date().getFullYear(),
      citations: citations || 0,
      category: category || 'Uncategorized',
      author: author || 'Unknown',
      abstract: abstract || '',
      keywords: keywords || []
    }
    articles.push(article)
    res.status(201).json(article)
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload article' })
  }
})

router.get('/', (req, res) => {
  res.json(articles)
})

router.get('/:id', (req, res) => {
  const article = articles.find(a => a.id === req.params.id)
  if (!article) {
    return res.status(404).json({ error: 'Article not found' })
  }
  res.json(article)
})

router.put('/:id', (req, res) => {
  const index = articles.findIndex(a => a.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' })
  }
  articles[index] = { ...articles[index], ...req.body }
  res.json(articles[index])
})

router.delete('/:id', (req, res) => {
  const index = articles.findIndex(a => a.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' })
  }
  articles.splice(index, 1)
  res.status(204).send()
})

export default router
