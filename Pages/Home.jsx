import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Swords, Users, Trophy, Sparkles, Crown, Zap, X, Lock } from 'lucide-react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const [user, setUser] = useState(null);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [recentMatches, setRecentMatches] = useState([]);
  const [showRanksModal, setShowRanksModal] = useState(false);

  // Rank progression with rewards
  const rankProgression = [
    { 
      rank: 'Stone', 
      trophies: 0, 
      color: 'from-gray-500 to-gray-700',
      cards: ['blade_runner', 'shadow_pack'],
      description: 'Starting rank - Basic units'
    },
    { 
      rank: 'Bronze', 
      trophies: 250, 
      color: 'from-amber-600 to-amber-800',
      cards: ['storm_mage', 'wind_shift'],
      description: 'Unlock ranged units'
    },
    { 
      rank: 'Silver', 
      trophies: 500, 
      color: 'from-gray-400 to-gray-500',
      cards: ['iron_colossus', 'meteor_rift'],
      description: 'Unlock tank and AOE spell'
    },
    { 
      rank: 'Gold', 
      trophies: 1000, 
      color: 'from-yellow-400 to-yellow-600',
      cards: [],
      description: 'Master tier - All cards unlocked'
    },
    { 
      rank: 'Platinum', 
      trophies: 2000, 
      color: 'from-cyan-400 to-cyan-600',
      cards: [],
      description: 'Elite warriors'
    },
    { 
      rank: 'Diamond', 
      trophies: 3500, 
      color: 'from-blue-400 to-purple-500',
      cards: [],
      description: 'Legendary status'
    },
    { 
      rank: 'Mythic', 
      trophies: 5000, 
      color: 'from-purple-500 to-pink-600',
      cards: [],
      description: 'Ultimate champion'
    },
  ];

  useEffect(() => {
    const initProfile = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Try to find existing player profile
        const profiles = await base44.entities.Player.filter({ created_by: currentUser.email });
        
        if (profiles.length > 0) {
          setPlayerProfile(profiles[0]);
          
          // Load recent matches
          const matches = await base44.entities.Match.filter(
            { player_id: profiles[0].id },
            '-created_date',
            5
          );
          setRecentMatches(matches);
        } else {
          // Create new player profile
          const newProfile = await base44.entities.Player.create({
            username: currentUser.full_name || 'Unknown Warrior',
            rank: 'Stone',
            trophies: 0,
            wins: 0,
            losses: 0,
            gold: 1000,
            deck: ['blade_runner', 'storm_mage', 'iron_colossus', 'shadow_pack', 'meteor_rift', 'wind_shift', 'blade_runner', 'shadow_pack'],
            hero_id: 'aeris',
            unlocked_cards: ['blade_runner', 'storm_mage', 'iron_colossus', 'shadow_pack', 'meteor_rift', 'wind_shift'],
          });
          setPlayerProfile(newProfile);
        }
      } catch (error) {
        console.error('Error initializing profile:', error);
      } finally {
        setLoading(false);
      }
    };

    initProfile();
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
          <p className="text-purple-300 font-medium">Loading Realm...</p>
        </div>
      </div>
    );
  }

  const rankColors = {
    Stone: 'from-gray-500 to-gray-700',
    Bronze: 'from-amber-600 to-amber-800',
    Silver: 'from-gray-400 to-gray-500',
    Gold: 'from-yellow-400 to-yellow-600',
    Platinum: 'from-cyan-400 to-cyan-600',
    Diamond: 'from-blue-400 to-purple-500',
    Mythic: 'from-purple-500 to-pink-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
            animate={{
              y: [0, -1000],
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{ left: Math.random() * 100 + '%', top: '100%' }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-block mb-4">
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                ⚔️
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-purple-500/30 blur-2xl"
              />
            </div>
          </div>
          
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text">
            REALM RUNNERS
          </h1>
          <p className="text-purple-300 text-sm font-medium">
            Conquer the Ever-Changing Battlefield
          </p>
        </motion.div>

        {/* Player Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="bg-black/40 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${rankColors[playerProfile?.rank || 'Stone']} opacity-10`} />
            
            <div className="relative flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{playerProfile?.username}</h2>
                <div className="flex items-center gap-2">
                  <Crown className={`w-4 h-4 text-${playerProfile?.rank === 'Mythic' ? 'purple' : 'yellow'}-400`} />
                  <span className="text-sm font-bold text-purple-300">{playerProfile?.rank}</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRanksModal(true)}
                className="text-right cursor-pointer"
              >
                <div className="flex items-center justify-end gap-1 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-xl font-bold text-yellow-400">{playerProfile?.trophies || 0}</span>
                </div>
                <p className="text-xs text-purple-400 hover:text-purple-300">View Ranks →</p>
              </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-500/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{playerProfile?.wins || 0}</p>
                <p className="text-xs text-gray-400">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{playerProfile?.losses || 0}</p>
                <p className="text-xs text-gray-400">Losses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{playerProfile?.gold || 0}</p>
                <p className="text-xs text-gray-400">Gold</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-6"
        >
          <Link to={createPageUrl('Battle')}>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-6 rounded-xl font-black text-xl shadow-lg shadow-purple-500/50 border-2 border-purple-400 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="relative flex items-center justify-center gap-3">
                <Swords className="w-6 h-6" />
                <span>START BATTLE</span>
                <Sparkles className="w-5 h-5" />
              </div>
            </motion.button>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link to={createPageUrl('Deck')} className="block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-black/40 backdrop-blur-xl border-2 border-cyan-500/30 text-cyan-300 py-4 rounded-xl font-bold hover:border-cyan-400 transition-all"
              >
                <div className="flex flex-col items-center gap-2">
                  <Zap className="w-6 h-6" />
                  <span>My Deck</span>
                </div>
              </motion.button>
            </Link>

            <Link to={createPageUrl('Collection')} className="block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-black/40 backdrop-blur-xl border-2 border-purple-500/30 text-purple-300 py-4 rounded-xl font-bold hover:border-purple-400 transition-all"
              >
                <div className="flex flex-col items-center gap-2">
                  <Crown className="w-6 h-6" />
                  <span>Collection</span>
                </div>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4"
        >
          <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Recent Activity
          </h3>
          {recentMatches.length > 0 ? (
            <div className="space-y-2">
              {recentMatches.slice(0, 3).map((match, idx) => (
                <div key={match.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">vs {match.opponent_name}</span>
                  <span className={`font-bold ${match.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                    {match.result === 'win' ? '✓ Win' : '✗ Loss'} 
                    {match.trophies_gained > 0 ? ` +${match.trophies_gained}` : ` ${match.trophies_gained}`}🏆
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-sm">
                <span className="text-gray-400">Win Rate</span>
                <span className="text-purple-300 font-bold">
                  {playerProfile?.wins > 0 || playerProfile?.losses > 0
                    ? `${Math.round((playerProfile.wins / (playerProfile.wins + playerProfile.losses)) * 100)}%`
                    : 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">No battles yet</span>
                <span className="text-purple-300 font-medium">Start playing!</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Next Rank</span>
                <span className="text-purple-300 font-medium">
                  {playerProfile?.rank === 'Stone' && 'Bronze (250 🏆)'}
                  {playerProfile?.rank === 'Bronze' && 'Silver (500 🏆)'}
                  {playerProfile?.rank !== 'Stone' && playerProfile?.rank !== 'Bronze' && 'Keep climbing!'}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Ranks Modal */}
      <AnimatePresence>
        {showRanksModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRanksModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border-2 border-purple-500 rounded-2xl p-6 max-w-md w-full backdrop-blur-xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                  RANK PROGRESSION
                </h2>
                <button
                  onClick={() => setShowRanksModal(false)}
                  className="w-8 h-8 rounded-full bg-black/40 border border-purple-500/30 flex items-center justify-center text-purple-300 hover:bg-black/60 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {rankProgression.map((rankInfo, idx) => {
                  const isUnlocked = (playerProfile?.trophies || 0) >= rankInfo.trophies;
                  const isCurrentRank = playerProfile?.rank === rankInfo.rank;

                  return (
                    <motion.div
                      key={rankInfo.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`relative bg-black/40 border-2 rounded-xl p-4 ${
                        isCurrentRank 
                          ? 'border-yellow-400 shadow-lg shadow-yellow-500/20' 
                          : isUnlocked
                          ? 'border-purple-500/30'
                          : 'border-gray-700/30 opacity-60'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${rankInfo.color} opacity-10 rounded-xl`} />
                      
                      <div className="relative flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rankInfo.color} flex items-center justify-center`}>
                            {isUnlocked ? (
                              <Crown className="w-6 h-6 text-white" />
                            ) : (
                              <Lock className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              {rankInfo.rank}
                              {isCurrentRank && (
                                <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">
                                  CURRENT
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-gray-400">{rankInfo.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-yellow-400 flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {rankInfo.trophies}
                          </p>
                        </div>
                      </div>

                      {rankInfo.cards.length > 0 && (
                        <div className="relative mt-3 pt-3 border-t border-purple-500/20">
                          <p className="text-xs text-purple-300 mb-2 font-bold">Unlocks:</p>
                          <div className="flex gap-2 flex-wrap">
                            {rankInfo.cards.map(cardId => (
                              <div
                                key={cardId}
                                className={`text-xs px-2 py-1 rounded ${
                                  isUnlocked 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                    : 'bg-gray-700/20 text-gray-400 border border-gray-600/30'
                                }`}
                              >
                                {cardId.replace(/_/g, ' ')}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
                <p className="text-sm text-purple-300 text-center">
                  <Trophy className="w-4 h-4 inline mr-1" />
                  Win battles to earn trophies and climb the ranks!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
