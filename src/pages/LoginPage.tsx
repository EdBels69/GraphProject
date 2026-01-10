import React, { useState } from 'react'
import { supabase } from '../../supabase/client'
import { useToast } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, UserPlus, Mail, Lock, Zap } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const { addToast } = useToast()
    const navigate = useNavigate()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
                addToast('Registration successful! Check your email for verification.', 'success')
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                addToast('Welcome back!', 'success')
                navigate('/')
            }
        } catch (error: any) {
            addToast(error.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4 relative overflow-hidden font-outfit">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#CCFF00]/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#B829EA]/5 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-[#141416]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#CCFF00] to-[#B829EA] p-[1px] mb-4">
                            <div className="w-full h-full bg-[#141416] rounded-[15px] flex items-center justify-center">
                                <Zap className="w-8 h-8 text-[#CCFF00]" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-rajdhani font-bold text-white mb-2">
                            {isSignUp ? 'Create Account' : 'Bio-Digital Foundry'}
                        </h1>
                        <p className="text-white/40 text-sm">
                            {isSignUp ? 'Join the next generation of scientific analysis' : 'Sign in to access your research graph'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@institution.com"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-[#CCFF00]/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/40 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-[#B829EA]/50 transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#CCFF00] hover:bg-[#DFFF33] text-black font-bold py-4 rounded-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group mt-6"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                                    <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-white/40 hover:text-white text-sm transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>

                    {/* Footer decoration */}
                    <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#CCFF00]/50 to-transparent" />
                </div>

                <p className="text-center mt-8 text-white/20 text-xs tracking-widest uppercase">
                    Secured by Supabase Authentication
                </p>
            </motion.div>
        </div>
    )
}
