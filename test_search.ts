
import globalSearch from './api/services/globalSearch';
import { logger } from './api/core/Logger';

// Mock logger to console
logger.info = (ctx, msg, meta) => console.log(`[INFO] [${ctx}] ${msg}`, meta ? JSON.stringify(meta) : '');
logger.error = (ctx, msg, meta) => console.error(`[ERROR] [${ctx}] ${msg}`, meta ? JSON.stringify(meta) : '');
logger.warn = (ctx, msg, meta) => console.warn(`[WARN] [${ctx}] ${msg}`, meta ? JSON.stringify(meta) : '');

async function test() {
    const query = "carnitine system";
    console.log(`Searching for: ${query} (2025-2026) via GlobalSearch`);

    try {
        const result = await globalSearch.search({
            query,
            sources: ['pubmed', 'crossref'],
            maxResults: 50,
            fromDate: '2025-01-01',
            toDate: '2026-01-01'
        });

        console.log(`Total Results: ${result.totalResults}`);

        const pubmedCount = result.bySource['pubmed']?.length || 0;
        const crossrefCount = result.bySource['crossref']?.length || 0;
        console.log(`By Source: PubMed=${pubmedCount}, Crossref=${crossrefCount}`);

        if (crossrefCount > 0) {
            console.log('--- Crossref Samples ---');
            result.bySource['crossref']?.slice(0, 5).forEach(a => {
                console.log(`[${a.year}] ${a.title} (${a.doi})`);
            });
        }
    } catch (error) {
        console.error('CRASH:', error);
    }
}

test();
