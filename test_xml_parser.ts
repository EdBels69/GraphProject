
import { PubMedService } from './api/services/pubmedService';
import { logger } from './api/core/Logger';

// Mock logger to avoid errors
logger.info = console.log;
logger.error = console.error;
logger.warn = console.warn;

async function test() {
    const service = new PubMedService();
    // Valid PMID for carnitine paper
    const pmids = ['36387312'];
    console.log('Fetching details for:', pmids);

    try {
        const articles = await service.fetchArticleDetails(pmids);
        console.log('Fetched articles:', JSON.stringify(articles, null, 2));

        if (articles.length === 0) {
            console.error('FAILED: No articles returned');
        } else {
            console.log('SUCCESS: Articles returned');
            if (!articles[0].abstractText) console.warn('WARNING: No abstract text');
            if (!articles[0].authors?.length) console.warn('WARNING: No authors');
        }
    } catch (error) {
        console.error('CRASH:', error);
    }
}

test();
