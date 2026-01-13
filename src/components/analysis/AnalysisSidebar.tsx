
import { AnalysisMode } from './types'
import { modeConfig } from './config'
import { Graph } from '../../shared/contracts/graph'

interface AnalysisSidebarProps {
    mode: AnalysisMode
    setMode: (mode: AnalysisMode) => void
    setInputValue: (value: string) => void
    graph: Graph | null
}

export const AnalysisSidebar = ({ mode, setMode, setInputValue, graph }: AnalysisSidebarProps) => {
    return (
        <aside style={{
            width: 280,
            background: '#fff',
            borderRight: '1px solid #e2e8f0',
            padding: 20,
            flexShrink: 0,
            overflowY: 'auto'
        }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 16 }}>Режим анализа</h3>

            {(Object.keys(modeConfig) as AnalysisMode[]).map(m => (
                <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '14px 16px',
                        marginBottom: 8,
                        borderRadius: 12,
                        border: mode === m ? '2px solid #8b5cf6' : '2px solid transparent',
                        background: mode === m ? '#f5f3ff' : '#f8fafc',
                        cursor: 'pointer',
                        textAlign: 'left'
                    }}
                >
                    <span style={{ fontSize: 24 }}>{modeConfig[m].emoji}</span>
                    <div>
                        <div style={{ fontWeight: 600, color: mode === m ? '#5b21b6' : '#1e293b', fontSize: 14 }}>
                            {modeConfig[m].label}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                            {modeConfig[m].description}
                        </div>
                    </div>
                </button>
            ))}

            <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>Примеры запросов</h4>
                {modeConfig[mode].prompts.map((prompt, i) => (
                    <button
                        key={i}
                        onClick={() => setInputValue(prompt)}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 12px',
                            marginBottom: 6,
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            fontSize: 13,
                            color: '#475569',
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                    >
                        {prompt}
                    </button>
                ))}
            </div>

            {graph && (
                <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>📊 Контекст</h4>
                    <div style={{ fontSize: 13, color: '#475569' }}>
                        {graph.nodes.length} узлов<br />
                        {graph.edges.length} связей
                    </div>
                </div>
            )}
        </aside>
    )
}
