import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ExternalLink, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FileUploader } from '@/components/FileUploader'
import GraphViewer from '@/components/GraphViewer'
import { useApi, useApiPost } from '@/hooks/useApi'
import { Artifact, Graph, GraphEdge, GraphNode, Profile, Publication, Selection, Work, WorkJob } from '@/shared/types'

export default function FileUploadPage() {
  const activeWorkId = useMemo(() => localStorage.getItem('activeWorkId') || '', [])

  const { data: worksResp } = useApi<{ success: true; data: Work[]; count: number }>('/works', null, false)
  const activeWork = useMemo(() => (worksResp?.data || []).find(w => w.id === activeWorkId), [worksResp, activeWorkId])

  const { data: docsResp, refetch: refetchDocs } = useApi<{ success: true; data: Array<{ id: string; title: string; fileName?: string; url?: string; fileType: string; extractedAt: string }>; count: number }>(
    activeWorkId ? `/documents/by-work/${activeWorkId}` : '/documents/by-work/__none__',
    null,
    false
  )


  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | undefined>(undefined)
  const [lastUploadSummary, setLastUploadSummary] = useState<string | null>(null)

  const [url, setUrl] = useState('')
  const { postData: postUrl, loading: urlLoading } = useApiPost<any>('/documents/url', false)

  const [discoveryQuery, setDiscoveryQuery] = useState('')
  const [discoveryMaxResults, setDiscoveryMaxResults] = useState('20')
  const [discoverySources, setDiscoverySources] = useState({ pubmed: true, crossref: true, arxiv: false })
  const [discoverySummary, setDiscoverySummary] = useState<string | null>(null)
  const { postData: postDiscovery, loading: discoveryLoading } = useApiPost<any>('/search/advanced', false)

  const [publicationsQ, setPublicationsQ] = useState('')
  const publicationsEndpoint = useMemo(() => {
    const workId = activeWorkId || '__none__'
    const params = new URLSearchParams()
    params.set('limit', '50')
    params.set('offset', '0')
    if (publicationsQ.trim()) params.set('q', publicationsQ.trim())
    return `/works/${encodeURIComponent(workId)}/publications?${params.toString()}`
  }, [activeWorkId, publicationsQ])

  const {
    data: publicationsResp,
    refetch: refetchPublications
  } = useApi<{ success: true; data: { work: Work; total: number; items: Publication[] } }>(
    publicationsEndpoint,
    null,
    false
  )

  const profilesEndpoint = useMemo(() => {
    const workId = activeWorkId || '__none__'
    const params = new URLSearchParams()
    params.set('limit', '50')
    params.set('offset', '0')
    return `/works/${encodeURIComponent(workId)}/profiles?${params.toString()}`
  }, [activeWorkId])

  const { data: profilesResp, refetch: refetchProfiles } = useApi<{ success: true; data: { work: Work; total: number; items: Profile[] } }>(
    profilesEndpoint,
    null,
    false
  )

  const selectionsEndpoint = useMemo(() => {
    const workId = activeWorkId || '__none__'
    const params = new URLSearchParams()
    params.set('limit', '50')
    params.set('offset', '0')
    return `/works/${encodeURIComponent(workId)}/selections?${params.toString()}`
  }, [activeWorkId])

  const { data: selectionsResp, refetch: refetchSelections } = useApi<{ success: true; data: { work: Work; total: number; items: Selection[] } }>(
    selectionsEndpoint,
    null,
    false
  )

  const jobsEndpoint = useMemo(() => {
    const workId = activeWorkId || '__none__'
    const params = new URLSearchParams()
    params.set('limit', '50')
    params.set('offset', '0')
    return `/works/${encodeURIComponent(workId)}/jobs?${params.toString()}`
  }, [activeWorkId])

  const { data: jobsResp, refetch: refetchJobs } = useApi<{ success: true; data: { work: Work; total: number; items: WorkJob[] } }>(
    jobsEndpoint,
    null,
    false
  )

  const artifactsEndpoint = useMemo(() => {
    const workId = activeWorkId || '__none__'
    const params = new URLSearchParams()
    params.set('limit', '50')
    params.set('offset', '0')
    return `/works/${encodeURIComponent(workId)}/artifacts?${params.toString()}`
  }, [activeWorkId])

  const { data: artifactsResp, refetch: refetchArtifacts } = useApi<{ success: true; data: { work: Work; total: number; items: Artifact[] } }>(
    artifactsEndpoint,
    null,
    false
  )

  const [cancelingJobId, setCancelingJobId] = useState<string | null>(null)

  useEffect(() => {
    if (!activeWorkId) return
    const intervalId = window.setInterval(() => {
      void refetchJobs()
    }, 2500)
    return () => {
      window.clearInterval(intervalId)
    }
  }, [activeWorkId, refetchJobs])

  const cancelJob = async (jobId: string) => {
    if (!activeWorkId) return
    setCancelingJobId(jobId)
    try {
      const response = await fetch(`/api/works/${encodeURIComponent(activeWorkId)}/jobs/${encodeURIComponent(jobId)}/cancel`, {
        method: 'POST'
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `HTTP ${response.status}`)
      }
      await refetchJobs()
    } finally {
      setCancelingJobId(null)
    }
  }

  const [activeProfileId, setActiveProfileId] = useState<string>(() => localStorage.getItem('activeProfileId') || '')
  const [activeSelectionId, setActiveSelectionId] = useState<string>(() => localStorage.getItem('activeSelectionId') || '')
  const [newProfileName, setNewProfileName] = useState('')
  const [newSelectionName, setNewSelectionName] = useState('')
  const [creatingProfile, setCreatingProfile] = useState(false)
  const [creatingSelection, setCreatingSelection] = useState(false)

  const [artifactType, setArtifactType] = useState('projection')
  const [artifactTopNodes, setArtifactTopNodes] = useState('250')
  const [artifactMinEdgeWeight, setArtifactMinEdgeWeight] = useState('')
  const [buildingArtifact, setBuildingArtifact] = useState(false)
  const [artifactError, setArtifactError] = useState<string | null>(null)
  const [artifactView, setArtifactView] = useState<{ artifact: Artifact; graph: Graph } | null>(null)
  const [openingArtifactId, setOpeningArtifactId] = useState<string | null>(null)

  const profiles = profilesResp?.data?.items ?? []
  const selections = selectionsResp?.data?.items ?? []
  const artifacts = artifactsResp?.data?.items ?? []

  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId) ?? null, [profiles, activeProfileId])
  const activeSelection = useMemo(() => selections.find(s => s.id === activeSelectionId) ?? null, [selections, activeSelectionId])

  const setActiveProfile = (id: string) => {
    setActiveProfileId(id)
    localStorage.setItem('activeProfileId', id)
  }

  const setActiveSelection = (id: string) => {
    setActiveSelectionId(id)
    localStorage.setItem('activeSelectionId', id)
  }

  const createProfile = async () => {
    if (!activeWorkId) return
    const name = newProfileName.trim()
    if (!name) return

    setCreatingProfile(true)
    try {
      const response = await fetch(`/api/works/${encodeURIComponent(activeWorkId)}/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, config: {} })
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `HTTP ${response.status}`)
      }
      const json = await response.json()
      const createdId = String(json?.data?.id || '')
      await refetchProfiles()
      if (createdId) setActiveProfile(createdId)
      setNewProfileName('')
    } finally {
      setCreatingProfile(false)
    }
  }

  const createSelection = async () => {
    if (!activeWorkId) return
    const name = newSelectionName.trim()
    if (!name) return

    setCreatingSelection(true)
    try {
      const query: Record<string, unknown> = {}
      const q = publicationsQ.trim()
      if (q) query.q = q

      const response = await fetch(`/api/works/${encodeURIComponent(activeWorkId)}/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          query,
          derivedFromProfileVersion: activeProfile?.version
        })
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `HTTP ${response.status}`)
      }
      const json = await response.json()
      const createdId = String(json?.data?.id || '')
      await refetchSelections()
      if (createdId) setActiveSelection(createdId)
      setNewSelectionName('')
    } finally {
      setCreatingSelection(false)
    }
  }

  const onUploadFile = async (file: File) => {
    if (!activeWorkId) return
    setUploading(true)
    setUploadError(undefined)
    setLastUploadSummary(null)

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('workId', activeWorkId)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: form
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `HTTP ${response.status}`)
      }

      const result = await response.json()
      const nodes = result?.knowledgeGraph?.graph?.nodes?.length
      const edges = result?.knowledgeGraph?.graph?.edges?.length
      setLastUploadSummary(`Файл обработан: ${String(nodes ?? '—')} узлов, ${String(edges ?? '—')} рёбер`)
      await refetchDocs()
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  const onProcessUrl = async () => {
    if (!activeWorkId) return
    const trimmed = url.trim()
    if (!trimmed) return

    const result = await postUrl({ url: trimmed, workId: activeWorkId })
    const nodes = result?.knowledgeGraph?.graph?.nodes?.length
    const edges = result?.knowledgeGraph?.graph?.edges?.length
    setLastUploadSummary(`URL обработан: ${String(nodes ?? '—')} узлов, ${String(edges ?? '—')} рёбер`)
    setUrl('')
    await refetchDocs()
  }

  const toggleDiscoverySource = (key: keyof typeof discoverySources) => {
    setDiscoverySources(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const onDiscoverySearch = async () => {
    if (!activeWorkId) return
    const q = discoveryQuery.trim()
    if (q.length < 2) return

    const parsedMaxResults = Number.parseInt(discoveryMaxResults, 10)
    const selectedSources = (Object.entries(discoverySources) as Array<[keyof typeof discoverySources, boolean]>)
      .filter(([, enabled]) => enabled)
      .map(([k]) => k)

    if (selectedSources.length === 0) return

    const payload = await postDiscovery({
      query: q,
      sources: selectedSources,
      maxResults: Number.isFinite(parsedMaxResults) && parsedMaxResults > 0 ? parsedMaxResults : undefined,
      sortBy: 'relevance',
      workId: activeWorkId
    })

    const persistedCount = payload?.persisted?.publicationsLinked
    const total = payload?.totalResults
    setDiscoverySummary(`Добавлено в корпус: ${String(persistedCount ?? '—')} · найдено: ${String(total ?? '—')}`)
    await refetchPublications()
  }

  const docs = docsResp?.data ?? []
  const publications = publicationsResp?.data?.items ?? []
  const publicationsTotal = publicationsResp?.data?.total ?? 0
  const jobs = jobsResp?.data?.items ?? []
  const jobsTotal = jobsResp?.data?.total ?? 0
  const artifactsTotal = artifactsResp?.data?.total ?? 0

  const openArtifact = async (artifact: Artifact) => {
    if (!activeWorkId) return
    setArtifactError(null)
    setOpeningArtifactId(artifact.id)
    try {
      const response = await fetch(`/api/works/${encodeURIComponent(activeWorkId)}/artifacts/${encodeURIComponent(artifact.id)}/graph`)
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `HTTP ${response.status}`)
      }
      const json = (await response.json()) as {
        success: true
        data: {
          artifact: Artifact
          graph: { nodes: GraphNode[]; edges: GraphEdge[]; directed: boolean }
        }
      }

      const directed = Boolean(json?.data?.graph?.directed)
      const graph: Graph = {
        id: `artifact-${artifact.id}`,
        name: `Artifact ${artifact.type}`,
        nodes: json.data.graph.nodes,
        edges: json.data.graph.edges,
        directed,
        createdAt: new Date(artifact.createdAt),
        updatedAt: new Date(artifact.updatedAt)
      }

      setArtifactView({ artifact, graph })
    } catch (e) {
      setArtifactError(e instanceof Error ? e.message : 'Ошибка загрузки артефакта')
      setArtifactView(null)
    } finally {
      setOpeningArtifactId(null)
    }
  }

  const buildArtifact = async () => {
    if (!activeWorkId) return
    const type = artifactType.trim()
    if (!type) return

    setArtifactError(null)
    setBuildingArtifact(true)
    try {
      const params: Record<string, unknown> = {}
      const top = artifactTopNodes.trim()
      if (top) {
        const n = Number(top)
        if (Number.isFinite(n)) params.topNodes = n
      }
      const minW = artifactMinEdgeWeight.trim()
      if (minW) {
        const n = Number(minW)
        if (Number.isFinite(n)) params.minEdgeWeight = n
      }

      const response = await fetch(`/api/works/${encodeURIComponent(activeWorkId)}/artifacts/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          params,
          selectionId: activeSelectionId || undefined,
          profileVersion: activeProfile?.version
        })
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `HTTP ${response.status}`)
      }
      const json = (await response.json()) as { success: true; data: Artifact }
      await refetchArtifacts()
      if (json?.data?.id) {
        await openArtifact(json.data)
      }
    } catch (e) {
      setArtifactError(e instanceof Error ? e.message : 'Ошибка сборки артефакта')
    } finally {
      setBuildingArtifact(false)
    }
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
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">
            Загрузка источников
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {activeWork
              ? `Активная работа: ${activeWork.name}`
              : 'Выберите активную работу — иначе источники некуда привязать.'}
          </p>
        </div>
      </div>

      {!activeWorkId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">Нет активной работы</div>
              <div className="text-sm text-gray-600 mt-1">Создайте работу и выберите её — затем добавляйте источники.</div>
            </div>
            <Link to="/works">
              <Button>Перейти к работам</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Файл</h2>
              <div className="text-xs text-gray-500">PDF / DOCX / TXT</div>
            </div>
            <div className="mt-4">
              <FileUploader onFileUpload={onUploadFile} isLoading={uploading} error={uploadError} />
            </div>
            {lastUploadSummary && (
              <div className="mt-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                {lastUploadSummary}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Ссылка</h2>
              <div className="text-xs text-gray-500">/api/documents/url</div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-10">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  placeholder="https://..."
                  inputMode="url"
                />
              </div>
              <div className="lg:col-span-2">
                <Button className="w-full" onClick={onProcessUrl} loading={urlLoading} disabled={!activeWorkId || !url.trim()}>
                  Ок
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Поиск статей (Discovery)</h2>
                <div className="text-xs text-gray-500 mt-1">
                  Поиск по внешним базам. Найденные статьи добавляются в корпус текущей работы.
                </div>
              </div>
              <div className="text-xs text-gray-500">/api/search/advanced</div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-9">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={discoveryQuery}
                    onChange={(e) => setDiscoveryQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    placeholder="carnitine AND oncology"
                    disabled={!activeWorkId}
                  />
                </div>
              </div>
              <div className="lg:col-span-3">
                <input
                  value={discoveryMaxResults}
                  onChange={(e) => setDiscoveryMaxResults(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  placeholder="20"
                  inputMode="numeric"
                  disabled={!activeWorkId}
                />
              </div>

              <div className="lg:col-span-12 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={discoverySources.pubmed} onChange={() => toggleDiscoverySource('pubmed')} disabled={!activeWorkId} />
                  PubMed
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={discoverySources.crossref} onChange={() => toggleDiscoverySource('crossref')} disabled={!activeWorkId} />
                  Crossref
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={discoverySources.arxiv} onChange={() => toggleDiscoverySource('arxiv')} disabled={!activeWorkId} />
                  arXiv
                </label>
              </div>

              <div className="lg:col-span-12">
                <Button className="w-full" onClick={onDiscoverySearch} loading={discoveryLoading} disabled={!activeWorkId || discoveryQuery.trim().length < 2}>
                  Найти и добавить в корпус публикаций
                </Button>
                {discoverySummary && (
                  <div className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    {discoverySummary}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">Корпус публикаций</h2>
                <div className="text-xs text-gray-500 mt-0.5">{publicationsTotal} записей</div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/works">
                  <Button variant="ghost" size="sm">
                    Таблица
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => refetchPublications()} disabled={!activeWorkId}>
                  Обновить
                </Button>
              </div>
            </div>
            <div className="px-5 py-4 border-b border-gray-200">
              <input
                value={publicationsQ}
                onChange={(e) => setPublicationsQ(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                placeholder="фильтр по title/abstract"
                disabled={!activeWorkId}
              />
            </div>
            <div className="divide-y divide-gray-200">
              {!activeWorkId ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-gray-900 font-medium">Нет активной работы</p>
                  <p className="text-sm text-gray-600 mt-1">Выберите работу — тогда можно собирать корпус.</p>
                </div>
              ) : publications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-gray-900 font-medium">Пока пусто</p>
                  <p className="text-sm text-gray-600 mt-1">Запустите поиск или добавьте публикации другим способом.</p>
                </div>
              ) : (
                publications.map((p) => (
                  <div key={p.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 break-words">{p.title}</div>
                        <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          {p.year !== undefined && <span>{p.year}</span>}
                          {p.source && <span>{p.source}</span>}
                          <span>{p.accessStatus}</span>
                          {p.doi && <span className="truncate">DOI: {p.doi}</span>}
                          {p.pmid && <span className="truncate">PMID: {p.pmid}</span>}
                        </div>
                      </div>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-700 hover:underline whitespace-nowrap"
                        >
                          Открыть
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Активность (документы)</h2>
              <Button variant="ghost" size="sm" onClick={() => refetchDocs()} disabled={!activeWorkId}>
                Обновить
              </Button>
            </div>
            <div className="divide-y divide-gray-200">
              {docs.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-gray-900 font-medium">Пока пусто</p>
                  <p className="text-sm text-gray-600 mt-1">Загрузите файл или обработайте URL — записи появятся здесь.</p>
                </div>
              ) : (
                docs.map((d) => (
                  <div key={d.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{d.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {d.fileName ? d.fileName : d.url ? d.url : d.fileType}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(d.extractedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">Profiles / Selections</h2>
                <div className="text-xs text-gray-500 mt-0.5">
                  {activeProfile ? `profile: ${activeProfile.name} · v${activeProfile.version}` : 'profile: —'}
                  {' · '}
                  {activeSelection ? `selection: ${activeSelection.name}` : 'selection: —'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => refetchProfiles()} disabled={!activeWorkId}>
                  Profiles
                </Button>
                <Button variant="ghost" size="sm" onClick={() => refetchSelections()} disabled={!activeWorkId}>
                  Selections
                </Button>
              </div>
            </div>

            {!activeWorkId ? (
              <div className="px-5 py-10 text-center">
                <p className="text-gray-900 font-medium">Нет активной работы</p>
                <p className="text-sm text-gray-600 mt-1">Выберите работу — тогда можно создавать профили и выборки.</p>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-7">
                    <input
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      placeholder="Новый профиль: имя"
                      disabled={!activeWorkId}
                    />
                  </div>
                  <div className="lg:col-span-5">
                    <Button className="w-full" onClick={createProfile} disabled={!activeWorkId || creatingProfile} loading={creatingProfile}>
                      Создать профиль
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-7">
                    <input
                      value={newSelectionName}
                      onChange={(e) => setNewSelectionName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      placeholder="Новая выборка: имя (сохраняет текущий фильтр корпуса)"
                      disabled={!activeWorkId}
                    />
                    <div className="text-xs text-gray-500 mt-1">Текущий фильтр: {publicationsQ.trim() ? publicationsQ.trim() : '—'}</div>
                  </div>
                  <div className="lg:col-span-5">
                    <Button className="w-full" onClick={createSelection} disabled={!activeWorkId || creatingSelection} loading={creatingSelection}>
                      Создать выборку
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-700">Profiles</div>
                    <div className="divide-y divide-gray-200">
                      {profiles.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-600">Профилей пока нет</div>
                      ) : (
                        profiles.slice(0, 8).map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setActiveProfile(p.id)}
                            className={`w-full text-left px-4 py-2 text-sm ${p.id === activeProfileId ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50 text-gray-900'}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="truncate">{p.name}</span>
                              <span className="text-xs text-gray-500 whitespace-nowrap">v{p.version}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-700">Selections</div>
                    <div className="divide-y divide-gray-200">
                      {selections.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-600">Выборок пока нет</div>
                      ) : (
                        selections.slice(0, 8).map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setActiveSelection(s.id)}
                            className={`w-full text-left px-4 py-2 text-sm ${s.id === activeSelectionId ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50 text-gray-900'}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="truncate">{s.name}</span>
                              {s.derivedFromProfileVersion !== undefined && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">v{s.derivedFromProfileVersion}</span>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">Артефакты</h2>
                <div className="text-xs text-gray-500 mt-0.5">{artifactsTotal} шт.</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refetchArtifacts()} disabled={!activeWorkId}>
                Обновить
              </Button>
            </div>

            {!activeWorkId ? (
              <div className="px-5 py-10 text-center">
                <p className="text-gray-900 font-medium">Нет активной работы</p>
                <p className="text-sm text-gray-600 mt-1">Выберите работу — тогда можно собирать артефакты.</p>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-4">
                    <input
                      value={artifactType}
                      onChange={(e) => setArtifactType(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      placeholder="type"
                      disabled={!activeWorkId}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <input
                      value={artifactTopNodes}
                      onChange={(e) => setArtifactTopNodes(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      placeholder="topNodes (например 250)"
                      inputMode="numeric"
                      disabled={!activeWorkId}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <input
                      value={artifactMinEdgeWeight}
                      onChange={(e) => setArtifactMinEdgeWeight(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      placeholder="minEdgeWeight (например 2)"
                      inputMode="decimal"
                      disabled={!activeWorkId}
                    />
                  </div>
                  <div className="lg:col-span-12">
                    <Button className="w-full" onClick={buildArtifact} disabled={!activeWorkId || buildingArtifact} loading={buildingArtifact}>
                      Собрать артефакт
                    </Button>
                    <div className="text-xs text-gray-500 mt-1">
                      selection: {activeSelection ? activeSelection.name : '—'} · profile: {activeProfile ? `v${activeProfile.version}` : '—'}
                    </div>
                    {artifactError && (
                      <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        {artifactError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-700">Список</div>
                  <div className="divide-y divide-gray-200">
                    {artifacts.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-600">Артефактов пока нет</div>
                    ) : (
                      artifacts.slice(0, 8).map((a) => {
                        const stats = a.stats
                        const statsObj = typeof stats === 'object' && stats !== null ? (stats as Record<string, unknown>) : null
                        const totalNodes = statsObj && typeof statsObj.totalNodes === 'number' ? statsObj.totalNodes : undefined
                        const totalEdges = statsObj && typeof statsObj.totalEdges === 'number' ? statsObj.totalEdges : undefined

                        return (
                          <div key={a.id} className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 break-words">{a.type}</div>
                                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                  {totalNodes !== undefined && <span>узлы: {totalNodes}</span>}
                                  {totalEdges !== undefined && <span>рёбра: {totalEdges}</span>}
                                  <span>{new Date(a.createdAt).toLocaleString()}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openArtifact(a)}
                                disabled={openingArtifactId === a.id}
                                loading={openingArtifactId === a.id}
                              >
                                Открыть
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {artifactView && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-gray-700 truncate">
                        Просмотр: {artifactView.artifact.type}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setArtifactView(null)}>
                        Закрыть
                      </Button>
                    </div>
                    <div className="p-3">
                      {artifactView.graph.nodes.length <= 250 ? (
                        <div className="h-[420px] relative">
                          <GraphViewer key={artifactView.graph.id} graph={artifactView.graph} showControls={false} />
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="text-sm font-semibold text-gray-900">Визуализация</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Граф слишком большой для лёгкого предпросмотра (узлов: {artifactView.graph.nodes.length}).
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">Активность (jobs)</h2>
                <div className="text-xs text-gray-500 mt-0.5">{jobsTotal} запусков</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refetchJobs()} disabled={!activeWorkId}>
                Обновить
              </Button>
            </div>
            <div className="divide-y divide-gray-200">
              {!activeWorkId ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-gray-900 font-medium">Нет активной работы</p>
                  <p className="text-sm text-gray-600 mt-1">Выберите работу — тогда можно отслеживать задачи.</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-gray-900 font-medium">Запусков нет</p>
                  <p className="text-sm text-gray-600 mt-1">Запустите задачу — статус появится здесь.</p>
                </div>
              ) : (
                jobs.map((j) => {
                  const total = Number(j.progress?.total ?? 0)
                  const completed = Number(j.progress?.completed ?? 0)
                  const failed = Number(j.progress?.failed ?? 0)
                  const done = completed + failed
                  const canCancel = j.status === 'pending' || j.status === 'downloading'

                  return (
                    <div key={j.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 break-words">{j.kind}</div>
                          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                            <span>{j.status}</span>
                            <span>{done}/{total}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canCancel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelJob(j.id)}
                              disabled={cancelingJobId === j.id}
                              loading={cancelingJobId === j.id}
                            >
                              Отменить
                            </Button>
                          )}
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(j.finishedAt || j.startedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="text-sm font-semibold text-gray-900">Дальше</div>
            <div className="text-sm text-gray-600 mt-1">После добавления источников переходите к анализу графа.</div>
            <div className="mt-4">
              <Link to="/analysis" className={activeWorkId ? '' : 'pointer-events-none opacity-50'}>
                <Button className="w-full" disabled={!activeWorkId}>
                  Перейти к анализу
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
