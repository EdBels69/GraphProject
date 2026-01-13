
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { ArxivSource } from '../../../api/services/search/sources/ArxivSource'

vi.mock('axios')

describe('ArxivSource', () => {
    let arxivSource: ArxivSource

    beforeEach(() => {
        vi.clearAllMocks()
        arxivSource = new ArxivSource()
    })

    const mockXmlResponse = `
        <feed xmlns="http://www.w3.org/2005/Atom">
            <entry>
                <id>http://arxiv.org/abs/2101.00001v1</id>
                <title>Test Title</title>
                <summary>Test Abstract</summary>
                <published>2021-01-01T00:00:00Z</published>
                <author>
                    <name>Author One</name>
                </author>
                <author>
                    <name>Author Two</name>
                </author>
                <arxiv:doi xmlns:arxiv="http://arxiv.org/schemas/atom">10.1234/arxiv</arxiv:doi>
            </entry>
        </feed>
    `

    it('should search and parse results correctly', async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: mockXmlResponse })

        const results = await arxivSource.search('test')

        expect(axios.get).toHaveBeenCalledWith('http://export.arxiv.org/api/query', expect.objectContaining({
            params: expect.objectContaining({ search_query: 'all:test' })
        }))

        expect(results).toHaveLength(1)
        expect(results[0].title).toBe('Test Title')
        expect(results[0].id).toBe('arxiv-2101.00001')
        expect(results[0].authors).toEqual(['Author One', 'Author Two'])
        expect(results[0].year).toBe(2021)
    })

    it('should handle errors gracefully', async () => {
        vi.mocked(axios.get).mockRejectedValue(new Error('Network Error'))

        const results = await arxivSource.search('test')

        expect(results).toEqual([])
    })
})
