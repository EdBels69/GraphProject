import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
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
      setError('Неподдерживаемый формат файла. Используйте PDF, DOCX или TXT.')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Файл слишком большой. Максимум 50 МБ.')
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
        throw new Error(errorData.error || 'Ошибка загрузки')
      }

      const data: UploadResult = await response.json()
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Загрузка файлов для анализа
        </h1>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardBody>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
              }
              ${status === 'uploading' || status === 'processing' ? 'opacity-50 pointer-events-none' : ''}
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
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Перетащите файл сюда или нажмите для выбора
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Поддерживаемые форматы: PDF, DOCX, TXT (до 50 МБ)
                </p>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} МБ
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button onClick={resetUpload} variant="secondary">
                    Выбрать другой
                  </Button>
                  <Button onClick={uploadFile} disabled={status === 'uploading' || status === 'processing'}>
                    {status === 'uploading' || status === 'processing' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {status === 'uploading' ? 'Загрузка...' : 'Анализ...'}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Загрузить и анализировать
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Ошибка</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Анализ завершён
                </h2>
                <p className="text-sm text-gray-500">
                  {result.document.fileName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{result.entities.totalEntities}</p>
                <p className="text-sm text-gray-600">Сущностей</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{result.relations.totalRelations}</p>
                <p className="text-sm text-gray-600">Связей</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{result.graph.nodes}</p>
                <p className="text-sm text-gray-600">Узлов графа</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{result.chunks.total}</p>
                <p className="text-sm text-gray-600">Чанков текста</p>
              </div>
            </div>

            {/* Entities by type */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Сущности по типам</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.entities.byType).map(([type, count]) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700"
                  >
                    {type}: {count}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => navigate('/analysis', { state: { graph: result.knowledgeGraph } })}>
                Перейти к анализу графа
              </Button>
              <Button variant="secondary" onClick={resetUpload}>
                Загрузить ещё файл
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
