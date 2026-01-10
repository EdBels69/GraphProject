import { databaseManager } from '../src/core/Database';
import { literatureAgent } from '../api/services/literatureAgent';
import { logger } from '../src/core/Logger';

async function runStressTest() {
    console.log('Starting Backend Stress Test...');

    // Initialize
    await databaseManager.initialize();

    const userId = 'stress-test-user';
    const topic = 'CRISPR applications in neurodegenerative diseases'; // Complex topic

    // 1. Create Heavy Job
    const job = await databaseManager.saveResearchJob({
        id: 'stress-job-1',
        topic,
        mode: 'research',
        status: 'pending',
        articlesFound: 0,
        progress: 0,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log('Created stress job:', job.id);

    // 2. Trigger Deep Research (Mocking 50+ articles via search)
    // Note: We are calling the internal service directly.
    // Ideally we should mock the external PubMed API to return 100 results to test internal processing.
    // But for now let's see how it handles real (or mocked via existing mocks) load.
    // If we want to stress test *processing*, we might inject data directly.

    console.log('Injecting 50 dummy articles...');
    const articles = Array.from({ length: 50 }).map((_, i) => ({
        id: `stress-article-${i}`,
        title: `Stress Test Article ${i}: ${topic}`,
        abstract: `This is a long abstract for article ${i} to test memory and processing capabilities of the system. `.repeat(20),
        authors: ['Test Author', 'Stress Bot'],
        year: 2024,
        source: 'PubMed',
        status: 'pending',
        userId: userId,
        jobId: job.id
    }));

    await databaseManager.saveJobArticles(job.id, userId, articles);
    console.log('Saved 50 articles.');

    // 3. Concurrent AI Extraction
    console.log('Starting concurrent AI processing...');
    // We will call assessRelevance logic which triggers AI
    // Actually literatureAgent.processJob triggers everything.
    // Let's manually trigger processing on these articles.

    // Simulation: Just verify DB performance on bulk update
    const start = Date.now();
    const iterations = 50;
    await Promise.all(articles.map(async (a, i) => {
        // Simulate AI delay
        await new Promise(r => setTimeout(r, Math.random() * 100)); // 0-100ms
        // Update status
        a.status = 'analyzed';
        // Save individually to stress DB concurrency
        await databaseManager.saveJobArticles(job.id, userId, [a]);
    }));

    const duration = Date.now() - start;
    console.log(`Processed ${iterations} concurrent updates in ${duration}ms (${(iterations / duration * 1000).toFixed(2)} ops/sec)`);

    console.log('Stress test complete.');
}

runStressTest().catch(console.error);
