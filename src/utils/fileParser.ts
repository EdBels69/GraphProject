import { Graph, Article } from '@/shared/types';

export interface ParsedData {
  articles: Article[];
  citations: Array<{ from: string; to: string }>;
}

export async function parseFile(file: File): Promise<ParsedData> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension) {
    throw new Error('Не удалось определить формат файла');
  }

  const content = await readFile(file);

  switch (extension) {
    case 'json':
      return parseJSON(content);
    case 'csv':
      return parseCSV(content);
    case 'bib':
    case 'txt':
      return parseBibTeX(content);
    default:
      throw new Error(`Неподдерживаемый формат файла: ${extension}`);
  }
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
}

function parseJSON(content: string): ParsedData {
  try {
    const data = JSON.parse(content);

    if (Array.isArray(data)) {
      const articles: Article[] = data.map((item: any, index) => ({
        id: item.id || item.pubmed_id || `article_${index}`,
        title: item.title || '',
        authors: item.authors || [],
        year: item.year || new Date().getFullYear(),
        abstract: item.abstract || '',
        keywords: item.keywords || [],
        citations: item.citations || [],
        doi: item.doi || '',
        url: item.url || '',
        published: item.published || false
      }));

      const citations: Array<{ from: string; to: string }> = [];
      articles.forEach(article => {
        (article.citations || []).forEach(citationId => {
          citations.push({ from: article.id, to: citationId });
        });
      });

      return { articles, citations };
    }

    throw new Error('Неверный формат JSON: ожидается массив статей');
  } catch (error) {
    throw new Error(`Ошибка парсинга JSON: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
}

function parseCSV(content: string): ParsedData {
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV файл должен содержать заголовок и минимум одну строку данных');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['title'];
  const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));

  if (!hasRequiredHeaders) {
    throw new Error(`CSV файл должен содержать заголовки: ${requiredHeaders.join(', ')}`);
  }

  const articles: Article[] = [];
  const citations: Array<{ from: string; to: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const article: any = {};

    headers.forEach((header, index) => {
      article[header] = values[index] || '';
    });

    const id = article.id || article.pubmed_id || `article_${i}`;

    articles.push({
      id,
      title: article.title || '',
      authors: parseArrayField(article.authors),
      year: parseInt(article.year) || new Date().getFullYear(),
      abstract: article.abstract || '',
      keywords: parseArrayField(article.keywords),
      citations: parseArrayField(article.citations),
      doi: article.doi || '',
      url: article.url || '',
      published: article.published === 'true' || article.published === '1'
    });

    const citationList = parseArrayField(article.citations);
    citationList.forEach(citationId => {
      citations.push({ from: id, to: citationId });
    });
  }

  return { articles, citations };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseArrayField(field: string): string[] {
  if (!field) return [];

  field = field.trim();

  if (field.startsWith('[') && field.endsWith(']')) {
    try {
      return JSON.parse(field);
    } catch {
      return field.slice(1, -1).split(',').map(s => s.trim());
    }
  }

  return field.split(';').map(s => s.trim()).filter(s => s);
}

function parseBibTeX(content: string): ParsedData {
  const entries = content.split(/@/g).filter(e => e.trim());

  if (entries.length === 0) {
    throw new Error('BibTeX файл не содержит записей');
  }

  const articles: Article[] = [];
  const citations: Array<{ from: string; to: string }> = [];
  const articleMap = new Map<string, Article>();

  entries.forEach((entry, index) => {
    const match = entry.match(/(\w+)\s*\{([^,]+),/i);
    if (!match) return;

    const [, type, id] = match;

    const fields = parseBibTeXFields(entry);

    const article: Article = {
      id: id.trim(),
      title: fields.title || '',
      authors: parseBibTeXAuthors(fields.author || ''),
      year: parseInt(fields.year || '0') || new Date().getFullYear(),
      abstract: fields.abstract || '',
      keywords: parseArrayField(fields.keywords || ''),
      citations: [],
      doi: fields.doi || '',
      url: fields.url || fields.url || '',
      published: true
    };

    articles.push(article);
    articleMap.set(article.id, article);
  });

  articles.forEach(article => {
    const entry = entries.find(e => e.includes(article.id));
    if (entry) {
      const citedByMatch = entry.match(/citedby\s*=\s*\{([^}]+)\}/i);
      if (citedByMatch) {
        const citedBy = citedByMatch[1].split(',').map(s => s.trim());
        citedBy.forEach(citationId => {
          citations.push({ from: citationId, to: article.id });
        });
      }
    }
  });

  return { articles, citations };
}

function parseBibTeXFields(entry: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const fieldRegex = /(\w+)\s*=\s*(?:\{([^}]*)\}|\"([^\"]*)\")/g;

  let match;
  while ((match = fieldRegex.exec(entry)) !== null) {
    const [, key, value1, value2] = match;
    fields[key.toLowerCase()] = value1 || value2 || '';
  }

  return fields;
}

function parseBibTeXAuthors(authorString: string): string[] {
  if (!authorString) return [];

  return authorString
    .split(' and ')
    .map(author => author.trim())
    .filter(author => author);
}

export function buildGraphFromParsedData(data: ParsedData): Graph {
  const nodes = data.articles.map(article => ({
    id: article.id,
    label: article.title.substring(0, 50) + (article.title.length > 50 ? '...' : ''),
    group: article.id.startsWith('article') ? 'Imported' : 'PubMed',
    attributes: {
      title: article.title,
      authors: article.authors,
      year: article.year,
      citations: article.citations?.length || 0
    }
  }));

  const edges = data.citations.map((citation, index) => ({
    id: `edge_${index}`,
    source: citation.from,
    target: citation.to
  }));

  return {
    id: `graph_${Date.now()}`,
    name: 'Imported Graph',
    nodes,
    edges,
    directed: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
