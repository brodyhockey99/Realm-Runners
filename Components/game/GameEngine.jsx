import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GAME_CONFIG = {
  width: 600,
  height: 800,
  manaMax: 10,
  manaRegenRate: 0.012,
  towerHealth: 3000,
  unitAttackRange: 80,
};

export const CARDS = {
  blade_runner: {
    id: 'blade_runner',
    name: 'Blade Runner',
    cost: 3,
    type: 'unit',
    health: 250,
    damage: 80,
    speed: 2.5,
    attackSpeed: 1.2,
    color: '#14b8a6',
    size: 20,
  },
  storm_mage: {
    id: 'storm_mage',
    name: 'Storm Mage',
    cost: 5,
    type: 'unit',
    health: 180,
    damage: 120,
    speed: 1.5,
    range: 150,
    attackSpeed: 1.8,
    color: '#6366f1',
    size: 18,
  },
  iron_colossus: {
    id: 'iron_colossus',
    name: 'Iron Colossus',
    cost: 7,
    type: 'unit',
    health: 1800,
    damage: 250,
    speed: 0.8,
    attackSpeed: 2.0,
    color: '#64748b',
    size: 32,
  },
  shadow_pack: {
    id: 'shadow_pack',
    name: 'Shadow Pack',
    cost: 2,
    type: 'unit',
    health: 120,
    damage: 50,
    speed: 3,
    attackSpeed: 1.0,
    color: '#a855f7',
    size: 16,
    count: 3,
  },
  meteor_rift: { id: 'meteor_rift', name: 'Meteor Rift', cost: 4, type: 'spell' },
  wind_shift: { id: 'wind_shift', name: 'Wind Shift', cost: 2, type: 'spell' },
};

export const HEROES = {
  aeris: { id: 'aeris', name: 'Aeris, Windcaller', sprite: '🌪️', ultimateCost: 100 },
  karn: { id: 'karn', name: 'Karn, Stone Titan', sprite: '🏔️', ultimateCost: 100 },
};

export const MODIFIERS = {
  giants_realm: {
    id: 'giants_realm',
    name: "Giant's Realm",
    description: 'All units 50% larger + more HP',
    effect: { sizeMultiplier: 1.5, healthMultiplier: 1.5 },
  },
  windstorm: {
    id: 'windstorm',
    name: 'Windstorm',
    description: 'Projectiles curve randomly',
    effect: { projectileCurve: true },
  },
  shadow_realm: {
    id: 'shadow_realm',
    name: 'Shadow Realm',
    description: 'Units invisible until attack',
    effect: { invisibility: true },
  },
};

