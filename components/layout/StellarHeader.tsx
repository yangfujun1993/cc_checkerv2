'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Settings, Menu, X } from 'lucide-react'

export function StellarHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="cosmic-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="interstellar-flex py-4">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center space-x-4"
          >
            <div className="quantum-glow p-2 rounded-lg">
              <Shield className="w-8 h-8 text-panther-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold cosmic-text">
                Black Panther
              </h1>
              <p className="text-sm text-panther-yellow font-tech">
                Quantum CC Checker
              </p>
            </div>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            <motion.a
              href="#home"
              className="stellar-button px-4 py-2 rounded-lg font-tech"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-4 h-4 mr-2 inline" />
              Home
            </motion.a>
            <motion.a
              href="#checker"
              className="stellar-button px-4 py-2 rounded-lg font-tech"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="w-4 h-4 mr-2 inline" />
              Checker
            </motion.a>
            <motion.a
              href="#settings"
              className="stellar-button px-4 py-2 rounded-lg font-tech"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4 mr-2 inline" />
              Settings
            </motion.a>
          </nav>

          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="stellar-button p-2 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-panther-gold" />
              ) : (
                <Menu className="w-6 h-6 text-panther-gold" />
              )}
            </motion.button>
          </div>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-panther-gold"
          >
            <div className="flex flex-col space-y-4">
              <a
                href="#home"
                className="stellar-button px-4 py-2 rounded-lg font-tech"
                onClick={() => setIsMenuOpen(false)}
              >
                <Zap className="w-4 h-4 mr-2 inline" />
                Home
              </a>
              <a
                href="#checker"
                className="stellar-button px-4 py-2 rounded-lg font-tech"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="w-4 h-4 mr-2 inline" />
                Checker
              </a>
              <a
                href="#settings"
                className="stellar-button px-4 py-2 rounded-lg font-tech"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2 inline" />
                Settings
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
} 