import express from 'express'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import * as parquet from 'parquetjs-lite'
import { ChunkingEngine } from '../services/chunkingEngine'
import { EntityExtractor } from '../services/entityExtractor'
import { KnowledgeGraphBuilder } from '../services/knowledgeGraphBuilder'
import { RelationExtractor } from '../services/relationExtractor'
import { databaseManager } from '../core/Database'
import { logger } from '../core/Logger'
import type { Entity } from '../services/entityExtractor'
import type { Relation } from '../services/relationExtractor'
import type { Publication, Work } from '../../shared/types'

const router = express.Router()
const chunkingEngine = new ChunkingEngine()
const entityExtractor = new EntityExtractor()
const relationExtractor = new RelationExtractor()
const knowledgeGraphBuilder = new KnowledgeGraphBuilder()

type PublicationProcessingResult = {
  processed: number
  skipped: number
  totalAvailable: number
}

type WorkExportGraph = {
  id: string
  name: string
  nodes: unknown[]
  edges: unknown[]
  directed: boolean
  createdAt: string
  updatedAt: string
}

type WorkExportBundle = {
  version: number
  exportedAt: string
  work: Work
  publications: Publication[]
  workPublications: Array<{ workId: string; publicationId: string; attachType: string; provenance?: unknown; createdAt: string }>
  graphs: WorkExportGraph[]
}

type PublicationTableSummary = {
  processed: number
  skipped: number
  totalAvailable: number
}

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  clinical: [
    'clinical', 'trial', 'patient', 'cohort', 'therapy', 'treatment', 'dose', 'safety', 'efficacy', 'randomized', 'placebo',
    'клинический', 'клинические', 'пациент', 'пациенты', 'исследование', 'терапия', 'лечение', 'доза', 'безопасность', 'эффективность'
  ],
  genomic: [
    'genome', 'genomic', 'gene', 'dna', 'rna', 'mutation', 'variant', 'snv', 'snp', 'transcript', 'expression', 'sequencing', 'rna-seq', 'crispr',
    'геном', 'геномный', 'ген', 'днк', 'рнк', 'мутация', 'вариант', 'транскрипт', 'экспрессия', 'секвенирование'
  ],
  biochemical: [
    'enzyme', 'metabolic', 'metabolism', 'protein', 'kinase', 'pathway', 'molecule', 'ligand', 'binding', 'assay', 'substrate', 'cofactor', 'oxidation', 'phosphorylation',
    'фермент', 'метаболизм', 'белок', 'киназа', 'путь', 'молекула', 'лиганд', 'связывание', 'анализ', 'субстрат', 'кофактор', 'окисление', 'фосфорилирование'
  ]
}

const safeFilenamePart = (value: string): string =>
  value
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 60)
    .replace(/^_+|_+$/g, '') || 'work'

const joinList = (items: string[]): string | undefined =>
  items.length > 0 ? items.join('|') : undefined

const buildParquetFile = async (
  rows: Array<{
    publicationId: string
    title: string
    abstract?: string
    year?: number
    source?: string
    doi?: string
    pmid?: string
    keywords: string[]
    domains: string[]
  }>,
  baseName: string
): Promise<{ filePath: string; fileName: string; dirPath: string }> => {
  const dirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'graphproject-'))
  const fileName = `${baseName}.parquet`
  const filePath = path.join(dirPath, fileName)

  const schema = new parquet.ParquetSchema({
    publicationId: { type: 'UTF8' },
    title: { type: 'UTF8' },
    abstract: { type: 'UTF8', optional: true },
    year: { type: 'INT32', optional: true },
    source: { type: 'UTF8', optional: true },
    doi: { type: 'UTF8', optional: true },
    pmid: { type: 'UTF8', optional: true },
    domains: { type: 'UTF8', optional: true },
    keywords: { type: 'UTF8', optional: true }
  })

  const writer = await parquet.ParquetWriter.openFile(schema, filePath)
  try {
    for (const row of rows) {
      await writer.appendRow({
        publicationId: row.publicationId,
        title: row.title,
        abstract: row.abstract ?? undefined,
        year: row.year ?? undefined,
        source: row.source ?? undefined,
        doi: row.doi ?? undefined,
        pmid: row.pmid ?? undefined,
        domains: joinList(row.domains),
        keywords: joinList(row.keywords)
      })
    }
  } finally {
    await writer.close()
  }

  return { filePath, fileName, dirPath }
}

