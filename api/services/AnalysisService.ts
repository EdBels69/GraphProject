import { graphRuntime } from './GraphRuntimeService'
import { logger } from '../core/Logger'
import { GraphMetrics } from '../../shared/contracts/graph'
import { CentralityResult, GraphStatistics } from '../../shared/contracts/analysis'
import { AppError } from '../utils/errors'

class AnalysisService {
    private static instance: AnalysisService

    private constructor() { }

    static getInstance(): AnalysisService {
        if (!AnalysisService.instance) {
            AnalysisService.instance = new AnalysisService()
        }
        return AnalysisService.instance
    }

    async getMetrics(graphId: string, userId: string): Promise<GraphStatistics> {
        const analyzer = await this.getAnalyzer(graphId, userId)

        try {
            return analyzer.calculateStatistics()
        } catch (error) {
            logger.error('AnalysisService', `Failed to calculate statistics for graph ${graphId}`, { error })
            throw AppError.internal(`Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async getCentrality(graphId: string, userId: string): Promise<CentralityResult[]> {
        const analyzer = await this.getAnalyzer(graphId, userId)

        try {
            const centrality = analyzer.calculateCentrality()
            const pageRank = analyzer.calculatePageRank()

            return centrality.map(c => ({
                ...c,
                pagerank: pageRank.get(c.nodeId) || 0
            }))
        } catch (error) {
            logger.error('AnalysisService', `Failed to calculate centrality for graph ${graphId}`, { error })
            throw AppError.internal(`Centrality calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async getCommunities(graphId: string, userId: string) {
        const analyzer = await this.getAnalyzer(graphId, userId)

        try {
            const { communities, modularity, communityNodes } = analyzer.detectCommunities()
            return {
                communities: Object.fromEntries(communities),
                modularity,
                communityNodes: Object.fromEntries(communityNodes)
            }
        } catch (error) {
            logger.error('AnalysisService', `Failed to detect communities for graph ${graphId}`, { error })
            throw AppError.internal(`Community detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async getGaps(graphId: string, userId: string) {
        const analyzer = await this.getAnalyzer(graphId, userId)

        try {
            return analyzer.detectGaps()
        } catch (error) {
            logger.error('AnalysisService', `Failed to detect research gaps for graph ${graphId}`, { error })
            throw AppError.internal(`Gap detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    private async getAnalyzer(graphId: string, userId: string) {
        const graph = await graphRuntime.getOrLoadGraph(graphId, userId)
        if (!graph) {
            logger.warn('AnalysisService', `Graph ${graphId} not found or access denied for user ${userId}`)
            throw AppError.notFound(`Graph ${graphId} not found or access denied`)
        }

        const analyzer = graphRuntime.getAnalyzer(graphId)
        if (!analyzer) {
            throw AppError.internal(`Failed to initialize analyzer for graph ${graphId}`)
        }
        return analyzer
    }
}

export const analysisService = AnalysisService.getInstance()
