
import { PubMedService } from './api/services/pubmedService';
import { logger } from './api/core/Logger';

logger.info = console.log;
logger.error = console.error;
logger.warn = console.warn;

async function test() {
    const service = new PubMedService();
    const query = "carnitine";
    console.log(`Searching for: ${query}`);

    try {
        const ids = await service.searchArticles(query, { maxResults: 5 });
        console.log(`Found IDs: ${ids.length}`, ids);

        if (ids.length > 0) {
            const articles = await service.fetchArticleDetails(ids);
            console.log(`Fetched details for ${articles.length} articles`);
            if (articles.length > 0) {
                console.log('Sample title:', articles[0].title);
            }
        }
    } catch (error) {
        console.error('CRASH:', error);
    }
}

test();
