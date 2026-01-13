
import { BaseRepository } from './BaseRepository'
import { ArticleSource } from '../../shared/contracts/research'

export class ArticleRepository extends BaseRepository {

    async saveJobArticles(jobId: string, userId: string, articles: ArticleSource[]) {
        if (!articles.length) return

        const operations = this.getUpsertOperations(jobId, userId, articles)
        await this.prisma.$transaction(operations)
    }

    getUpsertOperations(jobId: string, userId: string, articles: ArticleSource[]) {
        return articles.map(article => {
            return this.prisma.article.upsert({
                where: { id: article.id } as any,
                update: {
                    title: article.title,
                    doi: article.doi,
                    authors: JSON.stringify(article.authors || []),
                    year: article.year,
                    abstract: article.abstract,
                    url: article.url,
                    pdfUrl: article.pdfUrl,
                    source: article.source,
                    status: article.status,
                    screeningStatus: article.screeningStatus,
                    extractedData: article.extractedData ? JSON.stringify(article.extractedData) : undefined,
                    entities: article.entities ? JSON.stringify(article.entities) : undefined,
                    relations: article.relations ? JSON.stringify(article.relations) : undefined,
                    updatedAt: new Date()
                } as any,
                create: {
                    id: article.id,
                    userId: userId,
                    jobId: jobId,
                    title: article.title,
                    doi: article.doi,
                    authors: JSON.stringify(article.authors || []),
                    year: article.year,
                    abstract: article.abstract,
                    url: article.url,
                    pdfUrl: article.pdfUrl,
                    source: article.source,
                    status: article.status,
                    screeningStatus: article.screeningStatus,
                    extractedData: article.extractedData ? JSON.stringify(article.extractedData) : undefined,
                    entities: article.entities ? JSON.stringify(article.entities) : undefined,
                    relations: article.relations ? JSON.stringify(article.relations) : undefined
                } as any
            })
        })
    }


}

export const articleRepository = new ArticleRepository()
