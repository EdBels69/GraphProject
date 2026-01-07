export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateArticle(article: any): ValidationResult {
  const errors: string[] = [];

  if (!article.title || typeof article.title !== 'string' || article.title.trim().length === 0) {
    errors.push('Заголовок статьи обязателен');
  }

  if (!article.id || typeof article.id !== 'string' || article.id.trim().length === 0) {
    errors.push('ID статьи обязателен');
  }

  if (article.year && (typeof article.year !== 'number' || article.year < 0 || article.year > new Date().getFullYear() + 1)) {
    errors.push('Неверный год публикации');
  }

  if (article.authors && !Array.isArray(article.authors)) {
    errors.push('Авторы должны быть массивом строк');
  }

  if (article.keywords && !Array.isArray(article.keywords)) {
    errors.push('Ключевые слова должны быть массивом строк');
  }

  if (article.citations && !Array.isArray(article.citations)) {
    errors.push('Цитирования должны быть массивом строк');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateGraph(graph: any): ValidationResult {
  const errors: string[] = [];

  if (!graph.id || typeof graph.id !== 'string' || graph.id.trim().length === 0) {
    errors.push('ID графа обязателен');
  }

  if (!graph.nodes || !Array.isArray(graph.nodes)) {
    errors.push('Узлы должны быть массивом');
  } else {
    graph.nodes.forEach((node: any, index: number) => {
      if (!node.id) {
        errors.push(`Узел ${index}: ID обязателен`);
      }
    });
  }

  if (!graph.edges || !Array.isArray(graph.edges)) {
    errors.push('Ребра должны быть массивом');
  } else {
    graph.edges.forEach((edge: any, index: number) => {
      if (!edge.source || !edge.target) {
        errors.push(`Ребро ${index}: source и target обязательны`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateURL(url: string): ValidationResult {
  const errors: string[] = [];

  try {
    new URL(url);
  } catch {
    errors.push('Неверный формат URL');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateFileUpload(file: any): ValidationResult {
  const errors: string[] = [];

  if (!file || typeof file !== 'object') {
    errors.push('Файл обязателен');
    return { valid: false, errors };
  }

  const allowedExtensions = ['csv', 'json', 'bib', 'txt'];
  const extension = file.name?.split('.').pop()?.toLowerCase();

  if (!extension || !allowedExtensions.includes(extension)) {
    errors.push(`Неподдерживаемый формат файла. Разрешены: ${allowedExtensions.join(', ')}`);
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size && file.size > maxSize) {
    errors.push(`Размер файла превышает ${maxSize / (1024 * 1024)} МБ`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validatePubMedQuery(query: any): ValidationResult {
  const errors: string[] = [];

  if (!query.term || typeof query.term !== 'string' || query.term.trim().length === 0) {
    errors.push('Поисковый запрос обязателен');
  }

  if (query.limit && (typeof query.limit !== 'number' || query.limit < 1 || query.limit > 1000)) {
    errors.push('Лимит должен быть числом от 1 до 1000');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
