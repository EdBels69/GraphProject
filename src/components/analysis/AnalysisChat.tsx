
import { Message, AnalysisMode } from './types'
import { modeConfig } from './config'
import { RefObject } from 'react'

interface AnalysisChatProps {
    mode: AnalysisMode
    messages: Message[]
    inputValue: string
    setInputValue: (value: string) => void
    handleSend: () => void
    isLoading: boolean
    messagesEndRef: RefObject<HTMLDivElement>
}

export const AnalysisChat = ({
    mode,
    messages,
    inputValue,
    setInputValue,
    handleSend,
    isLoading,
    messagesEndRef
}: AnalysisChatProps) => {

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: 80 }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>{modeConfig[mode].emoji}</div>
                        <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                            Анализ: {modeConfig[mode].label}
                        </h2>
                        <p style={{ color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
                            {modeConfig[mode].description}. Задайте вопрос или выберите пример слева.
                        </p>
                    </div>
                )}

                {messages.map(message => (
                    <div
                        key={message.id}
                        style={{
                            marginBottom: 20,
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <div style={{
                            maxWidth: '70%',
                            padding: '14px 18px',
                            borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: message.role === 'user' ? '#8b5cf6' : '#fff',
                            color: message.role === 'user' ? '#fff' : '#1e293b',
                            boxShadow: message.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                        }}>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{message.content}</div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
                        <div style={{
                            padding: '14px 18px',
                            borderRadius: '18px 18px 18px 4px',
                            background: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <span>⏳ Анализирую...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '16px 32px 24px',
                background: '#fff',
                borderTop: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Спросите о графе..."
                        style={{
                            flex: 1,
                            padding: '14px 18px',
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            fontSize: 15,
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                        style={{
                            padding: '14px 24px',
                            background: isLoading || !inputValue.trim() ? '#94a3b8' : '#8b5cf6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 12,
                            fontWeight: 500,
                            cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Отправить
                    </button>
                </div>
            </div>
        </div>
    )
}
