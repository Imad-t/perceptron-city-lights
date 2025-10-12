import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Lightbulb, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * PerceptronCity - An interactive educational component teaching kids about perceptrons
 * through a city power analogy. Players adjust energy sources (solar, wind, hydro) and
 * see if they can power the city without overloading it!
 */
const PerceptronCity = () => {
  // Energy source inputs (0-10 scale)
  const [solarInput, setSolarInput] = useState(5);
  const [windInput, setWindInput] = useState(5);
  const [hydroInput, setHydroInput] = useState(5);

  // Weights - representing the "efficiency" of each energy source
  const [solarWeight] = useState(1.2); // Solar is most efficient
  const [windWeight] = useState(0.8);  // Wind is medium
  const [hydroWeight] = useState(1.0); // Hydro is balanced

  // UI toggles
  const [soundOn, setSoundOn] = useState(false);
  const [learnMode, setLearnMode] = useState(false);

  // Perceptron calculation: sum of (input × weight)
  const totalEnergy = 
    solarInput * solarWeight + 
    windInput * windWeight + 
    hydroInput * hydroWeight;

  // Activation threshold logic
  const THRESHOLD_MIN = 10;
  const THRESHOLD_MAX = 20;
  
  let cityState: "off" | "powered" | "overload" = "off";
  if (totalEnergy >= THRESHOLD_MIN && totalEnergy <= THRESHOLD_MAX) {
    cityState = "powered";
  } else if (totalEnergy > THRESHOLD_MAX) {
    cityState = "overload";
  }

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
            className="absolute w-1 h-1 bg-foreground rounded-full animate-twinkle"
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
            Power the city with the perfect energy balance! ⚡
          </p>
        </motion.div>

        {/* Controls in top right */}
        <div className="absolute top-4 right-4 flex gap-3">
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

        {/* City visualization */}
        <motion.div
          className="relative flex items-center justify-center mb-6"
          animate={{
            scale: cityState === "powered" ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-9xl relative">
            {cityState === "off" && "🌃"}
            {cityState === "powered" && (
              <motion.span
                className="animate-glow"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                🌆
              </motion.span>
            )}
            {cityState === "overload" && (
              <motion.span
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🔥
              </motion.span>
            )}
          </div>

          {/* Sparkle effects when powered */}
          <AnimatePresence>
            {cityState === "powered" && (
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

        {/* Status message */}
        <motion.div
          className="text-center"
          key={cityState}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {cityState === "off" && (
            <div className="text-2xl font-bold text-muted-foreground">
              ❌ Not enough power! The city is dark.
            </div>
          )}
          {cityState === "powered" && (
            <div className="text-2xl font-bold text-success">
              ✅ Perfect! The city is powered!
            </div>
          )}
          {cityState === "overload" && (
            <div className="text-2xl font-bold text-warning">
              ⚠️ Overload! Too much power!
            </div>
          )}
          <div className="text-lg mt-2 font-semibold">
            Total Energy: <span className="text-accent">{totalEnergy.toFixed(1)}</span> units
          </div>
        </motion.div>

        {/* Energy source controls */}
        <Card className="w-full max-w-3xl p-6 md:p-8 bg-card/90 backdrop-blur">
          <div className="flex flex-col gap-6">
            
            {/* Solar Energy */}
            <EnergySlider
              emoji="☀️"
              label="Solar Power"
              value={solarInput}
              onChange={setSolarInput}
              weight={solarWeight}
              color="solar"
            />

            {/* Wind Energy */}
            <EnergySlider
              emoji="🌬️"
              label="Wind Power"
              value={windInput}
              onChange={setWindInput}
              weight={windWeight}
              color="wind"
            />

            {/* Hydro Energy */}
            <EnergySlider
              emoji="💧"
              label="Hydro Power"
              value={hydroInput}
              onChange={setHydroInput}
              weight={hydroWeight}
              color="hydro"
            />

          </div>
        </Card>

        {/* Learn Mode Toggle */}
        <Card className="w-full max-w-3xl p-6 bg-card/90 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-accent" />
              <Label htmlFor="learn-mode" className="text-lg font-bold">
                Learn Mode
              </Label>
            </div>
            <Switch
              id="learn-mode"
              checked={learnMode}
              onCheckedChange={setLearnMode}
            />
          </div>

          <AnimatePresence>
            {learnMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h3 className="font-bold text-xl text-primary">
                    🧠 The Perceptron Formula:
                  </h3>
                  <div className="font-mono text-sm md:text-base bg-background/80 p-3 rounded border border-border">
                    output = (Σ inputs × weights) ≥ threshold ? 1 : 0
                  </div>
                  <div className="font-mono text-sm md:text-base bg-background/80 p-3 rounded border border-border">
                    energy = (solar × {solarWeight}) + (wind × {windWeight}) + (hydro × {hydroWeight})
                  </div>
                  <div className="font-mono text-sm md:text-base bg-background/80 p-3 rounded border border-border">
                    energy = ({solarInput} × {solarWeight}) + ({windInput} × {windWeight}) + ({hydroInput} × {hydroWeight}) = {totalEnergy.toFixed(1)}
                  </div>
                  <p className="text-sm">
                    <strong>If energy ≥ {THRESHOLD_MIN} and ≤ {THRESHOLD_MAX}:</strong> City powers on! (output = 1) <br />
                    <strong>If energy &lt; {THRESHOLD_MIN}:</strong> Not enough power (output = 0) <br />
                    <strong>If energy &gt; {THRESHOLD_MAX}:</strong> Overload! (too much activation)
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Educational info card */}
        <Card className="w-full max-w-3xl p-6 bg-card/90 backdrop-blur">
          <h3 className="text-2xl font-bold mb-3 text-primary flex items-center gap-2">
            <Brain className="w-7 h-7" />
            What's a Perceptron?
          </h3>
          <p className="text-base md:text-lg leading-relaxed">
            A <strong>perceptron</strong> is like a smart decision-maker! 🤖 It takes in information 
            (like solar, wind, and hydro power), multiplies each by how important it is (the weights), 
            adds them all up, and decides: should we turn ON or stay OFF? 
          </p>
          <p className="text-base md:text-lg leading-relaxed mt-3">
            In real AI, perceptrons learn by adjusting their weights to make better decisions. 
            Here, the weights show which energy source is most efficient! Try different combinations 
            to power the city perfectly. 🌟
          </p>
        </Card>

      </div>
    </div>
  );
};

/**
 * EnergySlider - A reusable slider component for each energy source
 */
interface EnergySliderProps {
  emoji: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  weight: number;
  color: "solar" | "wind" | "hydro";
}

const EnergySlider = ({ emoji, label, value, onChange, weight, color }: EnergySliderProps) => {
  const contribution = value * weight;
  
  const colorClasses = {
    solar: "from-solar to-solar-light",
    wind: "from-wind to-wind-light",
    hydro: "from-hydro to-hydro-light",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{emoji}</span>
          <span className="text-lg font-bold">{label}</span>
        </div>
        <div className="text-sm font-semibold bg-muted px-3 py-1 rounded-full">
          Weight: ×{weight}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-3 rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, 
              hsl(var(--${color})) 0%, 
              hsl(var(--${color}-light)) ${(value / 10) * 100}%, 
              hsl(var(--muted)) ${(value / 10) * 100}%, 
              hsl(var(--muted)) 100%)`
          }}
        />
        <div className="min-w-[60px] text-right">
          <div className="text-lg font-bold">{value.toFixed(1)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Contribution: <span className={`font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
            {contribution.toFixed(1)} units
          </span>
        </span>
      </div>
    </div>
  );
};

export default PerceptronCity;