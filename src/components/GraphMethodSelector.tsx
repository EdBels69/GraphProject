import React from 'react'
import { Tag, FileText, Check, AlertTriangle, ArrowRight } from 'lucide-react'

// Manual type definition since we can't import from backend directly in frontend easily
// In a real repo we would use a shared library
interface GraphMethodOption {
    id: string
    name: string
    description: string
    icon: string
    requiredFields: string[]
    configSchema: any
}

interface ValidationResult {
    valid: boolean
    errors: string[]
    warnings: string[]
    coverage: number
}

interface Props {
    methods: GraphMethodOption[]
    validation?: Record<string, ValidationResult>
    selectedMethod: string | null
    onSelect: (id: string) => void
    onConfigChange: (config: any) => void
    config: any
}

export function GraphMethodSelector({
    methods,
    validation,
    selectedMethod,
    onSelect,
    onConfigChange,
    config
}: Props) {

    const selectedMethodData = methods.find(m => m.id === selectedMethod)

    // Render configuration inputs based on schema
    const renderConfigField = (key: string, field: any) => {
        switch (field.type) {
            case 'number':
                return (
                    <div key={key} className="space-y-2">
                        <label className="text-sm font-medium text-steel">{field.label}</label>
                        <input
                            type="number"
                            min={field.min}
                            max={field.max}
                            value={config[key] ?? field.default}
                            onChange={(e) => onConfigChange({ ...config, [key]: Number(e.target.value) })}
                            className="w-full bg-void border border-ash/20 rounded-lg px-4 py-2 text-steel"
                        />
                        {field.description && <p className="text-xs text-steel-dim">{field.description}</p>}
                    </div>
                )

            case 'slider':
                return (
                    <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-steel">{field.label}</label>
                            <span className="text-sm text-acid">{config[key] ?? field.default}</span>
                        </div>
                        <input
                            type="range"
                            min={field.min}
                            max={field.max}
                            step={field.step || 0.1}
                            value={config[key] ?? field.default}
                            onChange={(e) => onConfigChange({ ...config, [key]: Number(e.target.value) })}
                            className="w-full accent-acid"
                        />
                        {field.description && <p className="text-xs text-steel-dim">{field.description}</p>}
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Methods List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-steel">Available Methods</h3>

                <div className="grid grid-cols-1 gap-4">
                    {methods.map(method => {
                        const result = validation?.[method.id]
                        const isValid = result?.valid ?? true

                        return (
                            <div
                                key={method.id}
                                onClick={() => isValid && onSelect(method.id)}
                                className={`
                  relative p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedMethod === method.id
                                        ? 'border-acid bg-acid/5'
                                        : 'border-ash/20 hover:border-acid/50'}
                  ${!isValid && 'opacity-60 cursor-not-allowed grayscale'}
                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${selectedMethod === method.id ? 'bg-acid text-void' : 'bg-ash/20 text-steel'}`}>
                                        {method.icon === 'tag' ? <Tag size={20} /> : <FileText size={20} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-steel">{method.name}</h4>
                                            {result && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${isValid ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                    {isValid ? `${Math.round(result.coverage * 100)}% coverage` : 'Incompatible'}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-steel-dim mt-1">{method.description}</p>

                                        {!isValid && result.errors.length > 0 && (
                                            <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                                                <AlertTriangle size={12} />
                                                {result.errors[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Configuration Panel */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-steel">Configuration</h3>

                <div className="glass-panel p-6 rounded-xl border border-ash/20 min-h-[300px]">
                    {selectedMethodData ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-4 border-b border-ash/10">
                                <div className="text-acid">
                                    {selectedMethodData.icon === 'tag' ? <Tag size={20} /> : <FileText size={20} />}
                                </div>
                                <h4 className="font-medium text-steel">Configuring {selectedMethodData.name}</h4>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(selectedMethodData.configSchema).map(([key, field]) =>
                                    renderConfigField(key, field)
                                )}
                            </div>

                            <div className="pt-4 mt-8 border-t border-ash/10">
                                <div className="p-3 bg-blue-900/20 text-blue-300 rounded-lg text-sm">
                                    <p>Adjust parameters to control graph density and connectivity.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-steel-dim opacity-50">
                            <ArrowRight size={40} className="mb-4" />
                            <p>Select a method to configure</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
