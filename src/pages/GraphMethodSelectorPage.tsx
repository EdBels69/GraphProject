import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GraphMethodSelector } from '@/components/GraphMethodSelector'
import { api } from '@/services/api' // Assuming api wrapper exists, if not we use fetch
import { Layout } from '@/components/Layout' // Check if Layout exists

export default function GraphMethodSelectorPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [methods, setMethods] = useState<any[]>([])
    const [validation, setValidation] = useState<Record<string, any>>({})
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
    const [config, setConfig] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [building, setBuilding] = useState(false)

    // Fetch available methods
    useEffect(() => {
        const fetchMethods = async () => {
            try {
                setLoading(true)
                const res = await fetch('http://localhost:3002/api/methods', {
                    headers: { 'Authorization': `Bearer local-admin` } // Hack for dev
                })
                const data = await res.json()
                setMethods(data.methods)

                // Auto-select first available or valid method
                if (data.methods.length > 0) {
                    setSelectedMethod(data.methods[0].id)

                    // Initialize default config
                    const defaults: any = {}
                    Object.entries(data.methods[0].configSchema).forEach(([key, field]: [string, any]) => {
                        defaults[key] = field.default
                    })
                    setConfig(defaults)
                }
            } catch (err) {
                console.error('Failed to fetch methods', err)
            } finally {
                setLoading(false)
            }
        }

        fetchMethods()
    }, [])

    // Validate all methods against current job
    useEffect(() => {
        if (methods.length === 0 || !id) return

        const validateAll = async () => {
            const results: Record<string, any> = {}

            for (const method of methods) {
                try {
                    const res = await fetch(`http://localhost:3002/api/methods/${method.id}/validate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer local-admin`
                        },
                        body: JSON.stringify({ jobId: id })
                    })
                    results[method.id] = await res.json()
                } catch (e) {
                    console.error(`Validation failed for ${method.id}`, e)
                }
            }
            setValidation(results)
        }

        validateAll()
    }, [methods, id])

    const handleMethodSelect = (methodId: string) => {
        setSelectedMethod(methodId)
        // Reset config to defaults for new method
        const method = methods.find(m => m.id === methodId)
        if (method) {
            const defaults: any = {}
            Object.entries(method.configSchema).forEach(([key, field]: [string, any]) => {
                defaults[key] = field.default
            })
            setConfig(defaults)
        }
    }

    const handleBuildGraph = async () => {
        if (!selectedMethod || !id) return

        try {
            setBuilding(true)
            // Note: We haven't implemented this route yet in this turn, but we will next
            const res = await fetch(`http://localhost:3002/api/research/jobs/${id}/build-graph`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer local-admin`
                },
                body: JSON.stringify({
                    methodId: selectedMethod,
                    config
                })
            })

            if (!res.ok) throw new Error('Build failed')

            const { graphId } = await res.json()
            navigate(`/graph/${graphId}`)

        } catch (err) {
            console.error('Failed to build graph', err)
            alert('Failed to build graph. Please try again.')
        } finally {
            setBuilding(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center text-steel">
                Loading methods...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-void text-steel-light p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="text-steel hover:text-white">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-acid to-plasma">
                            Build Knowledge Graph
                        </h1>
                        <p className="text-steel-dim mt-1">Select methodology and configure extraction parameters</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mb-12">
                <GraphMethodSelector
                    methods={methods}
                    validation={validation}
                    selectedMethod={selectedMethod}
                    onSelect={handleMethodSelect}
                    config={config}
                    onConfigChange={setConfig}
                />
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-void/80 backdrop-blur border-t border-ash/10">
                <div className="max-w-6xl mx-auto flex justify-end items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleBuildGraph}
                        disabled={!selectedMethod || building}
                        className="bg-acid text-void hover:bg-acid/90 px-8"
                    >
                        {building ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⏳</span> Building...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Play size={18} fill="currentColor" /> Build Graph
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
