
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, Edit3, Type, Settings, MessageSquare, Database } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'

interface OntologyType {
    id: string
    name: string
    color: string
    icon?: string
}

interface PromptConfig {
    id: string
    name: string
    description?: string
    template: string
    variables: string[]
}

const ICONS = ['dna', 'activity', 'flask', 'box', 'layers', 'git-branch', 'settings', 'circle', 'user', 'file', 'tag']
const COLORS = [
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#10b981', // emerald
    '#ef4444', // red
    '#8b5cf6', // violet
    '#f59e0b', // amber
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#94a3b8', // slate
]

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'ontology' | 'prompts'>('ontology')
    const [ontology, setOntology] = useState<{ nodeTypes: OntologyType[] }>({ nodeTypes: [] })
    const [prompts, setPrompts] = useState<Record<string, PromptConfig>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { addToast } = useToast()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [ontRes, promptRes] = await Promise.all([
                fetch('/api/config/ontology'),
                fetch('/api/config/prompts')
            ])
            const ontData = await ontRes.json()
            const promptData = await promptRes.json()
            setOntology(ontData)
            setPrompts(promptData)
        } catch (e) {
            console.error(e)
            addToast('Не удалось загрузить настройки', 'error')
        } finally {
            setLoading(false)
        }
    }

    const saveOntology = async () => {
        setSaving(true)
        try {
            await fetch('/api/config/ontology', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ontology)
            })
            addToast('Онтология сохранена', 'success')
        } catch (e) {
            addToast('Ошибка сохранения', 'error')
        } finally {
            setSaving(false)
        }
    }

    const savePrompts = async () => {
        setSaving(true)
        try {
            await fetch('/api/config/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prompts)
            })
            addToast('Промпты сохранены', 'success')
        } catch (e) {
            addToast('Ошибка сохранения', 'error')
        } finally {
            setSaving(false)
        }
    }

    // --- Ontology Handlers ---
    const addNodeType = () => {
        setOntology(prev => ({
            ...prev,
            nodeTypes: [
                ...prev.nodeTypes,
                { id: `new_type_${Date.now()}`, name: 'New Type', color: '#94a3b8', icon: 'circle' }
            ]
        }))
    }

    const removeNodeType = (idx: number) => {
        setOntology(prev => ({
            ...prev,
            nodeTypes: prev.nodeTypes.filter((_, i) => i !== idx)
        }))
    }

    const updateNodeType = (idx: number, field: keyof OntologyType, val: string) => {
        const newTypes = [...ontology.nodeTypes]
        newTypes[idx] = { ...newTypes[idx], [field]: val }
        setOntology(prev => ({ ...prev, nodeTypes: newTypes }))
    }

    // --- Prompt Handlers ---
    const updatePrompt = (id: string, val: string) => {
        setPrompts(prev => ({
            ...prev,
            [id]: { ...prev[id], template: val }
        }))
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Загрузка настроек...</div>

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Назад
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900">Настройки системы</h1>
                    </div>
                    <Button
                        onClick={activeTab === 'ontology' ? saveOntology : savePrompts}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6">
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('ontology')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'ontology'
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-600 hover:bg-white/50'
                            }`}
                    >
                        <Database className="w-4 h-4" />
                        Динамическая Онтология
                    </button>
                    <button
                        onClick={() => setActiveTab('prompts')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'prompts'
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-600 hover:bg-white/50'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Prompt Studio
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'ontology' ? (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800 mb-6">
                            ℹ️ Здесь вы можете определить типы сущностей, которые AI будет искать в текстах.
                            Удаление типа не удалит уже существующие узлы в графах.
                        </div>

                        <div className="grid gap-4">
                            {ontology.nodeTypes.map((type, idx) => (
                                <Card key={idx} className="p-4 flex items-center gap-4">
                                    {/* Color Picker */}
                                    <div className="relative group">
                                        <div
                                            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-sm transition-transform hover:scale-105"
                                            style={{ background: type.color }}
                                        />
                                        <div className="absolute top-full left-0 mt-2 bg-white p-2 rounded-lg shadow-xl border z-20 hidden group-hover:grid grid-cols-3 gap-1 w-24">
                                            {COLORS.map(c => (
                                                <div
                                                    key={c}
                                                    className="w-6 h-6 rounded cursor-pointer hover:ring-2 ring-offset-1"
                                                    style={{ background: c }}
                                                    onClick={() => updateNodeType(idx, 'color', c)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Название Display Name</label>
                                            <Input
                                                value={type.name}
                                                onChange={(e) => updateNodeType(idx, 'name', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Системный ID</label>
                                            <Input
                                                value={type.id}
                                                onChange={(e) => updateNodeType(idx, 'id', e.target.value)}
                                                className="mt-1 font-mono text-xs bg-slate-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Icon Select */}
                                    <div className="flex gap-1">
                                        {ICONS.slice(0, 3).map(icon => (
                                            <button
                                                key={icon}
                                                onClick={() => updateNodeType(idx, 'icon', icon)}
                                                className={`p-2 rounded hover:bg-slate-100 ${type.icon === icon ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}
                                            >
                                                {/* Simple emoji mapping for demo, replacing Lucide logic would be verbose */}
                                                <span className="text-lg">
                                                    {icon === 'dna' ? '🧬' :
                                                        icon === 'activity' ? '📉' :
                                                            icon === 'flask' ? '🧪' :
                                                                icon === 'box' ? '📦' : '⚪'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeNodeType(idx)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </Card>
                            ))}
                        </div>

                        <Button onClick={addNodeType} variant="outline" className="w-full py-4 border-dashed border-2">
                            <Plus className="w-4 h-4 mr-2" /> Добавить тип сущности
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(prompts).map(([key, config]) => (
                            <Card key={key} className="overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                {config.name}
                                                <span className="text-xs font-normal text-slate-500 bg-white px-2 py-0.5 rounded border">ID: {config.id}</span>
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">{config.description}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-0">
                                    <div className="relative">
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            {config.variables.map(v => (
                                                <span key={v} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
                                                    {`{{${v}}}`}
                                                </span>
                                            ))}
                                        </div>
                                        <textarea
                                            value={config.template}
                                            onChange={(e) => updatePrompt(key, e.target.value)}
                                            className="w-full h-64 p-6 font-mono text-sm leading-relaxed outline-none resize-y"
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
