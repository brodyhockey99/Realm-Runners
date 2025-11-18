import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameEngine, { MODIFIERS } from '../components/game/GameEngine';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Battle() {
  const navigate = useNavigate();
  const [playerProfile, setPlayerProfile] = useState(null);
  const [modifier, setModifier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.Player.filter({ created_by: user.email });
        
        if (profiles.length > 0) {
          setPlayerProfile(profiles[0]);
          
          // Select random modifier
          const modifierKeys = Object.keys(MODIFIERS);
          const randomModifier = MODIFIERS[modifierKeys[Math.floor(Math.random() * modifierKeys.length)]];
          setModifier(randomModifier);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleGameEnd = async (result) => {
    if (!playerProfile) return;

    const trophyChange = result === 'win' ? 30 : -15;
    const newTrophies = Math.max(0, (playerProfile.trophies || 0) + trophyChange);

    try {
      // Update player stats
      await base44.entities.Player.update(playerProfile.id, {
        trophies: newTrophies,
        wins: result === 'win' ? (playerProfile.wins || 0) + 1 : playerProfile.wins,
        losses: result === 'loss' ? (playerProfile.losses || 0) + 1 : playerProfile.losses,
      });

      // Save match record
      await base44.entities.Match.create({
        player_id: playerProfile.id,
        result,
        opponent_name: 'AI Opponent',
        trophies_gained: trophyChange,
        modifier: modifier?.id || 'none',
        duration_seconds: 180,
        damage_dealt: 2500,
      });
    } catch (error) {
      console.error('Error saving match:', error);
    }
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
          <p className="text-purple-300 font-medium">Preparing Battle...</p>
        </div>
      </div>
    );
  }

  if (!playerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Profile not found</p>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameEngine
      playerDeck={playerProfile.deck || []}
      playerHero={playerProfile.hero_id}
      onGameEnd={handleGameEnd}
      modifier={modifier}
    />
  );
}
