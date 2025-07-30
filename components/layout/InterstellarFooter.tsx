'use client'

import { motion } from 'framer-motion'
import { Heart, Shield, Zap } from 'lucide-react'

export function InterstellarFooter() {
  return (
    <footer className="interstellar-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="cosmic-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="quantum-glow p-4 rounded-lg inline-block mb-4">
              <Shield className="w-8 h-8 text-panther-gold mx-auto" />
            </div>
            <h3 className="text-xl font-bold cosmic-text mb-2">
              Black Panther Tech
            </h3>
            <p className="text-panther-yellow font-tech">
              Advanced quantum technology for secure verification
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <div className="quantum-glow p-4 rounded-lg inline-block mb-4">
              <Zap className="w-8 h-8 text-panther-gold mx-auto" />
            </div>
            <h3 className="text-xl font-bold cosmic-text mb-2">
              Quantum Security
            </h3>
            <p className="text-panther-yellow font-tech">
              State-of-the-art encryption and verification
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <div className="quantum-glow p-4 rounded-lg inline-block mb-4">
              <Heart className="w-8 h-8 text-panther-gold mx-auto" />
            </div>
            <h3 className="text-xl font-bold cosmic-text mb-2">
              Made with Love
            </h3>
            <p className="text-panther-yellow font-tech">
              Crafted with precision and care
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-center mt-8 pt-8 border-t border-panther-gold"
        >
          <p className="text-panther-yellow font-tech">
            © 2024 Black Panther Tech. All rights reserved.
          </p>
          <p className="text-sm text-panther-gold mt-2">
            Powered by quantum technology and advanced algorithms
          </p>
        </motion.div>
      </div>
    </footer>
  )
} 