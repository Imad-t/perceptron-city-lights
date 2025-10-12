import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Brain, Zap, RotateCcw, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EnergyType = "solar" | "wind" | "hydro";
type GameStatus = "intro" | "playing" | "won" | "lost";

interface PlacedItem {
  id: string;
  type: EnergyType;
}

/**
 * PerceptronCity - Drag-and-drop game teaching kids about perceptrons
 */
const PerceptronCity = () => {
  // Game state
  const [gameStatus, setGameStatus] = useState<GameStatus>("intro");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [hasChecked, setHasChecked] = useState(false);
  
  // Weights
  const SOLAR_WEIGHT = 2;
  const WIND_WEIGHT = 6;
  const HYDRO_WEIGHT = 12;
  const THRESHOLD_MIN = 80;
  const THRESHOLD_MAX = 88;

  // Available items (individual items, not counts)
  const [availableItems, setAvailableItems] = useState<PlacedItem[]>(() => {
    const items: PlacedItem[] = [];
    for (let i = 0; i < 5; i++) {
      items.push({ id: `solar-${i}`, type: "solar" });
      items.push({ id: `wind-${i}`, type: "wind" });
      items.push({ id: `hydro-${i}`, type: "hydro" });
    }
    return items;
  });

  // Placed items in the power grid
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);

  // UI toggles
  const [soundOn, setSoundOn] = useState(false);

  // Calculate total energy
  const totalEnergy = placedItems.reduce((sum, item) => {
    if (item.type === "solar") return sum + SOLAR_WEIGHT;
    if (item.type === "wind") return sum + WIND_WEIGHT;
    if (item.type === "hydro") return sum + HYDRO_WEIGHT;
    return sum;
  }, 0);

  // Check if current energy is in range (only show if checked)
  const isInRange = hasChecked && totalEnergy >= THRESHOLD_MIN && totalEnergy <= THRESHOLD_MAX;

  const handleStartGame = () => {
    setGameStatus("playing");
    setHasChecked(false);
  };

  const handleCheckEnergy = () => {
    setHasChecked(true);
    const currentIsInRange = totalEnergy >= THRESHOLD_MIN && totalEnergy <= THRESHOLD_MAX;
    
    if (currentIsInRange) {
      setGameStatus("won");
    } else {
      const newAttempts = attemptsLeft - 1;
      setAttemptsLeft(newAttempts);
      if (newAttempts === 0) {
        setGameStatus("lost");
      }
    }
  };

  const handleReplay = () => {
    setGameStatus("intro");
    setAttemptsLeft(5);
    setPlacedItems([]);
    setHasChecked(false);
    // Reset available items
    const items: PlacedItem[] = [];
    for (let i = 0; i < 5; i++) {
      items.push({ id: `solar-${i}`, type: "solar" });
      items.push({ id: `wind-${i}`, type: "wind" });
      items.push({ id: `hydro-${i}`, type: "hydro" });
    }
    setAvailableItems(items);
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("itemId", itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("itemId");
    
    // Find item in available items
    const item = availableItems.find(i => i.id === itemId);
    if (item) {
      setAvailableItems(availableItems.filter(i => i.id !== itemId));
      setPlacedItems([...placedItems, item]);
      setHasChecked(false); // Reset check state when placing new items
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveItem = (id: string) => {
    const item = placedItems.find(i => i.id === id);
    if (item) {
      setPlacedItems(placedItems.filter(i => i.id !== id));
      setAvailableItems([...availableItems, item]);
      setHasChecked(false); // Reset check state when removing items
    }
  };

  // Background stars for decoration
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 bg-foreground/50 rounded-full animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Floating clouds */}
      <div className="absolute top-20 left-0 w-32 h-16 bg-muted/30 rounded-full blur-xl animate-slide-cloud" 
           style={{ animationDuration: '40s', animationDelay: '0s' }} />
      <div className="absolute top-40 left-0 w-24 h-12 bg-muted/20 rounded-full blur-lg animate-slide-cloud" 
           style={{ animationDuration: '50s', animationDelay: '10s' }} />

      {/* Controls in top right */}
      <div className="absolute top-4 right-4 flex gap-3 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSoundOn(!soundOn)}
          className="rounded-full bg-card hover:bg-card/80"
        >
          {soundOn ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-8">
        
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-2 flex items-center justify-center gap-3">
            <Brain className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            Perceptron City
            <Zap className="w-12 h-12 md:w-16 md:h-16 text-accent" />
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-semibold">
            Drag and drop energy sources to power the city! ⚡
          </p>
        </motion.div>

        {/* INTRO SCREEN */}
        <AnimatePresence mode="wait">
          {gameStatus === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-3xl space-y-6"
            >
              <Card className="p-8 bg-card/90 backdrop-blur">
                <h2 className="text-3xl font-bold mb-4 text-primary flex items-center gap-2">
                  <Brain className="w-8 h-8" />
                  How to Play
                </h2>
                <div className="space-y-4 text-lg">
                  <p>
                    Welcome to <strong>Perceptron City</strong>! 🌆 Your mission is to power the city
                    by dragging and dropping energy sources into the power grid.
                  </p>
                  <div className="space-y-2">
                    <p className="font-bold">Energy Sources:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>☀️ <strong>Solar Panel</strong> - Provides {SOLAR_WEIGHT} units each</li>
                      <li>🌬️ <strong>Wind Turbine</strong> - Provides {WIND_WEIGHT} units each</li>
                      <li>💧 <strong>Hydro Dam</strong> - Provides {HYDRO_WEIGHT} units each</li>
                    </ul>
                  </div>
                  <p className="font-bold text-accent">
                    Goal: Find the perfect energy range to power the city!
                  </p>
                  <p>
                    You have <strong className="text-primary">5 attempts</strong> to get it right. 
                    You get 5 of each energy source to use. Good luck! 🎯
                  </p>
                </div>
              </Card>

              <Card className="p-8 bg-card/90 backdrop-blur">
                <h3 className="text-2xl font-bold mb-3 text-primary flex items-center gap-2">
                  <Brain className="w-7 h-7" />
                  What's a Perceptron?
                </h3>
                <p className="text-base md:text-lg leading-relaxed">
                  A <strong>perceptron</strong> is like a smart decision-maker! 🤖 It takes in information 
                  (like energy sources), multiplies each by how important it is (the weights), 
                  adds them all up, and decides: should we turn ON or stay OFF?
                </p>
                <p className="text-base md:text-lg leading-relaxed mt-3">
                  In this game, each energy source has a different <strong>weight</strong> (importance). 
                  The perceptron adds them up and checks if the total is in the perfect range to power the city! 🌟
                </p>
              </Card>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleStartGame}
                  className="text-xl px-8 py-6 h-auto"
                >
                  <PlayCircle className="w-6 h-6 mr-2" />
                  Start Game
                </Button>
              </div>
            </motion.div>
          )}

          {/* PLAYING SCREEN */}
          {gameStatus === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl space-y-6"
            >
              {/* Attempts Counter */}
              <Card className="p-4 bg-card/90 backdrop-blur text-center">
                <div className="text-2xl font-bold">
                  Attempts Left: <span className="text-primary">{attemptsLeft}</span> / 5
                </div>
                <div className="text-lg mt-2">
                  Total Energy: <span className={`font-bold ${isInRange ? 'text-success' : 'text-muted-foreground'}`}>
                    {totalEnergy}
                  </span> units
                  <span className="text-sm ml-2 text-muted-foreground">
                    (Target: {THRESHOLD_MIN}-{THRESHOLD_MAX})
                  </span>
                </div>
              </Card>

              {/* City Visualization */}
              <motion.div
                className="relative flex items-center justify-center mb-6"
                animate={{
                  scale: isInRange ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-9xl relative">
                  {isInRange ? (
                    <motion.span
                      className="animate-glow"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    >
                      🌆
                    </motion.span>
                  ) : (
                    "🌃"
                  )}
                </div>

                {/* Sparkle effects when in range */}
                <AnimatePresence>
                  {isInRange && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-4xl"
                          initial={{ scale: 0, x: 0, y: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            x: [0, (Math.random() - 0.5) * 100],
                            y: [0, (Math.random() - 0.5) * 100],
                          }}
                          exit={{ scale: 0 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        >
                          ✨
                        </motion.div>
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Available Energy Sources */}
                <Card className="p-6 bg-card/90 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4 text-center">Available Energy Sources</h3>
                  <div className="flex flex-wrap gap-3 justify-center min-h-[300px]">
                    {availableItems.map((item) => (
                      <motion.div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e as any, item.id)}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <div className="text-5xl bg-primary/10 border-2 border-primary/30 rounded-lg p-3 hover:scale-105 hover:bg-primary/20 hover:border-primary/60 transition-all">
                          {item.type === "solar" && "☀️"}
                          {item.type === "wind" && "🌬️"}
                          {item.type === "hydro" && "💧"}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Power Grid Drop Zone */}
                <Card className="p-6 bg-card/90 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4 text-center">Power Grid</h3>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="min-h-[300px] border-4 border-dashed border-primary/30 rounded-lg p-4 bg-muted/20 hover:border-primary/60 transition-colors"
                  >
                    {placedItems.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                        <p>Drag energy sources here</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {placedItems.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="relative"
                          >
                            <div className="text-5xl bg-background/80 rounded-lg p-3 cursor-pointer hover:bg-background transition-colors"
                                 onClick={() => handleRemoveItem(item.id)}>
                              {item.type === "solar" && "☀️"}
                              {item.type === "wind" && "🌬️"}
                              {item.type === "hydro" && "💧"}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleCheckEnergy}
                  disabled={placedItems.length === 0}
                  className="text-xl px-8 py-6 h-auto"
                >
                  Check Energy Level
                </Button>
              </div>
            </motion.div>
          )}

          {/* WIN SCREEN */}
          {gameStatus === "won" && (
            <motion.div
              key="won"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full max-w-3xl space-y-6"
            >
              <motion.div
                className="text-center"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                <div className="text-9xl mb-6">🎉</div>
                <h2 className="text-5xl font-extrabold text-success mb-4">You Won!</h2>
                <p className="text-2xl text-muted-foreground">
                  Perfect! You powered the city! 🌆✨
                </p>
              </motion.div>

              <Card className="p-8 bg-card/90 backdrop-blur">
                <div className="text-center space-y-4">
                  <p className="text-xl">
                    You successfully created <span className="font-bold text-accent">{totalEnergy} units</span> of energy!
                  </p>
                  <p className="text-lg text-muted-foreground">
                    The perfect range was <span className="font-bold">{THRESHOLD_MIN}-{THRESHOLD_MAX} units</span>
                  </p>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="font-bold text-lg mb-2">🧠 Perceptron Success!</p>
                    <p className="text-sm">
                      You found the right combination of inputs × weights that activated the perceptron!
                      The city lights up when the total energy falls within the threshold range.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleReplay}
                  className="text-xl px-8 py-6 h-auto"
                >
                  <RotateCcw className="w-6 h-6 mr-2" />
                  Play Again
                </Button>
              </div>
            </motion.div>
          )}

          {/* LOSE SCREEN */}
          {gameStatus === "lost" && (
            <motion.div
              key="lost"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full max-w-3xl space-y-6"
            >
              <motion.div
                className="text-center"
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                <div className="text-9xl mb-6">😢</div>
                <h2 className="text-5xl font-extrabold text-destructive mb-4">Game Over!</h2>
                <p className="text-2xl text-muted-foreground">
                  You ran out of attempts! 
                </p>
              </motion.div>

              <Card className="p-8 bg-card/90 backdrop-blur">
                <div className="text-center space-y-4">
                  <p className="text-xl">
                    Your final energy was <span className="font-bold text-muted-foreground">{totalEnergy} units</span>
                  </p>
                  <p className="text-lg text-accent font-bold">
                    The target range was {THRESHOLD_MIN}-{THRESHOLD_MAX} units
                  </p>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="font-bold text-lg mb-2">💡 Hint for next time:</p>
                    <p className="text-sm">
                      Remember: Solar = {SOLAR_WEIGHT} units, Wind = {WIND_WEIGHT} units, Hydro = {HYDRO_WEIGHT} units.
                      Try different combinations to reach {THRESHOLD_MIN}-{THRESHOLD_MAX}! 
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleReplay}
                  className="text-xl px-8 py-6 h-auto"
                >
                  <RotateCcw className="w-6 h-6 mr-2" />
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};


export default PerceptronCity;