const collectPublications = async (workId: string): Promise<Publication[]> => {
  const items: Publication[] = []
  const limit = 200
  let offset = 0
  while (true) {
    const result = await databaseManager.publications.findByWorkId(workId, { limit, offset })
    items.push(...result.items)
    offset += result.items.length
    if (offset >= result.total || result.items.length === 0) break
  }
  return items
}

const collectWorkPublications = async (workId: string): Promise<Array<{ workId: string; publicationId: string; attachType: string; provenance?: unknown; createdAt: string }>> => {
  const items: Array<{ workId: string; publicationId: string; attachType: string; provenance?: unknown; createdAt: string }> = []
  const limit = 500
  let offset = 0
  while (true) {
    const result = await databaseManager.workPublications.listByWorkId(workId, { limit, offset })
    items.push(...result.items)
    offset += result.items.length
    if (offset >= result.total || result.items.length === 0) break
  }
  return items
}

const normalizeText = (value: string): string => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

const extractKeywords = (text: string, maxKeywords: number): string[] => {
  const tokens = normalizeText(text).split(' ').filter(Boolean)
  const counts = new Map<string, number>()
  for (const token of tokens) {
    if (token.length < 4) continue
    counts.set(token, (counts.get(token) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .slice(0, maxKeywords)
    .map(([token]) => token)
}

const detectDomains = (text: string): string[] => {
  const normalized = ` ${normalizeText(text)} `
  return Object.entries(DOMAIN_KEYWORDS)
    .filter(([, keywords]) => keywords.some(keyword => normalized.includes(` ${keyword} `)))
    .map(([domain]) => domain)
}

async function buildPublicationTable(workId: string, maxPublications: number): Promise<PublicationTableSummary> {
  const batchSize = 200
  let offset = 0
  let processed = 0
  let skipped = 0
  let totalAvailable = 0

  while (true) {
    const result = await databaseManager.publications.findByWorkId(workId, {
      limit: batchSize,
      offset
    })

    if (offset === 0) totalAvailable = result.total
    if (!result.items.length) break

    for (const pub of result.items as Publication[]) {
      if (processed >= maxPublications) break
      const title = String(pub.title || '').trim()
      const abstract = typeof pub.abstract === 'string' ? pub.abstract.trim() : ''
      const content = [title, abstract].filter(Boolean).join(' ')
      if (content.length < 20) {
        skipped += 1
        continue
      }

      const keywords = extractKeywords(content, 40)
      const domains = detectDomains(content)

      await databaseManager.workPublicationRows.upsert({
        workId,
        publicationId: pub.id,
        title: title || 'Untitled',
        abstract,
        year: pub.year,
        source: pub.source,
        doi: pub.doi,
        pmid: pub.pmid,
        keywords,
        domains
      })

      processed += 1
    }

    if (processed >= maxPublications) break
    offset += result.items.length
    if (offset >= result.total) break
  }

  return { processed, skipped, totalAvailable }
}

async function processPublicationsToGraph(workId: string, maxPublications: number): Promise<{
  graphId: string
  graphName: string
  nodes: number
  edges: number
  summary: PublicationProcessingResult
}> {
  const batchSize = 200
  let offset = 0
  let processed = 0
  let skipped = 0
  let totalAvailable = 0
  const allEntities: Entity[] = []
  const allRelations: Relation[] = []

  while (true) {
    const result = await databaseManager.publications.findByWorkId(workId, {
      limit: batchSize,
      offset
    })

    if (offset === 0) totalAvailable = result.total
    if (!result.items.length) break

    for (const pub of result.items as Publication[]) {
      if (processed >= maxPublications) break
      const title = String(pub.title || '').trim()
      const abstract = typeof pub.abstract === 'string' ? pub.abstract.trim() : ''
      const content = [title, abstract].filter(Boolean).join('\n\n')

      if (content.length < 20) {
        skipped += 1
        continue
      }

      const docId = `publication-${pub.id}`
      await databaseManager.documents.upsert({
        id: docId,
        title: title || 'Untitled',
        content,
        url: pub.url,
        status: 'completed',
        metadata: {
          fileType: 'publication',
          publicationId: pub.id,
          source: pub.source,
          year: pub.year,
          doi: pub.doi,
          pmid: pub.pmid,
          extractedAt: new Date().toISOString()
        }
      })

      await databaseManager.documents.linkToWork(workId, docId)

      const chunks = await chunkingEngine.chunkText(content, docId)
      const extractedEntities = await entityExtractor.extractFromChunks(chunks)
      const extractedRelations = await relationExtractor.extractRelations(
        content,
        extractedEntities.entities,
        docId
      )

      allEntities.push(...extractedEntities.entities)
      allRelations.push(...extractedRelations.relations)
      processed += 1
    }

    if (processed >= maxPublications) break
    offset += result.items.length
    if (offset >= result.total) break
  }

  const knowledgeGraph = await knowledgeGraphBuilder.buildGraph(allEntities, allRelations)
  await databaseManager.saveGraphToDb(knowledgeGraph.graph)
  await databaseManager.linkGraphToWork(workId, knowledgeGraph.graph.id)

  return {
    graphId: knowledgeGraph.graph.id,
    graphName: knowledgeGraph.graph.name,
    nodes: knowledgeGraph.graph.nodes.length,
    edges: knowledgeGraph.graph.edges.length,
    summary: { processed, skipped, totalAvailable }
  }
}

router.get('/', async (req, res) => {
  const works = await databaseManager.works.findAll()
  res.json({
    success: true,
    data: works,
    count: works.length
  })
})

router.post('/', async (req, res) => {
  const { name, description } = req.body

  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: 'name is required and must be a non-empty string'
    })
  }

  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'description must be a string'
    })
  }

  const work = await databaseManager.works.create({
    name: name.trim(),
    description: description?.trim()
  })

  res.status(201).json({
    success: true,
    data: work
  })
})

