import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Loader2, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

interface UploadResult {
  document: {
    id: string
    title: string
    fileName: string
    fileType: string
    pageCount?: number
    extractedAt: string
  }
  chunks: {
    total: number
    items: unknown[]
  }
  entities: {
    totalEntities: number
    byType: Record<string, number>
  }
  relations: {
    totalRelations: number
  }
  graph: {
    nodes: number
    edges: number
  }
  knowledgeGraph: unknown
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error'

export default function FileUploadPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }, [])

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    const allowedExtensions = ['.pdf', '.docx', '.txt']

    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(ext)

    if (!isValidType) {
      setError('Unsupported file format. Please use PDF, DOCX or TXT.')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds limit. Maximum 50 MB allowed.')
      return
    }

    setError(null)
    setSelectedFile(file)
    setResult(null)
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setStatus('uploading')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      setStatus('processing')

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload protocol termination')
      }

      const data: UploadResult = await response.json()
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown sequence failure')
      setStatus('error')
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setResult(null)
    setStatus('idle')
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="font-bold text-[10px] tracking-widest text-steel-dim">
              <ArrowLeft className="w-3 h-3 mr-2" />
              ВЕРНУТЬСЯ НА ГЛАВНУЮ
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-display font-bold text-steel tracking-tight mb-2">
              Центр загрузки документов
            </h1>
            <p className="text-sm font-bold text-steel-dim uppercase tracking-widest">Извлечение знаний из литературы</p>
          </div>
        </div>
      </div>

      <Card className="p-12 relative overflow-hidden group border-ash/20 bg-white shadow-xl">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-500
            ${dragActive
              ? 'border-acid bg-acid/5 scale-[1.01]'
              : 'border-ash/20 hover:border-acid/30 hover:bg-void/50'
            }
            ${status === 'uploading' || status === 'processing' ? 'opacity-30 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
            disabled={status === 'uploading' || status === 'processing'}
          />

          {!selectedFile ? (
            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="w-20 h-20 mx-auto bg-void rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-ash/20 shadow-sm">
                <Upload className="w-8 h-8 text-acid" />
              </div>
              <p className="text-xl font-display font-bold text-steel mb-2 tracking-wide">
                Перетащите файл сюда
              </p>
              <p className="text-[10px] font-bold text-steel-dim uppercase tracking-widest mb-6">
                ИЛИ НАЖМИТЕ ДЛЯ ВЫБОРА
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="px-3 py-1 bg-void rounded border border-ash/10 text-[9px] font-bold text-steel-dim uppercase">PDF</span>
                <span className="px-3 py-1 bg-void rounded border border-ash/10 text-[9px] font-bold text-steel-dim uppercase">DOCX</span>
                <span className="px-3 py-1 bg-void rounded border border-ash/10 text-[9px] font-bold text-steel-dim uppercase">TXT</span>
                <span className="px-3 py-1 bg-void rounded border border-ash/10 text-[9px] font-bold text-steel-dim uppercase">MAX 50MB</span>
              </div>
            </label>
          ) : (
            <div className="space-y-8 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-acid/10 rounded-full flex items-center justify-center border border-acid/20 shadow-glow-acid">
                  <FileText className="w-10 h-10 text-acid" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-display font-bold text-steel tracking-tight">{selectedFile.name}</p>
                  <p className="text-[10px] font-bold text-steel-dim mt-1 uppercase">
                    РАЗМЕР ФАЙЛА: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={resetUpload}
                  variant="secondary"
                  className="font-bold text-[10px] tracking-widest"
                >
                  СБРОСИТЬ
                </Button>
                <Button
                  onClick={uploadFile}
                  disabled={status === 'uploading' || status === 'processing'}
                  className="font-bold text-[10px] tracking-widest bg-acid text-void"
                >
                  {status === 'uploading' || status === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {status === 'uploading' ? 'ЗАГРУЗКА...' : 'АНАЛИЗ...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      НАЧАТЬ АНАЛИЗ
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 p-6 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-4 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-bold text-red-600 text-sm uppercase tracking-widest mb-1">ОШИБКА ЗАГРУЗКИ</p>
              <p className="text-xs text-red-600/80 font-bold italic">{error}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      {result && (
        <Card className="p-8 border-acid/20 bg-acid/5 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-acid/20 rounded-2xl flex items-center justify-center shadow-glow-acid">
              <CheckCircle className="w-7 h-7 text-acid" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-steel tracking-tight">
                Анализ завершен
              </h2>
              <p className="text-[10px] font-bold text-acid uppercase tracking-widest">
                ОБРАБОТАН ФАЙЛ: {result.document.fileName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-void rounded-xl p-6 border border-ash/10 shadow-sm group hover:border-acid/30 transition-all">
              <p className="text-3xl font-display font-bold text-steel mb-1">{result.entities.totalEntities}</p>
              <p className="text-[10px] font-bold text-steel-dim uppercase tracking-widest">СУЩНОСТЕЙ НАЙДЕНО</p>
            </div>
            <div className="bg-void rounded-xl p-6 border border-ash/10 shadow-sm group hover:border-acid/30 transition-all">
              <p className="text-3xl font-display font-bold text-steel mb-1">{result.relations.totalRelations}</p>
              <p className="text-[10px] font-bold text-steel-dim uppercase tracking-widest">СВЯЗЕЙ ВЫЯВЛЕНО</p>
            </div>
            <div className="bg-void rounded-xl p-6 border border-ash/10 shadow-sm group hover:border-acid/30 transition-all">
              <p className="text-3xl font-display font-bold text-steel mb-1">{result.graph.nodes}</p>
              <p className="text-[10px] font-bold text-steel-dim uppercase tracking-widest">УЗЛОВ ГРАФА</p>
            </div>
            <div className="bg-void rounded-xl p-6 border border-ash/10 shadow-sm group hover:border-acid/30 transition-all">
              <p className="text-3xl font-display font-bold text-steel mb-1">{result.chunks.total}</p>
              <p className="text-[10px] font-bold text-steel-dim uppercase tracking-widest">СЕГМЕНТОВ ДАННЫХ</p>
            </div>
          </div>

          {/* Entities by type */}
          <div className="mb-8">
            <h3 className="text-[10px] font-bold text-steel-dim mb-4 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4" /> РАСПРЕДЕЛЕНИЕ СУЩНОСТЕЙ
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.entities.byType).map(([type, count]) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-mono font-bold text-steel hover:text-acid hover:border-acid transition-all cursor-default"
                >
                  {type.toUpperCase()}: {count}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t border-ash/10">
            <Button
              className="font-bold text-xs tracking-widest bg-acid text-void"
              onClick={() => navigate('/analysis', { state: { graph: result.knowledgeGraph } })}
            >
              ПЕРЕЙТИ К ГРАФУ
            </Button>
            <Button
              variant="secondary"
              className="font-bold text-xs tracking-widest"
              onClick={resetUpload}
            >
              НОВАЯ ЗАГРУЗКА
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
