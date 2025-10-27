import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Brain, Zap, RotateCcw, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
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
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [hasChecked, setHasChecked] = useState(false);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [weather, setWeather] = useState({
    sun: 0,
    wind: 0,
    rain: 0,
  });

  const NUM_ITEMS_PER_TYPE = 5;
  const THRESHOLD_MIN = 100;
  const THRESHOLD_MAX = 150;

  const [availableItems, setAvailableItems] = useState<PlacedItem[]>(() => {
    const items: PlacedItem[] = [];
    for (let i = 0; i < NUM_ITEMS_PER_TYPE; i++) {
      items.push({ id: `solar-${i}`, type: "solar" });
      items.push({ id: `wind-${i}`, type: "wind" });
      items.push({ id: `hydro-${i}`, type: "hydro" });
    }
    return items;
  });

  // Calculate dynamic weights per item based on weather intensities
  const getDynamicWeights = () => {
    const solarWeight = (weather.sun * 100) / NUM_ITEMS_PER_TYPE;
    const windWeight = (weather.wind * 100) / NUM_ITEMS_PER_TYPE;
    const hydroWeight = (weather.rain * 100) / NUM_ITEMS_PER_TYPE;
    return {
      solar: Number(solarWeight.toFixed(2)),
      wind: Number(windWeight.toFixed(2)),
      hydro: Number(hydroWeight.toFixed(2)),
    };
  };

  const { solar: SOLAR_WEIGHT, wind: WIND_WEIGHT, hydro: HYDRO_WEIGHT } = getDynamicWeights();

  const totalEnergy = placedItems.reduce((sum, item) => {
    if (item.type === "solar") return sum + SOLAR_WEIGHT;
    if (item.type === "wind") return sum + WIND_WEIGHT;
    if (item.type === "hydro") return sum + HYDRO_WEIGHT;
    return sum;
  }, 0);

  const isInRange = hasChecked && totalEnergy >= THRESHOLD_MIN && totalEnergy <= THRESHOLD_MAX;

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
    setAttemptsLeft(3);
    setPlacedItems([]);
    setHasChecked(false);
    setWeather({ sun: 0, wind: 0, rain: 0 });
    const items: PlacedItem[] = [];
    for (let i = 0; i < NUM_ITEMS_PER_TYPE; i++) {
      items.push({ id: `solar-${i}`, type: "solar" });
      items.push({ id: `wind-${i}`, type: "wind" });
      items.push({ id: `hydro-${i}`, type: "hydro" });
    }
    setAvailableItems(items);
  };

  const handleDragStart = (e: any, itemId: string) => {
    const dataTransfer = e?.dataTransfer ?? e?.nativeEvent?.dataTransfer;
    if (dataTransfer) {
      dataTransfer.setData("itemId", itemId);
      dataTransfer.effectAllowed = "move";
    } else if (e?.currentTarget) {
      try {
        (e.currentTarget as HTMLElement).setAttribute("data-item-id", itemId);
      } catch {
        /* ignore */
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetContainer: 'available' | 'powerGrid') => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("itemId");
    const item = availableItems.find(i => i.id === itemId) || placedItems.find(i => i.id === itemId);

    if (item) {
      if (targetContainer === 'powerGrid' && availableItems.some(i => i.id === itemId)) {
        setAvailableItems(availableItems.filter(i => i.id !== itemId));
        setPlacedItems([...placedItems, item]);
      } else if (targetContainer === 'available' && placedItems.some(i => i.id === itemId)) {
        setPlacedItems(placedItems.filter(i => i.id !== itemId));
        setAvailableItems([...availableItems, item]);
      }
      setHasChecked(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddItem = (id: string) => {
    const item = availableItems.find(i => i.id === id);
    if (item) {
      setAvailableItems(availableItems.filter(i => i.id !== id));
      setPlacedItems([...placedItems, item]);
      setHasChecked(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    const item = placedItems.find(i => i.id === id);
    if (item) {
      setPlacedItems(placedItems.filter(i => i.id !== id));
      setAvailableItems([...availableItems, item]);
      setHasChecked(false);
    }
  };

  const handleWeatherChange = (type: 'sun' | 'wind' | 'rain', value: number) => {
    console.log(`Slider ${type} changed to:`, value); // Debugging log
    setWeather(prev => ({
      ...prev,
      [type]: value / 100,
    }));
    setHasChecked(false);
  };

  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 33,
    delay: Math.random() * 2,
  }));

  return (
    <div
      className="min-h-screen h-full w-full relative overflow-hidden m-0 bg-black"
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute top-0 h-full w-full pointer-events-none z-1">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-[2px] h-[2px] bg-white/80 rounded-full animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute top-20 left-0 w-64 h-32 bg-[#102131]/90 rounded-full blur-xl animate-slide-cloud pointer-events-none"
        style={{ animationDuration: '30s', animationDelay: '0s' }} />
      <div className="absolute top-72 left-0 w-40 h-16 bg-[#102131]/90 rounded-full blur-xl animate-slide-cloud pointer-events-none"
        style={{ animationDuration: '30s', animationDelay: '10s' }} />
      <div className="absolute top-96 left-1/2 w-96 h-32 bg-[#102131]/90 rounded-full blur-2xl animate-slide-cloud pointer-events-none"
        style={{ animationDuration: '30s', animationDelay: '5s' }} />

      {gameStatus === "playing" && (
        <Card className="absolute z-20 top-4 right-4 p-2 w-full max-w-sm bg-gray-800/70 border-gray-900 backdrop-blur">
          <h3 className="text-lg font-bold mb-2 text-center text-yellow-400">🌤️ Weather Control</h3>
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-white">☀️ Sun Intensity ({(weather.sun * 100).toFixed(0)} units)</p>
              <Slider
                value={[weather.sun * 100]}
                onValueChange={(value) => handleWeatherChange('sun', value[0])}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <p className="font-semibold text-white">𖣘 Wind Intensity ({(weather.wind * 100).toFixed(0)} units)</p>
              <Slider
                value={[weather.wind * 100]}
                onValueChange={(value) => handleWeatherChange('wind', value[0])}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <p className="font-semibold text-white">💧 Rain Intensity ({(weather.rain * 100).toFixed(0)} units)</p>
              <Slider
                value={[weather.rain * 100]}
                onValueChange={(value) => handleWeatherChange('rain', value[0])}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <p className="text-[12px] text-gray-300">
                ☀️ Solar: <span className="font-bold text-yellow-400">{SOLAR_WEIGHT.toFixed(2)} units per panel</span> |
                𖣘 Wind: <span className="font-bold text-blue-400">{WIND_WEIGHT.toFixed(2)} units per turbine</span> |
                💧 Hydro: <span className="font-bold text-cyan-400">{HYDRO_WEIGHT.toFixed(2)} units per dam</span>
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-0 pt-4 gap-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-2 flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 md:w-12 md:h-12 text-yellow-400" />
            Perceptron City
            <Zap className="w-10 h-10 md:w-12 md:h-12 text-blue-400" />
          </h1>
          <p className="md:text-lg text-gray-300 font-semibold">
            Drag and drop or click energy sources to power the city!
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
                <h3 className="text-xl font-bold mb-3 text-yellow-400 flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  What's a Perceptron?
                </h3>
                <p className="leading-relaxed text-gray-300">
                  A <strong>perceptron</strong> is like a smart decision-maker! 🤖 It takes in information
                  (like the number of energy sources), multiplies each by its <strong>weight</strong> (importance) set by the weather sliders,
                  adds them all up, and decides: should we turn ON or stay OFF?
                </p>
              </Card>

              <Card className="p-6 bg-gray-800/70 border-gray-900 backdrop-blur">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  How to Play
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Welcome to <strong>Perceptron City</strong>! 🌆 Your mission is to power the city
                    by moving energy sources into the power grid. You can <strong>drag and drop</strong> or <strong>click</strong> to move sources between the Available Energy Sources and Power Grid. If the energy level is too low,
                    the city will stay dark, and if it’s too high, there will be a power overload and the city might catch fire! 🔥
                  </p>
                  <div className="space-y-2">
                    <p className="font-bold text-white">Energy Sources (5 of each):</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
                      <li>☀️ <strong>Solar Panel</strong></li>
                      <li>𖣘 <strong>Wind Turbine</strong></li>
                      <li>💧 <strong>Hydro Dam</strong></li>
                    </ul>
                  </div>
                  <p className="text-gray-300">
                    Use the weather sliders (0–100 units) to set the intensity for each energy source. The weight per source is its intensity multiplied by 100 and divided by 5 (e.g., 50 units intensity = 10 units per panel/turbine/dam). Each slider is independent, so adjust them to fine-tune the energy output!
                  </p>
                  <p className="font-bold text-blue-400">
                    Goal: Achieve a total energy of <span className="font-bold text-blue-400">100–150 units</span> to power the city!
                  </p>
                  <p className="text-gray-300">
                    You have <strong className="text-yellow-400">3 attempts</strong> to get it right.
                    You get 5 of each energy source to use. Good luck! 🎯
                  </p>
                </div>
              </Card>

              <div className="flex justify-center">
                <Button
                  onClick={handleStartGame}
                  className="text-xl p-4 h-auto bg-blue-500 hover:bg-blue-600"
                >
                  Start Game
                  <PlayCircle className="w-12 h-12 ml-2" />
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
                <div className="text-xl font-bold text-white">
                  Attempts Left: <span className="text-yellow-400">{attemptsLeft}</span> / 3
                </div>
                <div className="mt-2">
                  Total Energy: <span className={`font-bold ${isInRange ? 'text-green-400' : 'text-gray-300'}`}>
                    {totalEnergy.toFixed(2)} units
                  </span>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4 bg-gray-800/70 border-gray-900 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4 text-center text-white">Available Energy Sources</h3>
                  <div
                    className="flex flex-wrap gap-3 justify-center min-h-[300px]"
                    onDrop={(e) => handleDrop(e, 'available')}
                    onDragOver={handleDragOver}
                  >
                    {availableItems.map((item) => (
                      <motion.div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <div
                          className="text-4xl bg-blue-500/20 border-2 border-blue-400/50 rounded-lg p-3 hover:scale-105 hover:bg-blue-500/30 hover:border-blue-400/70 transition-all cursor-pointer"
                          onClick={() => handleAddItem(item.id)}
                        >
                          {item.type === "solar" && "☀️"}
                          {item.type === "wind" && "𖣘"}
                          {item.type === "hydro" && "💧"}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 bg-gray-800/70 border-gray-900 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4 text-center text-white">Power Grid</h3>
                  <div
                    onDrop={(e) => handleDrop(e, 'powerGrid')}
                    onDragOver={handleDragOver}
                    className="min-h-[300px] border-4 border-dashed border-blue-400/50 rounded-lg p-4 bg-gray-700/20 hover:border-blue-400/70 transition-colors"
                  >
                    {placedItems.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-300 text-center">
                        <p>Drag or click energy sources here</p>
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
                            <div
                              className="text-4xl bg-gray-900/80 rounded-lg p-3 cursor-pointer hover:bg-gray-900 transition-colors"
                              onClick={() => handleRemoveItem(item.id)}
                              draggable
                              onDragStart={(e) => handleDragStart(e, item.id)}
                            >
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
                  className="text-xl px-6 py-4 h-auto bg-blue-500 hover:bg-blue-600"
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
                <h2 className="text-5xl font-extrabold text-green-400 mb-4">You Won!</h2>
                <p className="text-2xl text-gray-300">
                  Perfect! You powered the city! 🌆✨
                </p>
              </motion.div>

              <Card className="p-8 bg-gray-800/70 border-gray-900 backdrop-blur">
                <div className="text-center space-y-4">
                  <p className="text-xl text-gray-300">
                    You successfully created <span className="font-bold text-blue-400">{totalEnergy.toFixed(2)} units</span> of energy!
                  </p>
                  <p className="text-lg text-gray-300">
                    The perfect range was <span className="font-bold text-blue-400">100–150 units</span>
                  </p>
                  <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                    <p className="font-bold text-lg mb-2 text-yellow-400">🧠 Perceptron Success!</p>
                    <p className="text-sm text-gray-300">
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
                  className="text-xl px-6 py-4 h-auto bg-blue-500 hover:bg-blue-600"
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
                <h2 className="text-5xl font-extrabold text-red-400 mb-4">Game Over!</h2>
                <p className="text-2xl text-gray-300">
                  You ran out of attempts!
                </p>
              </motion.div>

              <Card className="p-8 bg-gray-800/70 border-gray-900 backdrop-blur">
                <div className="text-center space-y-4">
                  <p className="text-xl text-gray-300">
                    Your final energy was <span className="font-bold text-gray-300">{totalEnergy.toFixed(2)} units</span>
                  </p>
                  <p className="text-lg text-blue-400 font-bold">
                    The target range was <span className="font-bold text-blue-400">100–150 units</span>
                  </p>
                  <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                    <p className="font-bold text-lg mb-2 text-yellow-400">💡 Hint for next time:</p>
                    <p className="text-sm text-gray-300">
                      Remember: Solar = {SOLAR_WEIGHT.toFixed(2)} units per panel, Wind = {WIND_WEIGHT.toFixed(2)} units per turbine, Hydro = {HYDRO_WEIGHT.toFixed(2)} units per dam.
                      Try different combinations and adjust the weather to reach <span className="font-bold text-blue-400">100–150 units</span>!
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleReplay}
                  className="text-xl px-6 py-4 h-auto bg-blue-500 hover:bg-blue-600"
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