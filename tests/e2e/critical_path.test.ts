
import axios from 'axios';
import assert from 'assert';

const API_URL = process.env.API_URL || 'http://localhost:3002/api';

async function runCriticalPathTest() {
    console.log('🧪 Starting Critical Path E2E Test...');

    try {
        // 1. Health Check
        console.log('1. Checking System Health...');
        const health = await axios.get(`${API_URL}/health`);
        assert.ok(health.data.status === 'ok', 'Health check failed');
        console.log('✅ System Healthy');

        // 2. Create Research Job
        console.log('2. Creating Research Job...');
        const jobPayload = {
            topic: '"CRISPR Cas9 off-target effects" review 2024',
            mode: 'quick',
            sources: ['pubmed']
        };
        const createRes = await axios.post(`${API_URL}/research/jobs`, jobPayload);
        const jobId = createRes.data.job.id;
        assert.ok(jobId, 'Failed to get job ID');
        console.log(`✅ Job Created: ${jobId}`);

        // 3. Poll for Completion (Timeout 120s)
        console.log('3. Waiting for Job Completion...');
        const maxAttempts = 90; // 2s * 90 = 180s
        let complete = false;

        for (let i = 0; i < maxAttempts; i++) {
            const jobRes = await axios.get(`${API_URL}/research/jobs/${jobId}`);
            const job = jobRes.data.job;

            process.stdout.write(`\r   Status: ${job.status} (${job.articlesFound || 0} found) `);

            if (job.status === 'completed' || job.status === 'failed') {
                console.log('\n');
                if (job.status === 'failed') throw new Error(`Job failed: ${job.error}`);
                complete = true;
                break;
            }
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!complete) throw new Error('Job timed out');
        console.log('✅ Job Completed Successfully');

        // 4. Verify Document Search
        console.log('4. Verifying Document Search...');
        // We only test this if we actually found articles
        // Mock query to 'crispr' which should be in the title
        const searchRes = await axios.get(`${API_URL}/documents/search`, {
            params: { jobId, q: 'crispr' }
        });

        // Note: This might return empty if no PDF was actually downloaded in 'quick' mode 
        // or if mock data was used. But the endpoint should respond 200.
        assert.ok(Array.isArray(searchRes.data.results), 'Search results format invalid');
        console.log(`✅ Search Endpoint Responded (${searchRes.data.results.length} hits)`);

        // 5. Verify Graph Build
        console.log('5. Verifying Citation Graph...');
        const graphRes = await axios.get(`${API_URL}/graphs/citation/${jobId}`);
        assert.ok(graphRes.data.nodes, 'Graph nodes missing');
        console.log(`✅ Graph Built (${graphRes.data.nodes.length} nodes)`);

        console.log('\n🎉 ALL CRITICAL PATHS PASSED');

    } catch (error: any) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runCriticalPathTest();
