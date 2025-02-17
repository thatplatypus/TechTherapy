"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";


type TherapyMode = "affirmations" | "encouragement" | "roast";

interface ModeCardProps {
  mode: TherapyMode;
  title: string;
  description: string;
  icon: string;
  color: string;
  onClick: (mode: TherapyMode) => void;
}

const ModeCard = ({ mode, title, description, icon, color, onClick }: ModeCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Card
      className={`w-72 h-48 p-6 cursor-pointer flex flex-col items-center justify-center gap-4 ${color}`}
      onClick={() => onClick(mode)}
    >
      <div className="text-4xl">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-center opacity-80">{description}</p>
    </Card>
  </motion.div>
);

const gradients = {
  affirmations: "from-blue-600 to-blue-400",
  encouragement: "from-purple-600 to-purple-400",
  roast: "from-red-600 to-red-400",
};

const ResponseView = ({ mode, response, onRestart }: { 
  mode: TherapyMode; 
  response: string; 
  onRestart: () => void 
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const lines = response.split('\n').filter(line => line.trim());

  const handleLineComplete = () => {
    if (currentLineIndex < lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentLineIndex(index);
  };

  const handleSwipe = (direction: number) => {
    const newIndex = currentLineIndex + direction;
    if (newIndex >= 0 && newIndex < lines.length) {
      setCurrentLineIndex(newIndex);
    }
  };

  return (
    <div className="relative w-full max-w-2xl px-4">
      <Button
        variant="ghost"
        className="fixed top-8 left-8 text-white/70 hover:text-white z-10"
        onClick={onRestart}
      >
        ← Start Over
      </Button>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full text-center"
      >
        <motion.div
          className={`text-xl md:text-2xl font-bold p-8 rounded-lg bg-gradient-to-br ${gradients[mode]} bg-opacity-10 h-[200px] flex flex-col items-center justify-center`}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 50) {
              handleSwipe(info.offset.x > 0 ? -1 : 1);
            }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLineIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mb-6"
            >
              {lines[currentLineIndex].split('').map((char, j) => (
                <motion.span
                  key={j}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    delay: j * 0.03,
                    duration: 0.1 
                  }}
                  onAnimationComplete={() => {
                    if (j === lines[currentLineIndex].length - 1) {
                      // Wait a bit before showing next line
                      setTimeout(handleLineComplete, 1000);
                    }
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
        {/* Interactive progress dots */}
        <div className="flex justify-center gap-2 mt-4">
          {lines.map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 cursor-pointer hover:scale-150 ${
                i === currentLineIndex ? 
                  `bg-${mode === 'affirmations' ? 'blue' : mode === 'encouragement' ? 'purple' : 'red'}-400` : 
                  'bg-white/20'
              }`}
              onClick={() => handleDotClick(i)}
              whileHover={{ scale: 1.5 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const buttonText = {
  affirmations: "Get Support",
  encouragement: "Get Strength",
  roast: "Roast!"
};

const TechInput = ({ mode, onSubmit }: { mode: TherapyMode; onSubmit: (tech: string) => void }) => {
  const [tech, setTech] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">What's frustrating you?</h2>
      <div className="space-y-4">
        <Input 
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          placeholder="e.g. Kubernetes, Docker, JavaScript..." 
        />
        <Button 
          onClick={() => onSubmit(tech)}
          className={`w-full bg-gradient-to-r ${gradients[mode]} hover:opacity-90 transition-opacity`}
        >
          {buttonText[mode]}
        </Button>
      </div>
    </motion.div>
  );
};

const AnimatedFrame = ({ mode, isActive }: { mode: TherapyMode | null; isActive: boolean }) => {
  const borderColors = {
    null: "rgba(255, 255, 255, 0.1)",
    affirmations: "rgba(59, 130, 246, 0.5)",
    encouragement: "rgba(147, 51, 234, 0.5)",
    roast: "rgba(239, 68, 68, 0.5)"
  };

  const intensity = isActive ? 1 : 0.3;
  
  // Different animation patterns for each mode
  const getAnimationProps = () => {
    if (!mode) return {
      scale: [1, 1.02, 1],
      opacity: [intensity, intensity * 0.5, intensity],
      duration: 2
    };

    switch (mode) {
      case 'affirmations':
        return {
          scale: [1, 1.03, 1],
          opacity: [intensity * 0.7, intensity, intensity * 0.7],
          duration: 4,
          ease: [0.4, 0.0, 0.2, 1] // Smooth breathing curve
        };
      case 'encouragement':
        return {
          scale: [1, 1.02, 1],
          opacity: [intensity * 0.8, intensity, intensity * 0.8],
          duration: 2,
          ease: "easeInOut"
        };
      case 'roast':
        return {
          scale: [1, 1.015, 1, 1.02, 1],
          opacity: [intensity, intensity * 0.7, intensity * 0.9, intensity * 0.7, intensity],
          duration: 1.5,
          ease: "backOut"
        };
    }
  };

  const animation = getAnimationProps();

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute inset-4 border-[2px] rounded-2xl"
        style={{
          borderColor: borderColors[mode ?? 'null'],
          boxShadow: `0 0 20px ${borderColors[mode ?? 'null']}`,
        }}
        animate={{
          scale: animation.scale,
          opacity: animation.opacity,
        }}
        transition={{
          duration: animation.duration,
          repeat: Infinity,
          ease: animation.ease || "easeInOut",
        }}
      />
      {mode && isActive && (
        <motion.div
          className="absolute inset-0 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${borderColors[mode]} 0%, transparent 70%)`
          }}
          animate={{
            opacity: mode === 'roast' 
              ? [0.1, 0.3, 0.1, 0.25, 0.1] 
              : [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: animation.duration,
            repeat: Infinity,
            ease: animation.ease || "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};

export default function Home() {
  const [mode, setMode] = useState<TherapyMode | null>(null);
  const { complete, completion, setCompletion } = useCompletion({
    api: '/api/therapy',
  });

  const handleModeSelect = (selectedMode: TherapyMode) => {
    setMode(selectedMode);
  };

  const handleTechSubmit = async (tech: string) => {
    if (!mode) return;
    await complete(JSON.stringify({ tech, mode }));
  };

  const handleRestart = () => {
    setMode(null);
    setCompletion('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
      <AnimatedFrame 
        mode={mode} 
        isActive={!!completion} 
      />
      <main className="container mx-auto min-h-screen flex flex-col items-center justify-center py-20 px-4 relative">
        <AnimatePresence mode="wait">
          {!mode ? (
            <motion.div
              key="mode-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold mb-8 text-center"
              >
                How can we help you today?
              </motion.h1>
              
              <div className="flex flex-col md:flex-row gap-6">
                <ModeCard
                  mode="affirmations"
                  title="Affirmations"
                  description="Gentle validation when tech is bringing you down"
                  icon="🌊"
                  color="bg-blue-500/10 hover:bg-blue-500/20"
                  onClick={handleModeSelect}
                />
                
                <ModeCard
                  mode="encouragement"
                  title="Encouragement"
                  description="A motivational boost to keep you going"
                  icon="💪"
                  color="bg-purple-500/10 hover:bg-purple-500/20"
                  onClick={handleModeSelect}
                />
                
                <ModeCard
                  mode="roast"
                  title="Roast"
                  description="Sometimes you just need to laugh about it"
                  icon="🔥"
                  color="bg-red-500/10 hover:bg-red-500/20"
                  onClick={handleModeSelect}
                />
              </div>
            </motion.div>
          ) : !completion ? (
            <TechInput key="tech-input" mode={mode} onSubmit={handleTechSubmit} />
          ) : (
            <ResponseView 
              key="response" 
              mode={mode} 
              response={completion} 
              onRestart={handleRestart}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
