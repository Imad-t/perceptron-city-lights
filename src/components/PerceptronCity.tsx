import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Brain, Zap, RotateCcw, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import skylineDark from "@/assets/skyline-dark.png";
import skylineLight from "@/assets/skyline-lights.png";
import skylineFire from "@/assets/skyline-fire.png";

type EnergyType = "solar" | "wind" | "hydro";
type GameStatus = "intro" | "playing" | "won" | "lost";

interface PlacedItem {
  id: string;
  type: EnergyType;
}

const PerceptronCity = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>("intro");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [hasChecked, setHasChecked] = useState(false);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);

  const SOLAR_WEIGHT = 2;
  const WIND_WEIGHT = 6;
  const HYDRO_WEIGHT = 12;
  const THRESHOLD_MIN = 80;
  const THRESHOLD_MAX = 88;

  const [availableItems, setAvailableItems] = useState<PlacedItem[]>(() => {
    const items: PlacedItem[] = [];
    for (let i = 0; i < 5; i++) {
      items.push({ id: `solar-${i}`, type: "solar" });
      items.push({ id: `wind-${i}`, type: "wind" });
      items.push({ id: `hydro-${i}`, type: "hydro" });
    }
    return items;
  });

  const totalEnergy = placedItems.reduce((sum, item) => {
    if (item.type === "solar") return sum + SOLAR_WEIGHT;
    if (item.type === "wind") return sum + WIND_WEIGHT;
    if (item.type === "hydro") return sum + HYDRO_WEIGHT;
    return sum;
  }, 0);

  // check if current energy is in range
  const isInRange = hasChecked && totalEnergy >= THRESHOLD_MIN && totalEnergy <= THRESHOLD_MAX;

  // Determine background image based on game status and energy level
  const getBackgroundImage = () => {
    if (gameStatus === "playing" || gameStatus === "intro") {
      return skylineDark;
    }
    if (gameStatus === "won") {
      return skylineLight;
    }
    if (gameStatus === "lost") {
      return totalEnergy > THRESHOLD_MAX ? skylineFire : skylineDark;
    }
    return skylineDark;
  };

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
    
    const item = availableItems.find(i => i.id === itemId);
    if (item) {
      setAvailableItems(availableItems.filter(i => i.id !== itemId));
      setPlacedItems([...placedItems, item]);
      setHasChecked(false); 
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
      setHasChecked(false); 
    }
  };

  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 33, // Restrict to top third (0-33%)
    delay: Math.random() * 2,
  }));

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* background stars in top third */}
      <div className="absolute top-0 h-[800px] w-full pointer-events-none">
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

      {/* clouds */}
      <div className="absolute top-20 left-0 w-64 h-32 bg-[#102131]/90 rounded-full blur-xl animate-slide-cloud" 
           style={{ animationDuration: '30s', animationDelay: '0s' }} />
      <div className="absolute top-72 left-0 w-40 h-16 bg-[#102131]/90 rounded-full blur-xl animate-slide-cloud" 
           style={{ animationDuration: '30s', animationDelay: '10s' }} />
      <div className="absolute top-96 left-1/2 w-96 h-32 bg-[#102131]/90 rounded-full blur-2xl animate-slide-cloud" 
           style={{ animationDuration: '30s', animationDelay: '5s' }} />


      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-2 flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            Perceptron City
            <Zap className="w-10 h-10 md:w-12 md:h-12 text-accent" />
          </h1>
          <p className="md:text-lg text-muted-foreground font-semibold">
            Drag and drop energy sources to power the city!
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {gameStatus === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-3xl space-y-6"
            >
              <Card className="p-6 bg-gray-800/70 border-gray-900 backdrop-blur">
                <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  How to Play
                </h2>
                <div className="space-y-4">
                  <p>
                    Welcome to <strong>Perceptron City</strong>! 🌆 Your mission is to power the city
                    by dragging and dropping energy sources into the power grid. If the energy level is too low,
                    the city will stay dark, and if it's too high, there will be a power overload and the city might catch fire! 🔥
                  </p>
                  <div className="space-y-2">
                    <p className="font-bold">Energy Sources:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>☀️ <strong>Solar Panel</strong> - Provides {SOLAR_WEIGHT} units each</li>
                      <li>𖣘 <strong>Wind Turbine</strong> - Provides {WIND_WEIGHT} units each</li>
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

              <Card className="p-6 bg-gray-800/70 border-gray-900 backdrop-blur">
                <h3 className="text-xl font-bold mb-3 text-primary flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  What's a Perceptron?
                </h3>
                <p className="leading-relaxed">
                  A <strong>perceptron</strong> is like a smart decision-maker! 🤖 It takes in information 
                  (like energy sources), multiplies each by how important it is (the weights), 
                  adds them all up, and decides: should we turn ON or stay OFF?
                </p>
                <p className="leading-relaxed mt-3">
                  In this game, each energy source has a different <strong>weight</strong> (importance). 
                  The perceptron adds them up and checks if the total is in the perfect range to power the city! 🌟
                </p>
              </Card>

              <div className="flex justify-center">
                <Button
                  onClick={handleStartGame}
                  className="text-xl p-4 h-auto"
                >
                  Start Game
                  <PlayCircle className="w-12 h-12" />
                </Button>
              </div>
            </motion.div>
          )}

          {gameStatus === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl space-y-6"
            >
              <Card className="p-4 w-fit mx-auto bg-gray-800/70 border-gray-900 backdrop-blur text-center">
                <div className="text-xl font-bold">
                  Attempts Left: <span className="text-primary">{attemptsLeft}</span> / 5
                </div>
                <div className="mt-2">
                  Total Energy: <span className={`font-bold ${isInRange ? 'text-success' : 'text-muted-foreground'}`}>
                    {totalEnergy}
                  </span> units
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4 bg-gray-800/70 border-gray-900 backdrop-blur">
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
                        <div className="text-4xl bg-primary/10 border-2 border-primary/30 rounded-lg p-3 hover:scale-105 hover:bg-primary/20 hover:border-primary/60 transition-all">
                          {item.type === "solar" && "☀️"}
                          {item.type === "wind" && "𖣘"}
                          {item.type === "hydro" && "💧"}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 bg-gray-800/70 border-gray-900 backdrop-blur">
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
                            <div className="text-4xl bg-background/80 rounded-lg p-3 cursor-pointer hover:bg-background transition-colors"
                                 onClick={() => handleRemoveItem(item.id)}>
                              {item.type === "solar" && "☀️"}
                              {item.type === "wind" && "𖣘"}
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
                  onClick={handleCheckEnergy}
                  disabled={placedItems.length === 0}
                  className="text-xl px-6 py-4 h-auto"
                >
                  Check Energy Level
                </Button>
              </div>
            </motion.div>
          )}

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
                <div className="text-7xl mb-6">🎉</div>
                <h2 className="text-5xl font-extrabold text-success mb-4">You Won!</h2>
                <p className="text-2xl text-muted-foreground">
                  Perfect! You powered the city! 🌆✨
                </p>
              </motion.div>

              <Card className="p-8 bg-gray-800/70 border-gray-900 backdrop-blur">
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
                  className="text-xl px-6 py-4 h-auto"
                >
                  <RotateCcw className="w-6 h-6 mr-2" />
                  Play Again
                </Button>
              </div>
            </motion.div>
          )}

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
                <div className="text-7xl mb-6">😢</div>
                <h2 className="text-5xl font-extrabold text-destructive mb-4">Game Over!</h2>
                <p className="text-2xl text-muted-foreground">
                  You ran out of attempts! 
                </p>
              </motion.div>

              <Card className="p-8 bg-gray-800/70 border-gray-900 backdrop-blur">
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
                  className="text-xl px-6 py-4 h-auto"
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