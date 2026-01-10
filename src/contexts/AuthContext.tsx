import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
// import { supabase } from '../../supabase/client' removed



interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // BYPASS MODE: Auto-login as local admin
        const mockUser: any = {
            id: 'local-admin',
            email: 'admin@local.com',
            app_metadata: { role: 'admin' },
            user_metadata: { name: 'Local Admin' }
        }

        const mockSession: any = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
            user: mockUser
        }

        console.log('[AuthContext] Local Mode: Auto-logging in...')
        setSession(mockSession)
        setUser(mockUser)
        setLoading(false)
    }, [])

    const signOut = async () => {
        // Local mode sign out
        console.log('[AuthContext] Local sign out')
        setUser(null)
        setSession(null)
    }

    const value = {
        user,
        session,
        loading,
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