router.get('/:id', async (req, res) => {
  const { id } = req.params
  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  res.json({
    success: true,
    data: work
  })
})

router.get('/:id/publications', async (req, res) => {
  const { id } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { q, limit, offset } = req.query

  if (q !== undefined && typeof q !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'q must be a string'
    })
  }

  const parsedLimit = limit !== undefined ? Number(limit) : undefined
  const parsedOffset = offset !== undefined ? Number(offset) : undefined

  if (parsedLimit !== undefined && (!Number.isFinite(parsedLimit) || parsedLimit < 1)) {
    return res.status(400).json({
      success: false,
      error: 'limit must be a positive number'
    })
  }

  if (parsedOffset !== undefined && (!Number.isFinite(parsedOffset) || parsedOffset < 0)) {
    return res.status(400).json({
      success: false,
      error: 'offset must be a non-negative number'
    })
  }

  const result = await databaseManager.publications.findByWorkId(id, {
    q: typeof q === 'string' ? q : undefined,
    limit: parsedLimit,
    offset: parsedOffset
  })

  res.json({
    success: true,
    data: {
      work,
      total: result.total,
      items: result.items
    }
  })
})

router.post('/:id/build-graph-from-publications', async (req, res) => {
  const { id } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { maxPublications } = req.body
  const parsedMax = maxPublications !== undefined ? Number(maxPublications) : 2000
  if (!Number.isFinite(parsedMax) || parsedMax < 1) {
    return res.status(400).json({
      success: false,
      error: 'maxPublications must be a positive number'
    })
  }

  try {
    const summary = await processPublicationsToGraph(id, Math.min(parsedMax, 2000))

    res.json({
      success: true,
      data: {
        work,
        graphId: summary.graphId,
        graphName: summary.graphName,
        nodes: summary.nodes,
        edges: summary.edges,
        summary: summary.summary
      }
    })
  } catch (error) {
    logger.error('WorksRoute', 'Failed to build graph from publications', { error })
    res.status(500).json({
      success: false,
      error: 'Failed to build graph from publications'
    })
  }
})

router.post('/:id/build-table-from-publications', async (req, res) => {
  const { id } = req.params
  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { maxPublications } = req.body
  const parsedMax = maxPublications !== undefined ? Number(maxPublications) : 2000
  if (!Number.isFinite(parsedMax) || parsedMax < 1) {
    return res.status(400).json({
      success: false,
      error: 'maxPublications must be a positive number'
    })
  }

  try {
    const summary = await buildPublicationTable(id, Math.min(parsedMax, 5000))
    res.json({
      success: true,
      data: {
        work,
        summary
      }
    })
  } catch (error) {
    logger.error('WorksRoute', 'Failed to build publication table', { error })
    res.status(500).json({
      success: false,
      error: 'Failed to build publication table'
    })
  }
})

