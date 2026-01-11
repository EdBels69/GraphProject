import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Bot, User, Loader2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface AIStatus {
  available: boolean
  model?: string
  error?: string
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Привет! Я AI-помощник для анализа биомедицинских данных. Я могу помочь с:\n\n• Извлечением сущностей из текста\n• Суммаризацией документов\n• Ответами на вопросы о графах\n• Генерацией рекомендаций для исследований\n\nЧто бы вы хотели узнать?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Check AI status on mount
  useEffect(() => {
    checkAIStatus()
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/ai/health')
      const data = await response.json()
      setAiStatus(data)
    } catch (error) {
      setAiStatus({ available: false, error: 'Не удалось проверить статус AI' })
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Build messages for API
      const apiMessages = messages
        .filter(m => m.role !== 'system')
        .slice(-10) // Keep last 10 messages for context
        .map(m => ({ role: m.role, content: m.content }))

      apiMessages.push({ role: 'user', content: userMessage.content })

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful biomedical research assistant. Answer questions concisely in Russian. Help with entity extraction, document analysis, and research recommendations.'
            },
            ...apiMessages
          ]
        })
      })

      if (!response.ok) {
        throw new Error('AI request failed')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content || 'Не удалось получить ответ',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке запроса. Пожалуйста, проверьте, что AI сервис доступен и попробуйте снова.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Чат очищен. Чем могу помочь?',
      timestamp: new Date()
    }])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-steel flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-plasma" />
              AI-помощник
            </h1>
            <p className="text-sm text-steel-dim font-bold">
              Интеллектуальный анализ биомедицинских данных
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Status indicator */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border ${aiStatus?.available
            ? 'bg-acid/10 text-steel border-acid/20'
            : 'bg-red-500/10 text-red-700 border-red-500/20'
            }`}>
            <div className={`w-2 h-2 rounded-full ${aiStatus?.available ? 'bg-green-500 shadow-glow-green' : 'bg-red-500 shadow-glow-red'
              }`} />
            {aiStatus?.available ? (aiStatus.model || 'AI активен') : 'AI недоступен'}
          </div>

          <Button variant="secondary" size="sm" onClick={clearChat}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Очистить
          </Button>
        </div>
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <CardBody className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-plasma/10 flex items-center justify-center flex-shrink-0 border border-plasma/20">
                  <Bot className="w-5 h-5 text-plasma" />
                </div>
              )}

              <div className={`max-w-[70%] rounded-lg p-3 shadow-sm border ${message.role === 'user'
                ? 'bg-acid text-steel font-bold border-acid'
                : 'bg-void text-steel border-ash/30'
                }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                <p className={`text-[10px] mt-1 uppercase tracking-tighter font-bold ${message.role === 'user' ? 'text-void/60' : 'text-steel-dim'
                  }`}>
                  {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-acid flex items-center justify-center flex-shrink-0 shadow-glow-acid/50">
                  <User className="w-5 h-5 text-void" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-plasma/10 flex items-center justify-center flex-shrink-0 border border-plasma/20">
                <Bot className="w-5 h-5 text-plasma" />
              </div>
              <div className="bg-void border border-ash/30 rounded-lg p-3 flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-plasma" />
                <span className="text-sm text-steel-dim font-bold uppercase tracking-widest text-[10px]">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardBody>

        {/* Input area */}
        <div className="border-t border-ash/10 p-4 bg-void">
          {!aiStatus?.available && (
            <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-500/10 border border-orange-500/20 p-2 rounded mb-3 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>AI сервис недоступен. Проверьте конфигурацию.</span>
              <Button variant="ghost" size="sm" onClick={checkAIStatus} className="text-orange-700 hover:text-orange-900">
                Проверить
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите сообщение... (Enter для отправки, Shift+Enter для новой строки)"
              className="flex-1 resize-none border border-ash/30 bg-void rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-plasma/20 focus:border-plasma transition-all text-steel"
              rows={2}
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setInput('Извлеки сущности из текста: ')}
            >
              Извлечь сущности
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setInput('Сгенерируй рекомендации для исследования связей между ')}
            >
              Рекомендации
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setInput('Объясни связь между ')}
            >
              Объяснить связь
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
