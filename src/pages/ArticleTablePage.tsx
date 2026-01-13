import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    FileText, Download, Check, Lock, Trash2,
    ExternalLink, Search, Filter, Play, Tag, Edit2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { api } from '@/services/api'

// Types (should be shared)
interface Article {
    id: string
    title: string
    authors: string[]
    year: number
    doi: string
    source: string
    status: string
    pdfUrl?: string
    screeningStatus: 'included' | 'excluded' | 'pending'
}

export default function ArticleTablePage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    // Selection for batch actions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Fetch job and articles
    useEffect(() => {
        fetchJobData()
    }, [id])

    const fetchJobData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`http://localhost:3002/api/research/jobs/${id}`, {
                headers: { 'Authorization': `Bearer local-admin` }
            })
            const data = await res.json()
            setArticles(data.job.articles || [])
        } catch (err) {
            console.error('Failed to fetch job', err)
        } finally {
            setLoading(false)
        }
    }

    // Toggle selection
    const toggleSelect = (articleId: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(articleId)) newSet.delete(articleId)
        else newSet.add(articleId)
        setSelectedIds(newSet)
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredArticles.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredArticles.map(a => a.id)))
        }
    }

    // Filter logic
    const filteredArticles = articles.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.authors.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterStatus === 'all' || a.screeningStatus === filterStatus
        return matchesSearch && matchesFilter
    })

    // Actions
    const handleDownloadPdf = async (articleId: string) => {
        // Placeholder for actual download logic
        console.log('Downloading PDF for', articleId)
        // Would call: POST /api/research/jobs/:id/download-pdf/:articleId
    }

    const handleBatchDownload = async () => {
        if (selectedIds.size === 0) return

        try {
            if (!confirm(`Start batch download for ${selectedIds.size} articles? This may take a while.`)) return

            const res = await fetch(`http://localhost:3002/api/pdf/jobs/${id}/download-batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer local-admin`
                },
                body: JSON.stringify({ articleIds: Array.from(selectedIds) })
            })

            if (res.ok) {
                alert('Batch download started in background')
            } else {
                throw new Error('Failed to start download')
            }
        } catch (err) {
            console.error('Download failed', err)
            alert('Failed to start batch download')
        }
    }

    const handleExportProject = async () => {
        try {
            const res = await fetch(`http://localhost:3002/api/export/jobs/${id}/project`, {
                headers: { 'Authorization': `Bearer local-admin` }
            })

            if (!res.ok) throw new Error('Export failed')

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `project-${id}.zip`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export failed', err)
            alert('Failed to export project')
        }
    }

    const handleDelete = async (articleId: string) => {
        if (!confirm('Are you sure you want to remove this article?')) return
        // Optimistic update
        setArticles(articles.filter(a => a.id !== articleId))
        // API call to delete
    }

    return (
        <div className="min-h-screen bg-void text-steel-light p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-acid to-plasma">
                        Data Management
                    </h1>
                    <p className="text-steel-dim mt-1">Review, filter, and prepare data for analysis</p>
                </div>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={handleExportProject}
                        className="border-ash/20 hover:border-acid/50 hover:text-acid"
                    >
                        <Download size={16} className="mr-2" />
                        Export Project
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/research/${id}/config`)}
                    >
                        Config Analysis
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => navigate(`/research/${id}/build`)}
                        className="bg-acid text-void hover:bg-acid/90"
                    >
                        <Play size={16} className="mr-2" />
                        Build Graph
                    </Button>
                </div>
            </div>

            {/* Filters & Actions Bar */}
            <div className="max-w-7xl mx-auto mb-6 glass-panel p-4 rounded-xl flex flex-wrap gap-4 justify-between items-center">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-void/50 border border-ash/20 rounded-lg pl-10 pr-4 py-2 text-steel placeholder:text-steel-dim"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-void/50 border border-ash/20 rounded-lg px-4 py-2 text-steel"
                    >
                        <option value="all">All Status</option>
                        <option value="included">Included</option>
                        <option value="excluded">Excluded</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-steel-dim">
                        {selectedIds.size} selected
                    </div>
                    {selectedIds.size > 0 && (
                        <Button variant="secondary" onClick={handleBatchDownload} size="sm">
                            <Download size={16} className="mr-2" />
                            Download PDFs
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="max-w-7xl mx-auto glass-panel rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-ash/10 text-steel">
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === filteredArticles.length && filteredArticles.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-ash/20 bg-void/50"
                                />
                            </th>
                            <th className="p-4 w-12">PDF</th>
                            <th className="p-4">Article</th>
                            <th className="p-4 w-32">Year</th>
                            <th className="p-4 w-32">Status</th>
                            <th className="p-4 w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ash/10">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-steel-dim">Loading data...</td></tr>
                        ) : filteredArticles.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-steel-dim">No articles found</td></tr>
                        ) : (
                            filteredArticles.map(article => (
                                <tr key={article.id} className="hover:bg-ash/5 transition-colors">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(article.id)}
                                            onChange={() => toggleSelect(article.id)}
                                            className="rounded border-ash/20 bg-void/50"
                                        />
                                    </td>
                                    <td className="p-4">
                                        {article.pdfUrl ? (
                                            <Check className="text-green-500" size={18} />
                                        ) : (
                                            <Button variant="ghost" size="icon" onClick={() => handleDownloadPdf(article.id)}>
                                                <Download className="text-steel-dim hover:text-acid" size={18} />
                                            </Button>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-steel text-lg">{article.title}</div>
                                        <div className="text-sm text-steel-dim mt-1">
                                            {article.authors.slice(0, 3).join(', ')} {article.authors.length > 3 && 'et al.'}
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            {article.doi && (
                                                <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-blue-400 hover:underline">
                                                    DOI <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-steel-dim">{article.year}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${article.screeningStatus === 'included' ? 'bg-green-900/30 text-green-400' :
                                                article.screeningStatus === 'excluded' ? 'bg-red-900/30 text-red-400' :
                                                    'bg-yellow-900/30 text-yellow-400'}`}>
                                            {article.screeningStatus}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <Button variant="ghost" size="icon" className="hover:text-plasma">
                                            <Trash2 size={18} onClick={() => handleDelete(article.id)} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:text-acid">
                                            <Edit2 size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