router.get('/:id/table', async (req, res) => {
  const { id } = req.params
  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { q, domain, yearFrom, yearTo, limit, offset } = req.query

  const parsedLimit = limit !== undefined ? Number(limit) : undefined
  const parsedOffset = offset !== undefined ? Number(offset) : undefined
  const parsedYearFrom = yearFrom !== undefined ? Number(yearFrom) : undefined
  const parsedYearTo = yearTo !== undefined ? Number(yearTo) : undefined

  if (q !== undefined && typeof q !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'q must be a string'
    })
  }

  if (parsedLimit !== undefined && (!Number.isFinite(parsedLimit) || parsedLimit < 1)) {
    return res.status(400).json({
      success: false,
      error: 'limit must be a positive number'
    })
  }

  if (parsedOffset !== undefined && (!Number.isFinite(parsedOffset) || parsedOffset < 0)) {
    return res.status(400).json({
      success: false,
      error: 'offset must be a non-negative number'
    })
  }

  if (parsedYearFrom !== undefined && !Number.isFinite(parsedYearFrom)) {
    return res.status(400).json({
      success: false,
      error: 'yearFrom must be a number'
    })
  }

  if (parsedYearTo !== undefined && !Number.isFinite(parsedYearTo)) {
    return res.status(400).json({
      success: false,
      error: 'yearTo must be a number'
    })
  }

  const domains = typeof domain === 'string'
    ? domain.split(',').map(d => d.trim()).filter(Boolean)
    : []

  const result = await databaseManager.workPublicationRows.listByWorkId(id, {
    q: typeof q === 'string' ? q.trim() : undefined,
    domains,
    yearFrom: parsedYearFrom,
    yearTo: parsedYearTo,
    limit: parsedLimit,
    offset: parsedOffset
  })

  res.json({
    success: true,
    data: {
      work,
      total: result.total,
      items: result.items
    }
  })
})

router.get('/:id/table/export', async (req, res) => {
  const { id } = req.params
  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const format = String(req.query.format || 'json').toLowerCase()
  const { q, domain, yearFrom, yearTo } = req.query
  const parsedYearFrom = yearFrom !== undefined ? Number(yearFrom) : undefined
  const parsedYearTo = yearTo !== undefined ? Number(yearTo) : undefined
  const domains = typeof domain === 'string'
    ? domain.split(',').map(d => d.trim()).filter(Boolean)
    : []

  const all: Array<{ workId: string; publicationId: string; title: string; abstract?: string; year?: number; source?: string; doi?: string; pmid?: string; keywords: string[]; domains: string[]; createdAt: string; updatedAt: string }> = []
  let offset = 0
  const limit = 200
  while (true) {
    const result = await databaseManager.workPublicationRows.listByWorkId(id, {
      q: typeof q === 'string' ? q.trim() : undefined,
      domains,
      yearFrom: parsedYearFrom,
      yearTo: parsedYearTo,
      limit,
      offset
    })
    all.push(...result.items)
    offset += result.items.length
    if (offset >= result.total || result.items.length === 0) break
  }

  const datePart = new Date().toISOString().slice(0, 10)
  const baseName = `work-table-${safeFilenamePart(work.id)}-${datePart}`

  if (format === 'csv') {
    const headers = ['publicationId', 'title', 'abstract', 'year', 'source', 'doi', 'pmid', 'domains', 'keywords']
    const csv = [headers.join(',')].concat(all.map(row => {
      const values = [
        row.publicationId,
        row.title,
        row.abstract ?? '',
        row.year !== undefined ? String(row.year) : '',
        row.source ?? '',
        row.doi ?? '',
        row.pmid ?? '',
        row.domains.join('|'),
        row.keywords.join('|')
      ]
      return values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    }))
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}.csv"`)
    return res.send(`\ufeff${csv.join('\n')}`)
  }

  if (format === 'parquet') {
    try {
      const { filePath, fileName, dirPath } = await buildParquetFile(all, baseName)
      return res.download(filePath, fileName, async err => {
        try {
          await fs.rm(dirPath, { recursive: true, force: true })
        } catch (cleanupError) {
          logger.error('WorksRoute', 'Failed to cleanup parquet export temp', { cleanupError })
        }
        if (err) {
          logger.error('WorksRoute', 'Failed to send parquet export', { err })
        }
      })
    } catch (error) {
      logger.error('WorksRoute', 'Failed to build parquet export', { error })
      return res.status(500).json({
        success: false,
        error: 'Failed to export parquet'
      })
    }
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${baseName}.json"`)
  return res.send(JSON.stringify({
    workId: work.id,
    exportedAt: new Date().toISOString(),
    data: all
  }, null, 2))
})

