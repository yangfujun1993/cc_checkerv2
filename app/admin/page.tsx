'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Key, Users, Activity, LogOut, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface AccessKey {
  id: string
  key: string
  isActive: boolean
  createdAt: string
  lastUsed?: string
}

export default function AdminPage() {
  const [accessKeys, setAccessKeys] = useState<AccessKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showKeys, setShowKeys] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadAccessKeys()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('ownerToken')
    if (!token) {
      router.push('/login')
      return
    }
  }

  const loadAccessKeys = async () => {
    try {
      const token = localStorage.getItem('ownerToken')
      const response = await fetch('/api/auth/access-key', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAccessKeys(data.accessKeys)
      } else {
        toast.error('Failed to load access keys')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const createAccessKey = async () => {
    setIsCreating(true)
    try {
      const token = localStorage.getItem('ownerToken')
      const response = await fetch('/api/auth/access-key', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`New access key created: ${data.accessKey.key}`)
        loadAccessKeys()
      } else {
        toast.error('Failed to create access key')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setIsCreating(false)
    }
  }

  const deactivateKey = async (keyId: string) => {
    try {
      const token = localStorage.getItem('ownerToken')
      const response = await fetch('/api/auth/access-key', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyId })
      })

      if (response.ok) {
        toast.success('Access key deactivated')
        loadAccessKeys()
      } else {
        toast.error('Failed to deactivate access key')
      }
    } catch (error) {
      toast.error('Network error')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ownerToken')
    localStorage.removeItem('ownerUser')
    router.push('/login')
  }

  const activeKeys = accessKeys.filter(key => key.isActive)
  const inactiveKeys = accessKeys.filter(key => !key.isActive)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,215,0,0.05),transparent_50%)] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-lg border-b border-yellow-400/30 p-6"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Black Panther CC Checker</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </motion.header>

        <div className="max-w-7xl mx-auto p-6">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Access Keys</p>
                  <p className="text-3xl font-bold text-white">{accessKeys.length}</p>
                </div>
                <Key className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Keys</p>
                  <p className="text-3xl font-bold text-green-400">{activeKeys.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Inactive Keys</p>
                  <p className="text-3xl font-bold text-red-400">{inactiveKeys.length}</p>
                </div>
                <Activity className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/50 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Access Key Management</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowKeys(!showKeys)}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
                >
                  {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showKeys ? 'Hide' : 'Show'} Keys</span>
                </button>
                <button
                  onClick={createAccessKey}
                  disabled={isCreating}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreating ? 'Creating...' : 'Create Key'}</span>
                </button>
              </div>
            </div>

            {/* Access Keys List */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading access keys...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accessKeys.map((key) => (
                  <motion.div
                    key={key.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-yellow-400/20"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${key.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div>
                        <p className="text-white font-medium">
                          {showKeys ? key.key : `${key.key.substring(0, 8)}...`}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Created: {new Date(key.createdAt).toLocaleDateString()}
                          {key.lastUsed && ` • Last used: ${new Date(key.lastUsed).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        key.isActive 
                          ? 'bg-green-600/20 text-green-400 border border-green-400/30' 
                          : 'bg-red-600/20 text-red-400 border border-red-400/30'
                      }`}>
                        {key.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {key.isActive && (
                        <button
                          onClick={() => deactivateKey(key.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {accessKeys.length === 0 && (
                  <div className="text-center py-8">
                    <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No access keys created yet</p>
                    <p className="text-gray-500 text-sm">Create your first access key to get started</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
} 