import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Swords, Zap, Shield, Star } from 'lucide-react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { CARDS, HEROES } from '../components/game/GameEngine';

export default function Collection() {
  const [playerProfile, setPlayerProfile] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.Player.filter({ created_by: user.email });
        
        if (profiles.length > 0) {
          setPlayerProfile(profiles[0]);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-purple-300 font-medium">Loading Collection...</p>
        </div>
      </div>
    );
  }

  const unlockedCards = playerProfile?.unlocked_cards || Object.keys(CARDS);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black pb-20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('Home')}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center text-purple-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
            COLLECTION
          </h1>
          <div className="w-10" />
        </div>

        {/* Heroes Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Heroes
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(HEROES).map((hero) => (
              <motion.div
                key={hero.id}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-xl p-4 backdrop-blur-md"
              >
                <div className="absolute top-2 right-2">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                    HERO
                  </div>
                </div>
                <div className="text-center mb-3">
                  <div className="text-5xl mb-2">{hero.sprite}</div>
                  <h3 className="text-sm font-bold text-white">{hero.name}</h3>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> HP
                    </span>
                    <span className="text-white font-bold">{hero.health}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Swords className="w-3 h-3" /> DMG
                    </span>
                    <span className="text-white font-bold">{hero.damage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Speed
                    </span>
                    <span className="text-white font-bold">{hero.speed}</span>
                  </div>
                  <div className="pt-2 border-t border-yellow-500/20">
                    <p className="text-yellow-300 text-[10px] font-medium">
                      Ultimate: {hero.ultimate}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cards Section */}
        <div>
          <h2 className="text-lg font-bold text-purple-300 mb-3">Cards ({unlockedCards.length}/{Object.keys(CARDS).length})</h2>
          <div className="grid grid-cols-3 gap-3">
            {Object.values(CARDS).map((card) => {
              const isUnlocked = unlockedCards.includes(card.id);

              return (
                <motion.div
                  key={card.id}
                  whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                  whileTap={isUnlocked ? { scale: 0.95 } : {}}
                  onClick={() => isUnlocked && setSelectedCard(card)}
                  className={`relative aspect-[3/4] rounded-lg border-2 ${
                    isUnlocked
                      ? 'border-purple-500/50 bg-purple-900/40 cursor-pointer hover:border-purple-400'
                      : 'border-gray-700 bg-gray-900/40 opacity-50'
                  } backdrop-blur-md`}
                >
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                      <Shield className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  
                  <div className="absolute -top-2 -right-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-black">
                    {card.cost}
                  </div>
                  
                  <div className="p-2 h-full flex flex-col items-center justify-center">
                    <div className="text-4xl mb-2">{card.sprite}</div>
                    <div className="text-[9px] text-white font-bold text-center leading-tight">
                      {card.name}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedCard(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 border-2 border-purple-500 rounded-2xl p-6 max-w-sm w-full backdrop-blur-xl"
          >
            <div className="text-center mb-6">
              <div className="text-7xl mb-4">{selectedCard.sprite}</div>
              <h2 className="text-2xl font-black text-white mb-2">{selectedCard.name}</h2>
              <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                Cost: {selectedCard.cost} Mana
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {selectedCard.type === 'unit' && (
                <>
                  <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                    <span className="text-gray-300 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" /> Health
                    </span>
                    <span className="text-white font-bold text-lg">{selectedCard.health}</span>
                  </div>
                  <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                    <span className="text-gray-300 flex items-center gap-2">
                      <Swords className="w-4 h-4 text-orange-400" /> Damage
                    </span>
                    <span className="text-white font-bold text-lg">{selectedCard.damage}</span>
                  </div>
                  <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                    <span className="text-gray-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" /> Speed
                    </span>
                    <span className="text-white font-bold text-lg">{selectedCard.speed}</span>
                  </div>
                  {selectedCard.count > 1 && (
                    <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3">
                      <p className="text-purple-300 text-sm">
                        ✨ Deploys {selectedCard.count} units
                      </p>
                    </div>
                  )}
                </>
              )}
              {selectedCard.type === 'spell' && (
                <div className="bg-cyan-500/20 border border-cyan-400/30 rounded-lg p-3">
                  <p className="text-cyan-300 text-sm text-center">
                    ⚡ {selectedCard.effect === 'push' ? 'Pushes enemies' : `Deals ${selectedCard.damage} damage`}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedCard(null)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