router.get('/:id/profiles', async (req, res) => {
  const { id } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { limit, offset } = req.query

  const parsedLimit = limit !== undefined ? Number(limit) : undefined
  const parsedOffset = offset !== undefined ? Number(offset) : undefined

  if (parsedLimit !== undefined && (!Number.isFinite(parsedLimit) || parsedLimit < 1)) {
    return res.status(400).json({
      success: false,
      error: 'limit must be a positive number'
    })
  }

  if (parsedOffset !== undefined && (!Number.isFinite(parsedOffset) || parsedOffset < 0)) {
    return res.status(400).json({
      success: false,
      error: 'offset must be a non-negative number'
    })
  }

  const result = await databaseManager.profiles.listByWorkId(id, {
    limit: parsedLimit,
    offset: parsedOffset
  })

  res.json({
    success: true,
    data: {
      work,
      total: result.total,
      items: result.items
    }
  })
})

router.post('/:id/profiles', async (req, res) => {
  const { id } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { name, config } = req.body

  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: 'name is required and must be a non-empty string'
    })
  }

  const profile = await databaseManager.profiles.create({
    workId: id,
    name: name.trim(),
    config: config ?? {}
  })

  res.status(201).json({
    success: true,
    data: profile
  })
})

router.patch('/:id/profiles/:profileId', async (req, res) => {
  const { id, profileId } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const existing = await databaseManager.profiles.findById(profileId)
  if (!existing || existing.workId !== id) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    })
  }

  const { name, config } = req.body

  if (name !== undefined && typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'name must be a string'
    })
  }

  const updated = await databaseManager.profiles.update(profileId, {
    name: typeof name === 'string' ? name.trim() : undefined,
    config: config !== undefined ? config : undefined
  })

  res.json({
    success: true,
    data: updated
  })
})

router.delete('/:id/profiles/:profileId', async (req, res) => {
  const { id, profileId } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const existing = await databaseManager.profiles.findById(profileId)
  if (!existing || existing.workId !== id) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    })
  }

  const deleted = await databaseManager.profiles.delete(profileId)
  res.json({
    success: true,
    data: { deleted }
  })
})

router.get('/:id/selections', async (req, res) => {
  const { id } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { limit, offset } = req.query

  const parsedLimit = limit !== undefined ? Number(limit) : undefined
  const parsedOffset = offset !== undefined ? Number(offset) : undefined

  if (parsedLimit !== undefined && (!Number.isFinite(parsedLimit) || parsedLimit < 1)) {
    return res.status(400).json({
      success: false,
      error: 'limit must be a positive number'
    })
  }

  if (parsedOffset !== undefined && (!Number.isFinite(parsedOffset) || parsedOffset < 0)) {
    return res.status(400).json({
      success: false,
      error: 'offset must be a non-negative number'
    })
  }

  const result = await databaseManager.selections.listByWorkId(id, {
    limit: parsedLimit,
    offset: parsedOffset
  })

  res.json({
    success: true,
    data: {
      work,
      total: result.total,
      items: result.items
    }
  })
})

router.post('/:id/selections', async (req, res) => {
  const { id } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { name, query, derivedFromProfileVersion } = req.body

  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: 'name is required and must be a non-empty string'
    })
  }

  if (derivedFromProfileVersion !== undefined && derivedFromProfileVersion !== null && typeof derivedFromProfileVersion !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'derivedFromProfileVersion must be a number'
    })
  }

  const selection = await databaseManager.selections.create({
    workId: id,
    name: name.trim(),
    query: query ?? {},
    derivedFromProfileVersion: typeof derivedFromProfileVersion === 'number' ? derivedFromProfileVersion : undefined
  })

  res.status(201).json({
    success: true,
    data: selection
  })
})

