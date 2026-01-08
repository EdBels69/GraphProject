/**
 * Swagger/OpenAPI Configuration
 * API documentation for Graph Analyser
 */

import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Graph Analyser API',
            version: '1.0.0',
            description: 'API для анализа биомедицинских графов знаний',
            contact: {
                name: 'Graph Analyser Team',
                email: 'support@graphanalyser.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server'
            },
            {
                url: 'https://api.graphanalyser.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Graph: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        nodes: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/GraphNode' }
                        },
                        edges: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/GraphEdge' }
                        },
                        directed: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                GraphNode: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        label: { type: 'string' },
                        weight: { type: 'number' },
                        data: { type: 'object' }
                    },
                    required: ['id', 'label']
                },
                GraphEdge: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        source: { type: 'string' },
                        target: { type: 'string' },
                        weight: { type: 'number' },
                        directed: { type: 'boolean' }
                    },
                    required: ['id', 'source', 'target']
                },
                Article: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        authors: { type: 'array', items: { type: 'string' } },
                        year: { type: 'integer' },
                        abstract: { type: 'string' },
                        keywords: { type: 'array', items: { type: 'string' } },
                        doi: { type: 'string' },
                        url: { type: 'string' }
                    }
                },
                Entity: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        type: { type: 'string', enum: ['protein', 'gene', 'disease', 'drug', 'pathway'] },
                        confidence: { type: 'number', minimum: 0, maximum: 1 }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string' },
                                message: { type: 'string' }
                            }
                        }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' }
                    }
                }
            }
        },
        tags: [
            { name: 'Health', description: 'System health endpoints' },
            { name: 'Graphs', description: 'Graph management' },
            { name: 'PubMed', description: 'PubMed article search and citation networks' },
            { name: 'AI', description: 'AI-powered analysis features' },
            { name: 'Documents', description: 'Document upload and processing' },
            { name: 'Analysis', description: 'Graph analysis algorithms' },
            { name: 'Export', description: 'Data export endpoints' }
        ]
    },
    apis: ['./api/routes/*.ts', './api/server.ts']
}

export const swaggerSpec = swaggerJsdoc(options)
