import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Home,
  FileText,
  MessageSquare,
  List,
  Network,
  Activity,
  Menu,
  Settings,
  User,
  BookOpen,
  LogOut,
  Languages
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { AiStatusIndicator } from './AiStatusIndicator'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru')
  }

  const navItems = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/upload', label: t('nav.upload'), icon: FileText },
    { path: '/projects', label: t('nav.projects'), icon: BookOpen },
    { path: '/analysis', label: t('nav.graph'), icon: Network },
    { path: '/ai-assistant', label: t('nav.ai_assistant'), icon: MessageSquare },
    { path: '/works', label: t('nav.knowledge_base'), icon: List },
    { path: '/health', label: t('nav.system_status'), icon: Activity },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen flex font-body text-steel relative overflow-hidden bg-void">
      {/* Sidebar Backdrop (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-void/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Glass Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-ash/20
          transform transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-ash/10 justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-sm bg-acid/20 border border-acid flex items-center justify-center group-hover:shadow-glow-acid transition-all duration-500">
              <Network className="w-5 h-5 text-acid" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-steel group-hover:text-acid transition-colors">
              GraphProject
            </span>
          </Link>

          <button
            onClick={toggleLanguage}
            className="p-1 px-2 rounded text-xs font-bold border border-ash/20 hover:border-acid/50 hover:text-acid transition-all flex items-center gap-1 uppercase"
          >
            <Languages className="w-3 h-3" />
            {i18n.language === 'ru' ? 'EN' : 'RU'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden
                  ${active
                    ? 'text-void bg-acid font-bold shadow-glow-acid/50'
                    : 'text-steel-dim hover:text-black hover:bg-steel/5'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${active ? 'animate-pulse' : ''}`} />
                <span className="font-display tracking-[0.15em] text-xs uppercase">{item.label}</span>

                {/* Active Indicator Line for non-active hover */}
                {!active && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-acid opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Stats / Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ash/10 bg-void shadow-inner space-y-3">
          <AiStatusIndicator />

          <div className="flex items-center gap-3 p-2 rounded-lg border border-ash/20 bg-void group/user shadow-sm">
            <div className="w-8 h-8 rounded bg-plasma/10 flex items-center justify-center border border-plasma/30 group-hover/user:border-plasma transition-colors">
              <User className="w-4 h-4 text-plasma" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-xs text-steel-dim/60 truncate tracking-tighter uppercase font-bold">{t('layout.operator')}</p>
              <p className="text-xs text-steel truncate font-bold">{user?.email?.split('@')[0] || t('layout.guest')}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 text-steel-dim hover:text-acid hover:bg-acid/10 rounded transition-all"
              title={t('layout.sign_out')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-ash/20 flex items-center justify-between px-4 bg-void shadow-sm sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-steel">
            <Menu />
          </button>
          <span className="font-display font-bold tracking-widest text-steel">GraphProject</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-ash/30 scrollbar-track-transparent p-4 lg:p-8 relative">
          {/* Ambient Glows */}
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-20">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-plasma/30 rounded-full blur-[128px]" />
            <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-acid/10 rounded-full blur-[128px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