// Enhanced drawing functions
function drawBladeRunner(ctx, unit, animTime) {
  const size = unit.size;
  const x = unit.x;
  const y = unit.y;
  
  // Attack animation - slash effect
  if (unit.isAttacking) {
    const slashAngle = Math.sin(unit.attackProgress * Math.PI * 2) * 0.8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(slashAngle);
    
    // Blade trail
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#14b8a6';
    ctx.beginPath();
    ctx.arc(size, -size * 0.5, size * 1.5, 0, Math.PI);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.8, size * 0.8, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Body (triangular warrior)
  const gradient = ctx.createRadialGradient(x, y - size * 0.5, 0, x, y, size);
  gradient.addColorStop(0, '#5eead4');
  gradient.addColorStop(1, unit.color);
  ctx.fillStyle = gradient;
  
  ctx.beginPath();
  ctx.moveTo(x, y - size * 1.2);
  ctx.lineTo(x + size * 0.9, y + size * 0.6);
  ctx.lineTo(x - size * 0.9, y + size * 0.6);
  ctx.closePath();
  ctx.fill();
  
  // Weapon
  ctx.fillStyle = '#14b8a6';
  ctx.shadowBlur = 5;
  ctx.shadowColor = '#14b8a6';
  ctx.fillRect(x + size * 0.6, y - size * 0.8, size * 0.3, size * 1.2);
  ctx.shadowBlur = 0;
}

function drawStormMage(ctx, unit, animTime) {
  const size = unit.size;
  const x = unit.x;
  const y = unit.y;
  const floatOffset = Math.sin(animTime * 3) * size * 0.3;
  
  // Casting particles
  if (unit.isAttacking) {
    for (let i = 0; i < 3; i++) {
      const angle = unit.attackProgress * Math.PI * 2 + i * (Math.PI * 2 / 3);
      const px = x + Math.cos(angle) * size * 1.5;
      const py = y + Math.sin(angle) * size * 1.5 + floatOffset;
      ctx.fillStyle = '#a5b4fc';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#6366f1';
      ctx.beginPath();
      ctx.arc(px, py, size * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + size, size * 0.7, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Body (floating orb design)
  const yPos = y + floatOffset;
  
  // Outer glow
  const outerGlow = ctx.createRadialGradient(x, yPos, 0, x, yPos, size * 1.5);
  outerGlow.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
  outerGlow.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(x, yPos, size * 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Main orb
  const gradient = ctx.createRadialGradient(x, yPos - size * 0.3, size * 0.3, x, yPos, size);
  gradient.addColorStop(0, '#c7d2fe');
  gradient.addColorStop(1, unit.color);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, yPos, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Energy core
  ctx.fillStyle = '#a5b4fc';
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#6366f1';
  ctx.beginPath();
  ctx.arc(x, yPos, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawIronColossus(ctx, unit, animTime) {
  const size = unit.size;
  const x = unit.x;
  let y = unit.y;
  
  // Jump attack animation
  if (unit.isAttacking) {
    const jumpHeight = Math.sin(unit.attackProgress * Math.PI) * size * 2;
    y -= jumpHeight;
    
    // Ground impact effect
    if (unit.attackProgress > 0.5 && unit.attackProgress < 0.6) {
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)';
      ctx.lineWidth = 4;
      const impactRadius = (unit.attackProgress - 0.5) * 10 * size;
      ctx.beginPath();
      ctx.arc(unit.x, unit.y + size, impactRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  
  // Shadow (larger for colossus)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(x, unit.y + size * 0.9, size * 1.2, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Main body (large tank)
  const gradient = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
  gradient.addColorStop(0, '#94a3b8');
  gradient.addColorStop(0.5, unit.color);
  gradient.addColorStop(1, '#334155');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - size, y - size * 1.2, size * 2, size * 2.2);
  
  // Armor plates
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(x - size * 0.8, y - size, size * 0.4, size * 0.8);
  ctx.fillRect(x + size * 0.4, y - size, size * 0.4, size * 0.8);
  ctx.fillRect(x - size * 0.5, y + size * 0.2, size, size * 0.5);
  
  // Head
  ctx.fillStyle = unit.color;
  ctx.fillRect(x - size * 0.6, y - size * 1.5, size * 1.2, size * 0.8);
  
  // Glowing eyes
  ctx.fillStyle = '#ef4444';
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#ef4444';
  ctx.fillRect(x - size * 0.4, y - size * 1.3, size * 0.25, size * 0.25);
  ctx.fillRect(x + size * 0.15, y - size * 1.3, size * 0.25, size * 0.25);
  ctx.shadowBlur = 0;
}

function drawShadowPack(ctx, unit, animTime) {
  const size = unit.size;
  const x = unit.x;
  const y = unit.y;
  const bounce = Math.abs(Math.sin(animTime * 5)) * size * 0.3;
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.8, size * 0.9, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  const yPos = y - bounce;
  
  // Body gradient
  const gradient = ctx.createRadialGradient(x, yPos - size * 0.3, 0, x, yPos, size);
  gradient.addColorStop(0, '#c084fc');
  gradient.addColorStop(1, unit.color);
  ctx.fillStyle = gradient;
  
  // Body
  ctx.beginPath();
  ctx.ellipse(x, yPos, size * 0.9, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.beginPath();
  ctx.arc(x, yPos - size * 0.6, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  // Ears
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, yPos - size * 1);
  ctx.lineTo(x - size * 0.15, yPos - size * 0.6);
  ctx.lineTo(x - size * 0.5, yPos - size * 0.5);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(x + size * 0.4, yPos - size * 1);
  ctx.lineTo(x + size * 0.15, yPos - size * 0.6);
  ctx.lineTo(x + size * 0.5, yPos - size * 0.5);
  ctx.closePath();
  ctx.fill();
  
  // Glowing eyes
  ctx.fillStyle = '#f0abfc';
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#f0abfc';
  ctx.beginPath();
  ctx.arc(x - size * 0.25, yPos - size * 0.6, size * 0.15, 0, Math.PI * 2);
  ctx.arc(x + size * 0.25, yPos - size * 0.6, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

export default function GameEngine({ playerDeck, playerHero, onGameEnd, modifier }) {
  const canvasRef = useRef(null);
  const gameStateRef = useRef({
    units: [],
    projectiles: [],
    towers: [
      { id: 'player', team: 'player', x: 300, y: 720, health: GAME_CONFIG.towerHealth, maxHealth: GAME_CONFIG.towerHealth, size: 60 },
      { id: 'enemy', team: 'enemy', x: 300, y: 80, health: GAME_CONFIG.towerHealth, maxHealth: GAME_CONFIG.towerHealth, size: 60 },
    ],
    nextUnitId: 0,
    animationFrame: null,
  });

  const [mana, setMana] = useState(5);
  const [heroUltCharge, setHeroUltCharge] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let lastTime = performance.now();
    let enemySpawnTimer = 0;

    const gameLoop = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setMana(prev => Math.min(GAME_CONFIG.manaMax, prev + GAME_CONFIG.manaRegenRate));

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.height);
      gradient.addColorStop(0, '#1e1b4b');
      gradient.addColorStop(0.5, '#312e81');
      gradient.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);

      // Grid
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < GAME_CONFIG.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GAME_CONFIG.width, i);
        ctx.stroke();
      }
      for (let i = 0; i < GAME_CONFIG.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GAME_CONFIG.height);
        ctx.stroke();
      }

      const state = gameStateRef.current;

      // Draw towers
      state.towers.forEach(tower => {
        const size = tower.size;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(tower.x, tower.y + size * 0.7, size * 0.8, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        const towerGradient = ctx.createRadialGradient(tower.x, tower.y - size * 0.3, 0, tower.x, tower.y, size);
        towerGradient.addColorStop(0, tower.team === 'player' ? '#34d399' : '#f87171');
        towerGradient.addColorStop(1, tower.team === 'player' ? '#059669' : '#dc2626');
        ctx.fillStyle = towerGradient;
        ctx.fillRect(tower.x - size / 2, tower.y - size / 2, size, size);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(tower.x - size / 2, tower.y - size / 2, size / 3, size);

        ctx.fillStyle = '#1f2937';
        ctx.fillRect(tower.x - size / 2, tower.y - size / 2 - 15, size, 8);
        
        ctx.fillStyle = tower.team === 'player' ? '#10b981' : '#ef4444';
        const healthPercent = Math.max(0, tower.health / tower.maxHealth);
        ctx.fillRect(tower.x - size / 2, tower.y - size / 2 - 15, size * healthPercent, 8);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.floor(tower.health), tower.x, tower.y - size / 2 - 20);
      });

      // Enemy AI
      if (!gameOver) {
        enemySpawnTimer += deltaTime;
        if (enemySpawnTimer > 2 && Math.random() < 0.3) {
          const unitCards = Object.values(CARDS).filter(c => c.type === 'unit');
          const randomCard = unitCards[Math.floor(Math.random() * unitCards.length)];
          spawnUnit(randomCard.id, Math.random() * (GAME_CONFIG.width - 100) + 50, 120, 'enemy');
          enemySpawnTimer = 0;
        }
      }

      // Update units
      state.units = state.units.filter(unit => unit.health > 0);

      state.units.forEach(unit => {
        let target = null;
        let targetDist = Infinity;

        const enemyUnits = state.units.filter(u => u.team !== unit.team);
        for (const enemy of enemyUnits) {
          const dx = enemy.x - unit.x;
          const dy = enemy.y - unit.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < targetDist) {
            targetDist = dist;
            target = enemy;
          }
        }

        const enemyTower = state.towers.find(t => t.team !== unit.team);
        if (!target || targetDist > (unit.range || 50) + 50) {
          target = enemyTower;
          const dx = enemyTower.x - unit.x;
          const dy = enemyTower.y - unit.y;
          targetDist = Math.sqrt(dx * dx + dy * dy);
        }

        if (!target) return;

        const attackRange = (unit.range || 50) + (target.size ? target.size / 2 : 20);

        if (targetDist <= attackRange) {
          unit.isAttacking = true;
          unit.attackTimer = (unit.attackTimer || 0) + deltaTime;
          unit.attackProgress = (unit.attackTimer % unit.attackSpeed) / unit.attackSpeed;
          
          if (unit.attackTimer >= unit.attackSpeed) {
            target.health -= unit.damage;
            unit.attackTimer = 0;
            
            if (target.id && (target.id === 'player' || target.id === 'enemy') && target.health <= 0) {
              setGameOver(true);
              setWinner(unit.team);
              if (onGameEnd) onGameEnd(unit.team === 'player' ? 'win' : 'loss');
            }

            if ((unit.range || 50) > 50) {
              state.projectiles.push({
                x: unit.x,
                y: unit.y,
                targetX: target.x,
                targetY: target.y,
                speed: 5,
                color: unit.color,
              });
            }
          }
          return;
        }

        unit.isAttacking = false;
        const dx = target.x - unit.x;
        const dy = target.y - unit.y;
        const angle = Math.atan2(dy, dx);
        unit.x += Math.cos(angle) * unit.speed;
        unit.y += Math.sin(angle) * unit.speed;

        unit.x = Math.max(20, Math.min(GAME_CONFIG.width - 20, unit.x));
        unit.y = Math.max(80, Math.min(GAME_CONFIG.height - 80, unit.y));
      });

      // Update projectiles
      state.projectiles = state.projectiles.filter(proj => {
        const dx = proj.targetX - proj.x;
        const dy = proj.targetY - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 5) return false;
        
        const angle = Math.atan2(dy, dx);
        proj.x += Math.cos(angle) * proj.speed;
        proj.y += Math.sin(angle) * proj.speed;
        return true;
      });

      // Draw projectiles
      state.projectiles.forEach(proj => {
        ctx.fillStyle = proj.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw units with detailed animations
      const animTime = currentTime / 1000;
      state.units.forEach(unit => {
        if (unit.cardId === 'blade_runner') {
          drawBladeRunner(ctx, unit, animTime);
        } else if (unit.cardId === 'storm_mage') {
          drawStormMage(ctx, unit, animTime);
        } else if (unit.cardId === 'iron_colossus') {
          drawIronColossus(ctx, unit, animTime);
        } else if (unit.cardId === 'shadow_pack') {
          drawShadowPack(ctx, unit, animTime);
        }

        // Team ring
        ctx.strokeStyle = unit.team === 'player' ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(unit.x, unit.y, unit.size + 3, 0, Math.PI * 2);
        ctx.stroke();

        // Health bar
        const barWidth = unit.size * 2.2;
        const barHeight = 5;
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(unit.x - barWidth / 2, unit.y - unit.size - 15, barWidth, barHeight);
        
        const healthPercent = Math.max(0, unit.health / unit.maxHealth);
        ctx.fillStyle = unit.team === 'player' ? '#10b981' : '#ef4444';
        ctx.fillRect(unit.x - barWidth / 2, unit.y - unit.size - 15, barWidth * healthPercent, barHeight);
      });

      if (!gameOver) {
        gameStateRef.current.animationFrame = requestAnimationFrame(gameLoop);
      }
    };

    gameStateRef.current.animationFrame = requestAnimationFrame(gameLoop);

    return () => {
      if (gameStateRef.current.animationFrame) {
        cancelAnimationFrame(gameStateRef.current.animationFrame);
      }
    };
  }, [gameOver, onGameEnd]);

  const spawnUnit = useCallback((cardId, x, y, team) => {
    const card = CARDS[cardId];
    if (!card || card.type !== 'unit') return;
    
    const count = card.count || 1;
    const applyModifier = modifier?.effect || {};
    
    for (let i = 0; i < count; i++) {
      const spreadX = count > 1 ? x + (i - count / 2) * 30 : x;
      
      gameStateRef.current.units.push({
        id: gameStateRef.current.nextUnitId++,
        cardId: card.id,
        team,
        x: spreadX,
        y,
        health: card.health * (applyModifier.healthMultiplier || 1),
        maxHealth: card.health * (applyModifier.healthMultiplier || 1),
        damage: card.damage,
        speed: card.speed,
        range: card.range || 50,
        attackSpeed: card.attackSpeed,
        attackTimer: 0,
        color: card.color,
        size: card.size * (applyModifier.sizeMultiplier || 1),
        isAttacking: false,
        attackProgress: 0,
      });
    }
  }, [modifier]);

  const handleCardPlay = useCallback((card) => {
    if (mana >= card.cost && !gameOver) {
      setMana(prev => prev - card.cost);
      
      if (card.type === 'unit') {
        const spawnX = Math.random() * (GAME_CONFIG.width - 100) + 50;
        const spawnY = GAME_CONFIG.height - 150;
        spawnUnit(card.id, spawnX, spawnY, 'player');
      } else if (card.id === 'meteor_rift') {
        const centerX = GAME_CONFIG.width / 2;
        const centerY = GAME_CONFIG.height / 3;
        gameStateRef.current.units.forEach(u => {
          if (u.team === 'enemy') {
            const dist = Math.sqrt(Math.pow(u.x - centerX, 2) + Math.pow(u.y - centerY, 2));
            if (dist < 100) u.health -= 300;
          }
        });
      } else if (card.id === 'wind_shift') {
        gameStateRef.current.units.forEach(u => {
          if (u.team === 'enemy') u.y -= 80;
        });
      }
      
      setSelectedCard(null);
    }
  }, [mana, gameOver, spawnUnit]);

  const handleHeroUlt = useCallback(() => {
    if (heroUltCharge < 100 || gameOver) return;
    
    gameStateRef.current.units.forEach(u => {
      if (u.team === 'enemy') {
        u.health -= 200;
        u.y -= 100;
      }
    });
    
    setHeroUltCharge(0);
  }, [heroUltCharge, gameOver]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black overflow-hidden">
      <div className="flex items-center justify-center h-full">
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.width}
          height={GAME_CONFIG.height}
          className="border-2 border-purple-500/30 rounded-xl shadow-2xl"
          style={{ maxWidth: '100%', maxHeight: '85vh' }}
        />
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64">
        <div className="bg-black/40 backdrop-blur-xl rounded-full p-2 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-1 px-2">
            <span className="text-cyan-300 text-xs font-bold">MANA</span>
            <span className="text-white text-sm font-bold">{Math.floor(mana)}/{GAME_CONFIG.manaMax}</span>
          </div>
          <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              animate={{ width: `${(mana / GAME_CONFIG.manaMax) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {modifier && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2">
          <div className="bg-purple-500/20 backdrop-blur-md border border-purple-400/30 rounded-lg px-4 py-2">
            <p className="text-purple-300 text-sm font-bold">{modifier.name}</p>
            <p className="text-purple-400 text-xs">{modifier.description}</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {playerDeck.map((cardId, index) => {
          const card = CARDS[cardId];
          if (!card) return null;
          
          const canAfford = mana >= card.cost;

          return (
            <motion.button
              key={index}
              whileHover={{ scale: canAfford ? 1.05 : 1, y: canAfford ? -5 : 0 }}
              whileTap={{ scale: canAfford ? 0.95 : 1 }}
              onClick={() => canAfford && handleCardPlay(card)}
              disabled={!canAfford}
              className={`relative w-16 h-20 rounded-lg border-2 backdrop-blur-md ${
                canAfford ? 'border-purple-500/50 bg-purple-900/40' : 'border-gray-700 bg-gray-900/40 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="absolute -top-2 -right-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-black">
                {card.cost}
              </div>
              <div className="flex flex-col items-center justify-center h-full p-1">
                <div className="w-8 h-8 rounded-full mb-1" style={{ backgroundColor: card.color }} />
                <span className="text-[8px] text-white font-bold text-center leading-tight">{card.name}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="absolute bottom-28 left-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleHeroUlt}
          disabled={heroUltCharge < 100}
          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl relative ${
            heroUltCharge >= 100 ? 'border-yellow-400 bg-gradient-to-br from-yellow-500 to-orange-500' : 'border-gray-700 bg-gray-900/60 opacity-70'
          }`}
        >
          {HEROES[playerHero]?.sprite || '⭐'}
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div style={{ width: `${heroUltCharge}%`, height: '100%', background: 'linear-gradient(90deg,#fbbf24,#fb923c)' }} />
          </div>
        </motion.button>
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 border-2 border-purple-500 rounded-2xl p-8 text-center max-w-sm"
            >
              <h2 className={`text-4xl font-bold mb-4 ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                {winner === 'player' ? '🏆 VICTORY!' : '💀 DEFEAT'}
              </h2>
              <p className="text-purple-300 mb-6">
                {winner === 'player' ? 'You destroyed the enemy tower!' : 'Your tower was destroyed!'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
