
import axios from 'axios';

async function testApi() {
    console.log('Starting API Flow Test...');
    const baseUrl = 'http://localhost:3002/api/research';

    // 1. Start Job
    const payload = {
        topic: 'carnitine system',
        mode: 'quick',
        fromDate: '2025-01-01',
        toDate: '2026-01-01',
        sources: ['pubmed']
    };

    console.log('Sending payload:', payload);

    try {
        const startRes = await axios.post(`${baseUrl}/jobs`, payload);
        const jobId = startRes.data.job.id;
        console.log(`Job Started: ${jobId}`);

        // 2. Poll Status
        let attempts = 0;
        while (attempts < 30) {
            const statusRes = await axios.get(`${baseUrl}/jobs/${jobId}`);
            const job = statusRes.data.job;

            console.log(`[${attempts}] Status: ${job.status}, Found: ${job.articlesFound}`);

            if (job.status === 'searching' && job.articlesFound > 0) {
                // Wait a bit more to ensure search is done
            }

            if (job.status === 'analyzing' || job.status === 'completed' || (job.status === 'searching' && job.articlesFound > 2000)) {
                // If it found way too many, we know it failed
                console.log('FINAL RESULT:', job.articlesFound);
                if (job.articlesFound > 1000) {
                    console.error('FAIL: Date filter ignored (Too many articles)');
                } else {
                    console.log('PASS: Date filter worked (Reasonable count)');
                }
                break;
            }

            await new Promise(r => setTimeout(r, 2000));
            attempts++;
        }

    } catch (e: any) {
        console.error('API Error:', e.response?.data || e.message);
    }
}

testApi();
