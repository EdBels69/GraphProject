import React, { useState, useEffect } from 'react'
import { Download, FileJson, FileText, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ExportFormat {
    id: string
    name: string
    extension: string
}

interface Props {
    graphId: string
}

export function GraphExportMenu({ graphId }: Props) {
    const [formats, setFormats] = useState<ExportFormat[]>([])
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        fetch('http://localhost:3002/api/export/formats', {
            headers: { 'Authorization': `Bearer local-admin` }
        })
            .then(res => res.json())
            .then(setFormats)
            .catch(console.error)
    }, [])

    const handleExport = async (formatId: string, extension: string) => {
        try {
            const res = await fetch(`http://localhost:3002/api/export/graphs/${graphId}/${formatId}`, {
                headers: { 'Authorization': `Bearer local-admin` }
            })

            if (!res.ok) throw new Error('Export failed')

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `graph-${graphId}.${extension}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
            setIsOpen(false)
        } catch (error) {
            console.error(error)
            alert('Export failed')
        }
    }

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-2"
            >
                <Download size={16} />
                Export
            </Button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-void border border-ash/20 rounded-lg shadow-xl z-50 p-2 space-y-1">
                    <div className="text-xs font-semibold text-steel-dim px-3 py-2 uppercase">
                        Download Format
                    </div>
                    {formats.map(format => (
                        <button
                            key={format.id}
                            onClick={() => handleExport(format.id, format.extension)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-steel hover:bg-ash/10 rounded-md transition-colors"
                        >
                            {format.id === 'obsidian' ? <FileText size={16} /> :
                                format.id === 'cytoscape' ? <Share2 size={16} /> :
                                    <FileJson size={16} />}
                            {format.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
