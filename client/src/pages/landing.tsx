import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useGameContext } from "@/context/game-context";
import { playUISound } from "@/lib/audio";
import { createUser } from "@/lib/local-storage";
import { useLocation } from "wouter";
import { Zap, User, Gamepad2, Volume2, VolumeX } from "lucide-react";
import themeMusic from "@assets/Rick and Morty.mp3";
import spaceBackground from "@assets/unnamed.png";
import portalGif from "@assets/200w.gif";
import rickMortyLogo from "@assets/0f9c10dd52778bc6c0b0754f8f8f6e2b.jpg";

const userSchema = z.object({
  username: z.string()
    .min(2, "Username must be at least 2 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
});

type UserFormData = z.infer<typeof userSchema>;

interface LandingPageProps {
  onUserCreated: () => void;
}

export default function LandingPage({ onUserCreated }: LandingPageProps) {
  const { setCurrentUser } = useGameContext();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement>(null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
    },
  });

  const handleCreateUser = async (userData: UserFormData) => {
    setIsLoading(true);
    try {
      const user = createUser(userData.username);
      setCurrentUser(user);
      toast({
        title: "Welcome to the Multiverse!",
        description: `Account created for ${user.username}. Ready for interdimensional romance?`,
      });
      playUISound('click');
      onUserCreated();
    } catch (error) {
      toast({
        title: "Account Creation Failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Music controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
      audioRef.current.loop = true;
      // Auto-play music when component mounts
      if (isMusicPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [musicVolume]);

  useEffect(() => {
    if (audioRef.current && isMusicPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    playUISound('click');
    handleCreateUser(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Audio element for theme music */}
      <audio ref={audioRef} src={themeMusic} preload="auto" />
      
      {/* Music control button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        className="absolute top-6 right-6 z-50"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMusic}
          className="glass-morphism/50 border border-green-400/30 hover:border-green-400 hover:shadow-lg hover:shadow-green-400/20 transition-all duration-300"
          title={isMusicPlaying ? "Pause Music" : "Play Music"}
        >
          {isMusicPlaying ? (
            <Volume2 className="w-5 h-5 text-green-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-green-400" />
          )}
        </Button>
      </motion.div>

      {/* Animated starry background */}
      <div className="absolute inset-0">
        {/* Stars field */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute bg-white rounded-full shadow-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              boxShadow: `0 0 ${Math.random() * 6 + 2}px rgba(255, 255, 255, 0.8)`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* Shooting stars */}
        {[...Array(1)].map((_, i) => (
          <motion.div
            key={`shooting-star-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              left: `${Math.random() * 50}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 100 + 50,
            }}
            animate={{
              x: ['-100px', '100vw'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 10 + 5,
              ease: "easeOut",
            }}
          />
        ))}
        
        {/* Nebula effects */}
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={`nebula-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              background: `radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 50%, transparent 100%)`,
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>


        
      {/* Floating energy particles */}
      {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 3 === 0 ? 'w-2 h-2 bg-green-400' : 
              i % 3 === 1 ? 'w-1.5 h-1.5 bg-green-300' : 'w-1 h-1 bg-green-500'
            } opacity-60`}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [0, 1, 0.5, 1]
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}

      {/* Energy streams */}
      <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-green-400/30 to-transparent animate-pulse" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-pulse" style={{animationDelay: '1s'}} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8 relative">
          {/* Portal behind title */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.3, duration: 1.5 }}
            className="absolute inset-0 flex items-center justify-center -z-10"
          >
            <img 
              src={portalGif} 
              alt="Portal" 
              className="w-48 h-48 object-contain"
              style={{ filter: 'drop-shadow(0 0 30px rgba(34, 197, 94, 0.4))' }}
            />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="relative z-10 pt-12 mb-2 text-center"
            style={{
              fontFamily: '"Comic Sans MS", cursive, sans-serif',
              fontSize: '3.5rem',
              fontWeight: 'bold',
              color: '#22C55E',
              textShadow: `
                0 0 10px #22C55E,
                0 0 20px #22C55E,
                0 0 30px #22C55E,
                2px 2px 0px #000,
                -2px -2px 0px #000,
                2px -2px 0px #000,
                -2px 2px 0px #000
              `,
              transform: 'rotate(-2deg)',
              letterSpacing: '0.1em'
            }}
          >
            Rick and Morty
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 120 }}
            className="text-2xl font-semibold text-green-400 mb-4"
            style={{
              textShadow: '0 0 15px rgba(34, 197, 94, 0.6)',
            }}
          >
            Dating Simulator
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-slate-300 text-lg leading-relaxed"
          >
            Enter the multiverse of interdimensional romance
          </motion.p>
        </div>

        <Card className="bg-slate-800/95 border-green-400/30 backdrop-blur-sm shadow-2xl shadow-green-400/10 relative overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-transparent to-green-600/5 pointer-events-none" />
          
          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-white flex items-center justify-center gap-2 text-xl">
              <User className="w-5 h-5 text-green-400" />
              Create Your Profile
            </CardTitle>
            <CardDescription className="text-slate-300 text-base leading-relaxed">
              Choose a username to begin your interdimensional dating adventure
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your username..."
                          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-teal-400 focus:ring-teal-400"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 
                           text-white font-semibold py-3 text-lg border border-green-400/50 
                           shadow-lg shadow-green-400/25 hover:shadow-xl hover:shadow-green-400/40 
                           transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 animate-pulse" />
                  
                  <div className="relative z-10">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Opening Portal...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4" />
                        Enter the Multiverse
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="text-center text-sm text-slate-400">
                <p className="mb-2">Features you'll unlock:</p>
                <ul className="space-y-1 text-xs">
                  <li>• AI-powered conversations with Rick & Morty characters</li>
                  <li>• Save multiple relationship progressions</li>
                  <li>• Unlock character origin stories and backstories</li>
                  <li>• Dynamic affection system with real consequences</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-6 text-xs text-slate-500"
        >
          Ready to date across dimensions? Your username will be your identity in the multiverse.
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-4 text-xs text-slate-600 bg-slate-800/50 p-3 rounded-lg border border-slate-700"
        >
          <p className="mb-1">
            <strong>Disclaimer:</strong> This is an unofficial fan project created for entertainment purposes only.
          </p>
          <p className="mb-2">
            Rick and Morty and all related characters are property of Adult Swim and Dan Harmon.
          </p>
          <p className="text-teal-400 hover:text-teal-300 cursor-pointer" onClick={() => navigate('/terms')}>
            View Terms & Privacy Policy
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}