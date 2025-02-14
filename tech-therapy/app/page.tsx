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
}) => (
  <div className="relative w-full max-w-md">
    <Button
      variant="ghost"
      className="absolute -top-16 left-0 text-white/70 hover:text-white"
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
        className={`text-2xl font-bold p-8 rounded-lg bg-gradient-to-br ${gradients[mode]} bg-opacity-10`}
      >
        {response.split('\n').map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              delay: i * 2,
              duration: 0.5 
            }}
            className="mb-4 last:mb-0"
          >
            {line.split('').map((char, j) => (
              <motion.span
                key={j}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  delay: i * 2 + (j * 0.03),
                  duration: 0.1 
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </div>
);

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
          Get Support
        </Button>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const [mode, setMode] = useState<TherapyMode | null>(null);
  const { complete, completion, isLoading, setCompletion } = useCompletion({
    api: '/api/therapy',
  });

  const handleModeSelect = (selectedMode: TherapyMode) => {
    setMode(selectedMode);
  };

  const handleTechSubmit = async (tech: string) => {
    if (!mode) return;
    await complete({ tech, mode });
  };

  const handleRestart = () => {
    setMode(null);
    setCompletion('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4">
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