router.patch('/:id/selections/:selectionId', async (req, res) => {
  const { id, selectionId } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const existing = await databaseManager.selections.findById(selectionId)
  if (!existing || existing.workId !== id) {
    return res.status(404).json({
      success: false,
      error: 'Selection not found'
    })
  }

  const { name, query, derivedFromProfileVersion } = req.body

  if (name !== undefined && typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'name must be a string'
    })
  }

  if (derivedFromProfileVersion !== undefined && derivedFromProfileVersion !== null && typeof derivedFromProfileVersion !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'derivedFromProfileVersion must be a number'
    })
  }

  const updated = await databaseManager.selections.update(selectionId, {
    name: typeof name === 'string' ? name.trim() : undefined,
    query: query !== undefined ? query : undefined,
    derivedFromProfileVersion: derivedFromProfileVersion !== undefined ? derivedFromProfileVersion : undefined
  })

  res.json({
    success: true,
    data: updated
  })
})

router.delete('/:id/selections/:selectionId', async (req, res) => {
  const { id, selectionId } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const existing = await databaseManager.selections.findById(selectionId)
  if (!existing || existing.workId !== id) {
    return res.status(404).json({
      success: false,
      error: 'Selection not found'
    })
  }

  const deleted = await databaseManager.selections.delete(selectionId)
  res.json({
    success: true,
    data: { deleted }
  })
})

router.get('/:id/search-runs', async (req, res) => {
  const { id } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { limit, offset } = req.query

  const parsedLimit = limit !== undefined ? Number(limit) : undefined
  const parsedOffset = offset !== undefined ? Number(offset) : undefined

  if (parsedLimit !== undefined && (!Number.isFinite(parsedLimit) || parsedLimit < 1)) {
    return res.status(400).json({
      success: false,
      error: 'limit must be a positive number'
    })
  }

  if (parsedOffset !== undefined && (!Number.isFinite(parsedOffset) || parsedOffset < 0)) {
    return res.status(400).json({
      success: false,
      error: 'offset must be a non-negative number'
    })
  }

  const result = await databaseManager.searchRuns.listByWorkId(id, {
    limit: parsedLimit,
    offset: parsedOffset
  })

  res.json({
    success: true,
    data: {
      work,
      total: result.total,
      items: result.items
    }
  })
})

router.get('/:id/jobs', async (req, res) => {
  const { id } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { limit, offset } = req.query
  const parsedLimit = limit !== undefined ? Number(limit) : undefined
  const parsedOffset = offset !== undefined ? Number(offset) : undefined

  if (parsedLimit !== undefined && (!Number.isFinite(parsedLimit) || parsedLimit < 1)) {
    return res.status(400).json({
      success: false,
      error: 'limit must be a positive number'
    })
  }

  if (parsedOffset !== undefined && (!Number.isFinite(parsedOffset) || parsedOffset < 0)) {
    return res.status(400).json({
      success: false,
      error: 'offset must be a non-negative number'
    })
  }

  const result = await databaseManager.workJobs.listByWorkId(id, {
    limit: parsedLimit,
    offset: parsedOffset
  })

  res.json({
    success: true,
    data: {
      work,
      total: result.total,
      items: result.items
    }
  })
})

router.get('/:id/jobs/:jobId', async (req, res) => {
  const { id, jobId } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const job = await databaseManager.workJobs.findById(jobId)
  if (!job || job.workId !== id) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    })
  }

  res.json({
    success: true,
    data: {
      work,
      job
    }
  })
})

router.get('/:id/artifacts', async (req, res) => {
  const { id } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { limit, offset } = req.query

  const parsedLimit = limit !== undefined ? Number(limit) : undefined
  const parsedOffset = offset !== undefined ? Number(offset) : undefined

  if (parsedLimit !== undefined && (!Number.isFinite(parsedLimit) || parsedLimit < 1)) {
    return res.status(400).json({
      success: false,
      error: 'limit must be a positive number'
    })
  }

  if (parsedOffset !== undefined && (!Number.isFinite(parsedOffset) || parsedOffset < 0)) {
    return res.status(400).json({
      success: false,
      error: 'offset must be a non-negative number'
    })
  }

  const result = await databaseManager.artifacts.listByWorkId(id, {
    limit: parsedLimit,
    offset: parsedOffset
  })

  res.json({
    success: true,
    data: {
      work,
      total: result.total,
      items: result.items
    }
  })
})

