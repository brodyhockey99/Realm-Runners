import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Zap, Heart, Swords as SwordsIcon, Target } from 'lucide-react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { CARDS } from '../components/game/GameEngine';

export default function Deck() {
  const [playerProfile, setPlayerProfile] = useState(null);
  const [currentDeck, setCurrentDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.Player.filter({ created_by: user.email });
        
        if (profiles.length > 0) {
          setPlayerProfile(profiles[0]);
          setCurrentDeck(profiles[0].deck || []);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSaveDeck = async () => {
    if (!playerProfile || currentDeck.length !== 8) return;

    setSaving(true);
    try {
      await base44.entities.Player.update(playerProfile.id, {
        deck: currentDeck,
      });
      alert('Deck saved successfully!');
    } catch (error) {
      console.error('Error saving deck:', error);
      alert('Failed to save deck');
    } finally {
      setSaving(false);
    }
  };

  const addCardToDeck = (cardId) => {
    if (currentDeck.length < 8) {
      setCurrentDeck([...currentDeck, cardId]);
    }
  };

  const removeCardFromDeck = (index) => {
    setCurrentDeck(currentDeck.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-purple-300 font-medium">Loading Deck...</p>
        </div>
      </div>
    );
  }

  const unlockedCards = playerProfile?.unlocked_cards || Object.keys(CARDS);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black">
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
            DECK BUILDER
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveDeck}
            disabled={currentDeck.length !== 8 || saving}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${
              currentDeck.length === 8 && !saving
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </motion.button>
        </div>

        {/* Current Deck */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-purple-300">Your Deck</h2>
            <span className={`text-sm font-bold ${currentDeck.length === 8 ? 'text-green-400' : 'text-yellow-400'}`}>
              {currentDeck.length}/8
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[...Array(8)].map((_, index) => {
              const cardId = currentDeck[index];
              const card = cardId ? CARDS[cardId] : null;

              return (
                <motion.div
                  key={index}
                  whileHover={card ? { scale: 1.05 } : {}}
                  whileTap={card ? { scale: 0.95 } : {}}
                  onClick={() => card && removeCardFromDeck(index)}
                  className={`relative aspect-[3/4] rounded-lg border-2 ${
                    card
                      ? 'border-purple-500 bg-purple-900/40 cursor-pointer'
                      : 'border-dashed border-gray-700 bg-gray-900/20'
                  } backdrop-blur-md flex items-center justify-center`}
                >
                  {card ? (
                    <>
                      <div className="absolute -top-2 -right-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                        {card.cost}
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-1">{card.sprite}</div>
                        <div className="text-[8px] text-white font-bold px-1 leading-tight">
                          {card.name}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-600 text-2xl">+</div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {currentDeck.length < 8 && (
            <p className="text-xs text-yellow-400 text-center">
              ⚠️ Add {8 - currentDeck.length} more card{8 - currentDeck.length > 1 ? 's' : ''} to complete your deck
            </p>
          )}
        </div>

        {/* Available Cards */}
        <div>
          <h2 className="text-lg font-bold text-purple-300 mb-3">Available Cards</h2>
          <div className="grid grid-cols-3 gap-3">
            {unlockedCards.map((cardId) => {
              const card = CARDS[cardId];
              if (!card) return null;

              const canAdd = currentDeck.length < 8;

              return (
                <motion.div
                  key={cardId}
                  whileHover={canAdd ? { scale: 1.05, y: -5 } : {}}
                  whileTap={canAdd ? { scale: 0.95 } : {}}
                  onClick={() => canAdd && addCardToDeck(cardId)}
                  className={`relative aspect-[3/4] rounded-lg border-2 border-purple-500/50 bg-purple-900/40 backdrop-blur-md ${
                    canAdd ? 'cursor-pointer hover:border-purple-400' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="absolute -top-2 -right-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-black">
                    {card.cost}
                  </div>
                  
                  <div className="p-2 h-full flex flex-col items-center justify-center">
                    <div className="text-4xl mb-2">{card.sprite}</div>
                    <div className="text-[9px] text-white font-bold text-center leading-tight mb-2">
                      {card.name}
                    </div>
                    
                    <div className="space-y-1 w-full">
                      {card.type === 'unit' && (
                        <>
                          <div className="flex items-center justify-center gap-1 text-[8px]">
                            <Heart className="w-2 h-2 text-red-400" />
                            <span className="text-gray-300">{card.health}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-[8px]">
                            <SwordsIcon className="w-2 h-2 text-orange-400" />
                            <span className="text-gray-300">{card.damage}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-[8px]">
                            <Zap className="w-2 h-2 text-yellow-400" />
                            <span className="text-gray-300">{card.speed}</span>
                          </div>
                        </>
                      )}
                      {card.type === 'spell' && (
                        <div className="flex items-center justify-center gap-1 text-[8px]">
                          <Target className="w-2 h-2 text-cyan-400" />
                          <span className="text-gray-300">Spell</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
