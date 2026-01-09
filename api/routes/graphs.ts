import express from 'express'
import multer from 'multer'
import { GraphController } from '../controllers/GraphController'
import { graphRuntime } from '../services/GraphRuntimeService'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Initialize runtime
graphRuntime.initialize()

// Graph CRUD
router.get('/', GraphController.getAll)
router.get('/:id', GraphController.getById)
router.post('/', GraphController.create)
router.put('/:id', GraphController.update)
router.delete('/:id', GraphController.delete)

// Nodes
router.get('/:id/nodes', GraphController.getNodes)
router.post('/:id/nodes', GraphController.addNode)
router.delete('/:graphId/nodes/:nodeId', GraphController.deleteNode)

// Edges
router.get('/:id/edges', GraphController.getEdges)
router.post('/:id/edges', GraphController.addEdge)
router.delete('/:graphId/edges/:edgeId', GraphController.deleteEdge)

// Upload
router.post('/upload', upload.single('file'), GraphController.upload)

// Analysis
router.get('/:id/centrality', GraphController.getCentrality)
router.get('/:id/shortest-path', GraphController.getShortestPath)
router.get('/:id/all-shortest-paths', GraphController.getAllShortestPaths)
router.get('/:id/connectivity', GraphController.checkConnectivity)
router.get('/:id/statistics', GraphController.getStatistics)
router.post('/:id/validate', GraphController.validate)
router.post('/:id/research', GraphController.research)

// Exports
router.get('/:id/export/gexf', GraphController.exportGEXF)
router.get('/:id/export/pdf', GraphController.exportPDF)

export default router