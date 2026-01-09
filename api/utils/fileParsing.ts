export function parseCSV(content: string) {
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())

    const articles: any[] = []
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        const article: any = {}
        headers.forEach((header, index) => {
            article[header] = values[index] || ''
        })
        articles.push(article)
    }

    return { articles }
}

export function parseBibTeX(content: string) {
    const entries = content.split(/@/g).filter(e => e.trim())
    const articles: any[] = []

    entries.forEach(entry => {
        const match = entry.match(/(\w+)\s*\{([^,]+),/i)
        if (!match) return

        const fields: any = {}
        const fieldRegex = /(\w+)\s*=\s*(?:\{([^}]*)\}|\"([^\"]*)\")/g
        let fieldMatch

        while ((fieldMatch = fieldRegex.exec(entry)) !== null) {
            fields[fieldMatch[1].toLowerCase()] = fieldMatch[2] || fieldMatch[3] || ''
        }

        articles.push({
            id: match[2],
            title: fields.title || '',
            authors: fields.author ? fields.author.split(' and ') : [],
            year: parseInt(fields.year) || 0,
            abstract: fields.abstract || '',
            keywords: fields.keywords ? fields.keywords.split(',').map((k: string) => k.trim()) : [],
        })
    })

    return { articles }
}