router.get('/:id/artifacts/:artifactId', async (req, res) => {
  const { id, artifactId } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const artifact = await databaseManager.artifacts.findById(artifactId)
  if (!artifact || artifact.workId !== id) {
    return res.status(404).json({
      success: false,
      error: 'Artifact not found'
    })
  }

  res.json({
    success: true,
    data: {
      work,
      artifact
    }
  })
})

router.get('/:id/artifacts/:artifactId/graph', async (req, res) => {
  const { id, artifactId } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const artifact = await databaseManager.artifacts.findById(artifactId)
  if (!artifact || artifact.workId !== id) {
    return res.status(404).json({
      success: false,
      error: 'Artifact not found'
    })
  }

  const graph = await databaseManager.artifacts.getGraph(artifactId)
  const stats = artifact.stats
  let directed = false
  if (typeof stats === 'object' && stats !== null && 'directed' in stats) {
    const value = (stats as Record<string, unknown>).directed
    directed = typeof value === 'boolean' ? value : Boolean(value)
  }

  res.json({
    success: true,
    data: {
      work,
      artifact,
      graph: {
        ...graph,
        directed
      }
    }
  })
})

router.post('/:id/artifacts/build', async (req, res) => {
  const { id } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const { type, params, selectionId, profileVersion, sourceGraphId } = req.body

  if (!type || typeof type !== 'string' || type.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: 'type is required and must be a non-empty string'
    })
  }

  if (selectionId !== undefined && selectionId !== null && typeof selectionId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'selectionId must be a string'
    })
  }

  if (profileVersion !== undefined && profileVersion !== null && typeof profileVersion !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'profileVersion must be a number'
    })
  }

  if (sourceGraphId !== undefined && sourceGraphId !== null && typeof sourceGraphId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'sourceGraphId must be a string'
    })
  }

  if (typeof selectionId === 'string') {
    const sel = await databaseManager.selections.findById(selectionId)
    if (!sel || sel.workId !== id) {
      return res.status(404).json({
        success: false,
        error: 'Selection not found'
      })
    }
  }

  const graph = typeof sourceGraphId === 'string'
    ? await databaseManager.graphs.findById(sourceGraphId)
    : await databaseManager.graphs.findLatestByWorkId(id)

  if (!graph) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found for work'
    })
  }

  const artifact = await databaseManager.artifacts.createFromGraph({
    workId: id,
    selectionId: typeof selectionId === 'string' ? selectionId : undefined,
    profileVersion: typeof profileVersion === 'number' ? profileVersion : undefined,
    type: type.trim(),
    params: params !== undefined ? params : undefined,
    sourceGraphId: typeof sourceGraphId === 'string' ? sourceGraphId : undefined,
    graph: {
      id: graph.id,
      name: graph.name,
      nodes: graph.nodes,
      edges: graph.edges,
      directed: graph.directed
    }
  })

  res.status(201).json({
    success: true,
    data: artifact
  })
})

router.post('/:id/jobs/:jobId/cancel', async (req, res) => {
  const { id, jobId } = req.params

  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const job = await databaseManager.workJobs.findById(jobId)
  if (!job || job.workId !== id) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    })
  }

  const cancelled = await databaseManager.workJobs.requestCancel(jobId)
  if (!cancelled) {
    return res.status(409).json({
      success: false,
      error: 'Job cannot be cancelled'
    })
  }

  const updated = await databaseManager.workJobs.findById(jobId)

  res.json({
    success: true,
    data: {
      work,
      job: updated
    }
  })
})

router.get('/:id/export', async (req, res) => {
  const { id } = req.params
  const work = await databaseManager.works.findById(id)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  const publications = await collectPublications(id)
  const workPublications = await collectWorkPublications(id)
  const graphs = await databaseManager.graphs.findByWorkId(id)

  const exportGraphs: WorkExportGraph[] = graphs.map(graph => ({
    id: graph.id,
    name: graph.name,
    nodes: graph.nodes,
    edges: graph.edges,
    directed: graph.directed,
    createdAt: graph.createdAt instanceof Date ? graph.createdAt.toISOString() : String(graph.createdAt),
    updatedAt: graph.updatedAt instanceof Date ? graph.updatedAt.toISOString() : String(graph.updatedAt)
  }))

  const bundle: WorkExportBundle = {
    version: 1,
    exportedAt: new Date().toISOString(),
    work,
    publications,
    workPublications,
    graphs: exportGraphs
  }

  const datePart = new Date().toISOString().slice(0, 10)
  const baseName = `work-bundle-${safeFilenamePart(work.id)}-${datePart}.json`

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${baseName}"`)
  res.send(JSON.stringify(bundle, null, 2))
})

