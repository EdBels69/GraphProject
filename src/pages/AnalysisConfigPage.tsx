import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Play, Network, TableProperties, ShieldCheck, Database, Loader2, Check } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface ColumnDefinition {
    id: string
    name: string
    source: string
    domains: string[]
    description: string
    required?: boolean
}

interface ColumnSchema {
    columns: Record<string, ColumnDefinition>
    domain_filters: Record<string, { name: string, description: string, default_visible: string[] }>
    domains?: { id: string, name: string }[]
}

interface ResearchJob {
    id: string
    topic: string
    status: string
    articlesFound: number
    articles?: { id: string, title: string, screeningStatus?: string }[]
}

export default function AnalysisConfigPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { addToast } = useToast()

    const [job, setJob] = useState<ResearchJob | null>(null)
    const [schema, setSchema] = useState<ColumnSchema | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Configuration State
    const [extractEntities, setExtractEntities] = useState(true)
    const [extractColumns, setExtractColumns] = useState(true)
    const [selectedDomain, setSelectedDomain] = useState('all')
    const [selectedColumns, setSelectedColumns] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobRes, schemaRes] = await Promise.all([
                    fetch(`/api/research/jobs/${id}`),
                    fetch(`/api/research/schema`)
                ])

                const jobData = await jobRes.json()
                const schemaData = await schemaRes.json()

                // Polyfill domains from domain_filters if missing
                if (schemaData.domain_filters && !schemaData.domains) {
                    schemaData.domains = Object.entries(schemaData.domain_filters).map(([key, val]: [string, any]) => ({
                        id: key,
                        name: val.name
                    }))
                }

                setJob(jobData.job)
                setSchema(schemaData)

                // Pre-select columns for 'all' domain
                if (schemaData?.columns) {
                    const defaultCols = Object.values(schemaData.columns)
                        .filter((c: any) => c.required || c.domains.includes('all'))
                        .map((c: any) => c.id)
                    setSelectedColumns(defaultCols)
                }

            } catch (e) {
                console.error(e)
                addToast('Failed to load configuration', 'error')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleStartAnalysis = async () => {
        setIsSubmitting(true)
        try {
            await fetch(`/api/research/jobs/${id}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    extractEntities,
                    extractRelations: extractEntities, // Sync with entities for now
                    extractColumns,
                    domain: selectedDomain,
                    columns: selectedColumns
                })
            })
            // Redirect to PapersPage to show progress
            navigate(`/research/${id}/papers`)
        } catch (e) {
            console.error(e)
            setIsSubmitting(false)
            addToast('Failed to start analysis', 'error')
        }
    }

    if (isLoading || !job || !schema) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-void">
                <Loader2 className="w-12 h-12 text-acid animate-spin" />
            </div>
        )
    }

    const includedCount = job.articles?.filter(a => a.screeningStatus === 'included').length || 0
    const availableColumns = Object.values(schema.columns).filter(c =>
        selectedDomain === 'all' || c.domains.includes(selectedDomain)
    )

    return (
        <div className="max-w-4xl mx-auto pb-32 animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => navigate(`/research/${id}/papers`)}
                    className="flex items-center gap-2 text-steel/60 hover:text-acid w-fit transition-colors font-mono text-xs tracking-widest"
                >
                    <ArrowLeft className="w-3 h-3" /> BACK_TO_DATA_STREAM
                </button>

                <div>
                    <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight mb-2">
                        ANALYSIS CONFIGURATION
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                        <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/10 uppercase">SETUP PHASE</span>
                        <span>TARGET: <span className="text-acid">{includedCount} DOCUMENTS</span></span>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-xl border border-white/10 space-y-8">
                {/* Knowledge Graph Toggle */}
                <div
                    onClick={() => setExtractEntities(!extractEntities)}
                    className={`
                        p-6 rounded-xl border-2 transition-all cursor-pointer group hover:bg-white/5 relative overflow-hidden
                        ${extractEntities ? 'border-acid/50 bg-acid/5' : 'border-white/10'}
                    `}
                >
                    <div className="flex items-start gap-4 z-10 relative">
                        <div className={`
                            p-3 rounded-lg transition-colors
                            ${extractEntities ? 'bg-acid text-void' : 'bg-white/5 text-gray-400'}
                        `}>
                            <Network className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-lg font-bold font-display ${extractEntities ? 'text-white' : 'text-gray-400'}`}>
                                KNOWLEDGE GRAPH CONSTRUCTION
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                Use LLM to extract entities (Proteins, Genes, Chemicals) and semantic relationships.
                                Builds a navigable graph structure.
                            </p>
                        </div>
                        <div className={`
                            w-6 h-6 rounded border flex items-center justify-center transition-all
                            ${extractEntities ? 'border-acid bg-acid text-void' : 'border-white/20'}
                        `}>
                            {extractEntities && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                    </div>
                    {extractEntities && <div className="absolute inset-0 bg-acid/5 pointer-events-none animate-pulse-slow" />}
                </div>

                {/* Structured Data Toggle */}
                <div
                    onClick={() => setExtractColumns(!extractColumns)}
                    className={`
                        p-6 rounded-xl border-2 transition-all cursor-pointer group hover:bg-white/5 relative overflow-hidden
                        ${extractColumns ? 'border-plasma/50 bg-plasma/5' : 'border-white/10'}
                    `}
                >
                    <div className="flex items-start gap-4 z-10 relative">
                        <div className={`
                            p-3 rounded-lg transition-colors
                            ${extractColumns ? 'bg-plasma text-white' : 'bg-white/5 text-gray-400'}
                        `}>
                            <TableProperties className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-lg font-bold font-display ${extractColumns ? 'text-white' : 'text-gray-400'}`}>
                                STRUCTURED DATA EXTRACTION
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                Extract specific data points into a comparative table (P-values, Cohort Sizes, Methods).
                            </p>
                        </div>
                        <div className={`
                            w-6 h-6 rounded border flex items-center justify-center transition-all
                            ${extractColumns ? 'border-plasma bg-plasma text-white' : 'border-white/20'}
                        `}>
                            {extractColumns && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                    </div>
                </div>

                {/* Detailed Column Config */}
                <div className={`
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${extractColumns ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
                `}>
                    <div className="pl-4 border-l-2 border-plasma/20 ml-9 space-y-6 pt-2">
                        {/* Domain Selector */}
                        <div className="space-y-3">
                            <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Database className="w-3 h-3" /> Extraction Schema
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedDomain('all')}
                                    className={`
                                        px-4 py-2 rounded text-xs font-bold font-display transition-all border
                                        ${selectedDomain === 'all'
                                            ? 'bg-plasma/20 border-plasma text-plasma shadow-glow-plasma'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}
                                    `}
                                >
                                    ALL FIELDS
                                </button>
                                {schema.domains?.map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => setSelectedDomain(d.id)}
                                        className={`
                                            px-4 py-2 rounded text-xs font-bold font-display transition-all border
                                            ${selectedDomain === d.id
                                                ? 'bg-plasma/20 border-plasma text-plasma shadow-glow-plasma'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}
                                        `}
                                    >
                                        {d.name.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                            {availableColumns.map(col => (
                                <label
                                    key={col.id}
                                    className={`
                                        flex items-center gap-3 p-3 rounded bg-white/5 border border-white/5 cursor-pointer transition-all
                                        ${selectedColumns.includes(col.id) ? 'bg-white/10 border-white/20' : 'opacity-60 hover:opacity-100'}
                                    `}
                                >
                                    <div className={`
                                        w-4 h-4 rounded border flex items-center justify-center
                                        ${selectedColumns.includes(col.id) ? 'bg-plasma border-plasma' : 'border-white/30'}
                                    `}>
                                        {selectedColumns.includes(col.id) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedColumns.includes(col.id)}
                                        disabled={col.required}
                                        onChange={e => {
                                            if (e.target.checked) setSelectedColumns([...selectedColumns, col.id])
                                            else setSelectedColumns(selectedColumns.filter(id => id !== col.id))
                                        }}
                                    />
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-medium ${selectedColumns.includes(col.id) ? 'text-white' : 'text-gray-400'}`}>
                                            {col.name}
                                        </span>
                                        {col.required && <span className="text-[10px] text-red-400 flex items-center gap-1"><ShieldCheck className="w-2 h-2" /> REQUIRED</span>}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Launch Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-void via-void/90 to-transparent pointer-events-none flex justify-center lg:justify-end lg:pr-12 gap-4">
                <button
                    onClick={handleStartAnalysis}
                    disabled={isSubmitting || (!extractEntities && !extractColumns)}
                    className={`
                        pointer-events-auto px-8 py-4 rounded-xl font-display font-bold tracking-widest text-lg shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3
                        ${(isSubmitting || (!extractEntities && !extractColumns))
                            ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                            : 'bg-acid text-void shadow-glow-acid'}
                    `}
                >
                    {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> INITIALIZING...</>
                    ) : (
                        <><Play className="w-5 h-5 fill-current" /> INITIATE ANALYSIS SEQUENCE</>
                    )}
                </button>
            </div>
        </div>
    )
}