router.post('/import', async (req, res) => {
  const { bundle, name } = req.body ?? {}
  if (!bundle || typeof bundle !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'bundle is required'
    })
  }

  const rawWork = (bundle as any).work
  const workName = typeof name === 'string' && name.trim().length > 0
    ? name.trim()
    : typeof rawWork?.name === 'string' && rawWork.name.trim().length > 0
      ? rawWork.name.trim()
      : 'Импортированная работа'

  const workDescription = typeof rawWork?.description === 'string' ? rawWork.description : undefined

  const createdWork = await databaseManager.works.create({
    name: workName,
    description: workDescription
  })

  const publications = Array.isArray((bundle as any).publications) ? (bundle as any).publications : []
  const workPublications = Array.isArray((bundle as any).workPublications) ? (bundle as any).workPublications : []
  const graphs = Array.isArray((bundle as any).graphs) ? (bundle as any).graphs : []

  const publicationIdMap = new Map<string, string>()
  let importedPublications = 0
  for (const pub of publications) {
    const title = typeof pub?.title === 'string' ? pub.title.trim() : ''
    if (!title) continue
    const created = await databaseManager.publications.upsert({
      title,
      authors: Array.isArray(pub.authors) ? pub.authors.map((a: unknown) => String(a)) : [],
      year: typeof pub.year === 'number' ? pub.year : undefined,
      abstract: typeof pub.abstract === 'string' ? pub.abstract : undefined,
      doi: typeof pub.doi === 'string' ? pub.doi : undefined,
      pmid: typeof pub.pmid === 'string' ? pub.pmid : undefined,
      url: typeof pub.url === 'string' ? pub.url : undefined,
      source: typeof pub.source === 'string' ? pub.source : undefined,
      accessStatus: typeof pub.accessStatus === 'string' ? pub.accessStatus : undefined,
      rawJson: pub.rawJson
    })
    if (typeof pub.id === 'string') publicationIdMap.set(pub.id, created.id)
    importedPublications += 1
  }

  let importedLinks = 0
  for (const link of workPublications) {
    const oldPubId = typeof link?.publicationId === 'string' ? link.publicationId : null
    if (!oldPubId) continue
    const newPubId = publicationIdMap.get(oldPubId)
    if (!newPubId) continue
    const attachType = typeof link.attachType === 'string' && link.attachType.trim().length > 0
      ? link.attachType
      : 'import'
    await databaseManager.workPublications.link({
      workId: createdWork.id,
      publicationId: newPubId,
      attachType,
      provenance: link.provenance
    })
    importedLinks += 1
  }

  let importedGraphs = 0
  for (const graph of graphs) {
    if (!graph || typeof graph !== 'object') continue
    const graphName = typeof graph.name === 'string' && graph.name.trim().length > 0
      ? graph.name
      : `Граф ${importedGraphs + 1}`
    const nodes = Array.isArray(graph.nodes) ? graph.nodes : []
    const edges = Array.isArray(graph.edges) ? graph.edges : []
    const directed = typeof graph.directed === 'boolean' ? graph.directed : false
    const createdGraph = await databaseManager.graphs.create({
      name: graphName,
      nodes,
      edges,
      directed
    })
    await databaseManager.graphs.linkToWork(createdWork.id, createdGraph.id)
    importedGraphs += 1
  }

  res.status(201).json({
    success: true,
    data: {
      work: createdWork,
      publicationsImported: importedPublications,
      linksImported: importedLinks,
      graphsImported: importedGraphs
    }
  })
})

router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { name, description } = req.body

  const updates: any = {}
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 1) {
      return res.status(400).json({
        success: false,
        error: 'name must be a non-empty string'
      })
    }
    updates.name = name.trim()
  }

  if (description !== undefined) {
    if (typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'description must be a string'
      })
    }
    updates.description = description.trim()
  }

  const work = await databaseManager.works.update(id, updates)
  if (!work) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  res.json({
    success: true,
    data: work
  })
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const deleted = await databaseManager.works.delete(id)
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Work not found'
    })
  }

  res.json({
    success: true,
    message: 'Work deleted successfully'
  })
})

export default router
