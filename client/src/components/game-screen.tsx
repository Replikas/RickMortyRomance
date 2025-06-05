import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, MessageSquare, Save, Book, Lock, HelpCircle } from "lucide-react";
import { useGameContext } from "@/context/game-context";
import { useHints, HINT_CONFIGS } from "@/context/hint-context";
import HintBubble from "./hint-bubble";
import CharacterSprite from "./character-sprite";
import DialogueBox from "./dialogue-box";
import ChoiceButtons from "./choice-buttons";
import AffectionMeter from "./affection-meter";
import EasterEggs from "./easter-eggs";
import RandomEvents from "./random-events";
import CharacterReactions from "./character-reactions";
import SaveLoadModal from "./save-load-modal";
import BackstoryExplorer from "./backstory-explorer";
import DocumentationModal from "./documentation-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { playUISound, playCharacterSound, audioManager, startBackgroundMusic } from "@/lib/audio";

interface GameScreenProps {
  onBackToSelection: () => void;
}

export default function GameScreen({ onBackToSelection }: GameScreenProps) {
  const { selectedCharacter, currentUser, gameState, setGameState, setSelectedCharacter, setShowSettings } = useGameContext();
  const { showHint, hideHint, updateHintProgress } = useHints();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [customMessage, setCustomMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showBackstory, setShowBackstory] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [hasShownFirstConversationHint, setHasShownFirstConversationHint] = useState(false);
  const [hasShownMemoriesHint, setHasShownMemoriesHint] = useState(false);
  const [hasShownSaveGameHint, setHasShownSaveGameHint] = useState(false);
  const [isHoveringOriginRoute, setIsHoveringOriginRoute] = useState(false);

  // Get or create game state
  const { data: currentGameState, isLoading: gameStateLoading } = useQuery<any>({
    queryKey: [`/api/game-state/${currentUser?.id || 1}/${selectedCharacter?.id}`],
    enabled: !!selectedCharacter,
  });

  // Get dialogue history
  const { data: dialogues = [], isLoading: dialoguesLoading } = useQuery<any[]>({
    queryKey: [`/api/dialogues/${currentGameState?.id}`],
    enabled: !!currentGameState?.id,
  });

  // Get user global settings (API keys, preferences)
  const { data: globalSettings, isLoading: settingsLoading } = useQuery<any>({
    queryKey: [`/api/user/${currentUser?.id || 1}/settings`],
    enabled: !!currentUser?.id,
  });

  // Send AI conversation request
  const conversationMutation = useMutation({
    mutationFn: async (message: string) => {
      // Global settings are checked on the backend now
      console.log("Sending conversation request with global settings:", { 
        hasGlobalSettings: !!globalSettings,
        userId: currentUser?.id || 1
      });

      return await apiRequest("POST", "/api/conversation", {
        characterId: selectedCharacter?.id,
        message,
        gameStateId: currentGameState?.id,
        userId: currentUser?.id || 1,
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      // Add character response to dialogue
      addDialogueMutation.mutate({
        gameStateId: currentGameState?.id,
        speaker: "character",
        message: data.message,
        messageType: "character",
        affectionChange: data.affectionChange,
        emotionTriggered: data.emotion,
      });

      // Update game state with new emotion and affection
      if (currentGameState) {
        updateGameStateMutation.mutate({
          currentEmotion: data.emotion,
          affectionLevel: Math.round((currentGameState.affectionLevel || 0) + (data.affectionChange || 0)),
          conversationCount: (currentGameState.conversationCount || 0) + 1,
        });
      }

      setIsTyping(false);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to send message. Please try again.";
      toast({
        title: "Conversation Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  // Add dialogue mutation
  const addDialogueMutation = useMutation({
    mutationFn: async (dialogue: any) => {
      return await apiRequest("POST", "/api/dialogues", dialogue).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dialogues/${currentGameState?.id}`] });
      // Also refetch dialogues immediately
      queryClient.refetchQueries({ queryKey: [`/api/dialogues/${currentGameState?.id}`] });
    },
  });

  // Update game state mutation
  const updateGameStateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PUT", `/api/game-state/${currentGameState?.id}`, updates);
      return response.json();
    },
    onSuccess: (updatedState) => {
      setGameState(updatedState);
      queryClient.invalidateQueries({ queryKey: ["/api/game-state", currentUser?.id || 1, selectedCharacter?.id] });
    },
  });

  // Initialize local game state when first loaded (prevent infinite loop)
  useEffect(() => {
    if (currentGameState && (!gameState || gameState.id !== currentGameState.id)) {
      setGameState(currentGameState);
    }
  }, [currentGameState?.id]);

  // Initialize audio system on component mount
  useEffect(() => {
    if (selectedCharacter && currentGameState) {
      audioManager.resumeAudioContext();
      
      // Set audio volumes from game settings
      if (currentGameState.settings) {
        audioManager.setVolumes(
          currentGameState.settings.masterVolume,
          currentGameState.settings.sfxVolume,
          currentGameState.settings.musicVolume
        );
      }
    }
  }, [selectedCharacter, currentGameState]);

  // Track dialogue length to detect new messages
  const [previousDialogueLength, setPreviousDialogueLength] = useState(0);

  // Play character sound only when NEW AI response is received
  useEffect(() => {
    if (dialogues && dialogues.length > previousDialogueLength) {
      const lastDialogue = dialogues[dialogues.length - 1];
      if (lastDialogue?.speaker === 'character' && selectedCharacter) {
        const emotion = currentGameState?.currentEmotion || 'neutral';
        playCharacterSound(selectedCharacter.name, emotion);
      }
      setPreviousDialogueLength(dialogues.length);
    }
  }, [dialogues, selectedCharacter, currentGameState?.currentEmotion, previousDialogueLength]);

  // Removed persistent hint system - all hints now show only on hover

  // API key warning removed - converted to hover-only behavior

  const handleChoiceSelect = async (choice: any) => {
    if (!currentGameState) return;

    // Play UI sound for selection
    playUISound('select');

    // Add player message to dialogue first, then wait for it to complete
    try {
      await addDialogueMutation.mutateAsync({
        gameStateId: currentGameState.id,
        speaker: "player",
        message: choice.text,
        messageType: "choice",
        affectionChange: 0,
      });

      // Only trigger AI response after player message is saved
      setIsTyping(true);
      conversationMutation.mutate(choice.text);
    } catch (error) {
      console.error("Failed to add player message:", error);
    }
  };

  const handleCustomMessage = async () => {
    if (!customMessage.trim() || !currentGameState) return;

    const message = customMessage.trim();
    setCustomMessage("");

    // Add player message to dialogue first, then wait for it to complete
    try {
      await addDialogueMutation.mutateAsync({
        gameStateId: currentGameState.id,
        speaker: "player",
        message,
        messageType: "custom",
        affectionChange: 0,
      });

      // Only trigger AI response after player message is saved
      setIsTyping(true);
      conversationMutation.mutate(message);
    } catch (error) {
      console.error("Failed to add player message:", error);
    }
  };

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No character selected</p>
          <Button onClick={onBackToSelection}>Select Character</Button>
        </div>
      </div>
    );
  }

  if (gameStateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-primary animate-glow">Initializing interdimensional connection...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section 
      className="py-2 px-2 sm:py-4 sm:px-4 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-2 sm:gap-3 min-h-[calc(100vh-1rem)]">
          
          {/* Character Panel - Mobile: Top, Desktop: Left */}
          <motion.div 
            className="lg:col-span-1 order-1 lg:order-1 space-y-2 sm:space-y-3"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Navigation Buttons */}
            <div className="flex flex-col space-y-2 mb-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedCharacter(null);
                  setGameState(null);
                  onBackToSelection();
                }}
                className="text-muted-foreground hover:text-primary transition-colors min-h-[36px] sm:min-h-[44px] w-full text-sm sm:text-base"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Change Character
              </Button>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div id="save-load-button" className="relative flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        playUISound('click');
                        setShowSaveLoad(true);
                      }}
                      className="flex items-center justify-center space-x-1 border-slate-600 text-slate-300 hover:bg-slate-700 w-full h-8 sm:h-9"
                    >
                      <Save className="w-3 h-3" />
                      <span className="text-xs">Save/Load</span>
                    </Button>
                    <HintBubble
                      isVisible={!hasShownSaveGameHint && (currentGameState?.conversationCount || 0) >= 3}
                      type="tip"
                      title="Save Your Progress"
                      description="Don't lose your conversation! Save your game to continue later with the same character."
                      position="right"
                      autoHide={true}
                      delay={2000}
                      onClose={() => setHasShownSaveGameHint(true)}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      playUISound('click');
                      setShowDocumentation(true);
                    }}
                    className="flex items-center justify-center space-x-1 border-slate-600 text-slate-300 hover:bg-slate-700 flex-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span className="text-xs">Help</span>
                  </Button>
                </div>
                
                <div 
                  id="backstory-button" 
                  className="relative"
                  onMouseEnter={() => setIsHoveringOriginRoute(true)}
                  onMouseLeave={() => setIsHoveringOriginRoute(false)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      playUISound('click');
                      if ((currentGameState?.affectionLevel || 0) >= 25) {
                        setShowBackstory(true);
                      }
                    }}
                    disabled={!currentGameState || (currentGameState.affectionLevel || 0) < 25}
                    className={`flex items-center justify-center space-x-1 border-slate-600 transition-all w-full ${
                      (currentGameState?.affectionLevel || 0) >= 25 
                        ? 'text-purple-300 hover:bg-purple-900/20 border-purple-500/30' 
                        : 'text-slate-500 cursor-not-allowed opacity-50'
                    }`}
                    title={`Unlocks at 25% affection (current: ${currentGameState?.affectionLevel || 0}%)`}
                  >
                    {(!currentGameState || (currentGameState.affectionLevel || 0) < 25) ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Book className="w-3 h-3" />
                    )}
                    <span className="text-xs">Origin Route</span>
                    {(!currentGameState || (currentGameState.affectionLevel || 0) < 25) && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    )}
                  </Button>
                  <HintBubble
                    isVisible={isHoveringOriginRoute && (currentGameState?.affectionLevel || 0) < 25}
                    type="locked"
                    title="Origin Route Locked"
                    description="Build a deeper connection to unlock the character's dimensional backstory and origin secrets."
                    requirement="Reach 25% affection"
                    progress={currentGameState?.affectionLevel || 0}
                    maxProgress={25}
                    position="right"
                    autoHide={false}
                  />
                  <HintBubble
                    isVisible={isHoveringOriginRoute && (currentGameState?.affectionLevel || 0) >= 25}
                    type="unlock"
                    title="Origin Route Unlocked!"
                    description="You can now explore this character's interdimensional backstory and hidden origin secrets."
                    position="right"
                    autoHide={false}
                  />
                </div>
              </div>
            </div>

            {/* API Key Warning */}
            {(!globalSettings?.openrouterApiKey || globalSettings.openrouterApiKey.trim() === '') && (
              <motion.div
                className="glass-morphism border border-yellow-400/30 rounded-xl p-4 backdrop-blur-sm mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-yellow-400 text-sm font-medium">AI Conversations Disabled</p>
                    <p className="text-muted-foreground text-xs">
                      Configure your OpenRouter API key in settings to enable AI-powered character responses
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="text-xs border-yellow-400/30 hover:border-yellow-400/50 hover:bg-yellow-400/10"
                  >
                    Settings
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Character Display */}
            <Card className="glass-morphism portal-glow">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center">
                  {/* Character Sprite with Emotion */}
                  <div className="mb-2 sm:mb-4">
                    <CharacterSprite 
                      character={selectedCharacter}
                      emotion={currentGameState?.currentEmotion || "neutral"}
                      size="medium"
                      className="mx-auto animate-float"
                      lastMessage={dialogues && dialogues.length > 0 ? dialogues[dialogues.length - 1]?.message || "" : ""}
                      emotionalIntensity={5}
                    />
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-bold text-glow mb-1 sm:mb-2">
                    {selectedCharacter.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
                    Current Emotion: 
                    <span className="text-secondary-foreground ml-1 capitalize">
                      {currentGameState?.currentEmotion || "neutral"}
                    </span>
                  </p>
                  
                  {/* Affection Meter */}
                  <AffectionMeter 
                    level={currentGameState?.affectionLevel || 0}
                    status={currentGameState?.relationshipStatus || "stranger"}
                  />

                  {/* Character Stats */}
                  <div className="mt-6 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Conversations:</span>
                      <span className="text-primary">
                        {currentGameState?.conversationCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Relationship:</span>
                      <span className="text-secondary-foreground capitalize">
                        {currentGameState?.relationshipStatus || "stranger"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dialogue and Interaction Area - Mobile: Bottom, Desktop: Right */}
          <motion.div 
            className="lg:col-span-2 order-2 lg:order-2 space-y-2 sm:space-y-3 flex-1 flex flex-col"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            
            {/* Dialogue History - Compact */}
            <Card className="glass-morphism portal-glow flex-1 flex flex-col">
              <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="flex items-center justify-between text-glow text-xs sm:text-sm">
                  <div className="flex items-center">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-secondary-foreground" />
                    Chat
                  </div>
                  {/* NSFW Toggle */}
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs transition-colors ${
                      currentGameState?.settings?.nsfwContent ? 'text-muted-foreground' : 'text-green-400'
                    }`}>
                      SFW
                    </span>
                    <Switch
                      checked={currentGameState?.settings?.nsfwContent || false}
                      onCheckedChange={async (checked) => {
                        if (!currentGameState?.id) return;
                        
                        try {
                          const response = await apiRequest("PUT", `/api/game-state/${currentGameState.id}`, {
                            settings: {
                              ...currentGameState.settings,
                              nsfwContent: checked
                            }
                          });
                          const updatedState = await response.json();
                          setGameState(updatedState);
                          queryClient.invalidateQueries({ queryKey: [`/api/game-state/${currentUser?.id || 1}/${selectedCharacter?.id}`] });
                          
                          toast({
                            title: `${checked ? 'NSFW' : 'SFW'} Mode Enabled`,
                            description: `Mature content is now ${checked ? 'allowed' : 'restricted'} in conversations`,
                          });
                        } catch (error) {
                          toast({
                            title: "Settings Error",
                            description: "Failed to update content filter setting",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-green-500"
                    />
                    <span className={`text-xs transition-colors ${
                      currentGameState?.settings?.nsfwContent ? 'text-red-400' : 'text-muted-foreground'
                    }`}>
                      NSFW
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pb-2" style={{minHeight: '400px'}}>
                <DialogueBox 
                  dialogues={dialogues || []}
                  character={selectedCharacter}
                  isLoading={dialoguesLoading}
                  isTyping={isTyping}
                />
              </CardContent>
            </Card>

            {/* Custom Message Input - Moved Above Choices */}
            <Card className="glass-morphism portal-glow">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                    <span>Type your response:</span>
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCustomMessage();
                        }
                      }}
                      className="w-full glass-morphism border border-border/30 rounded-lg p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all duration-300 resize-none"
                      rows={2}
                      placeholder="Type your custom response here..."
                      maxLength={200}
                      disabled={isTyping || conversationMutation.isPending}
                    />
                    
                    <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {customMessage.length}/200
                      </span>
                      <Button
                        onClick={handleCustomMessage}
                        disabled={!customMessage.trim() || isTyping || conversationMutation.isPending}
                        className="btn-portal"
                        size="sm"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Choice Buttons - Now Below Custom Input */}
            <Card className="glass-morphism portal-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-glow">
                  Quick Responses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div id="choice-buttons" className="relative">
                  <ChoiceButtons 
                    character={selectedCharacter}
                    onChoiceSelect={handleChoiceSelect}
                    disabled={isTyping || conversationMutation.isPending}
                    conversationHistory={dialogues || []}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Easter Eggs */}
        <EasterEggs trigger={lastUserMessage} character={selectedCharacter} />

        {/* Character Reactions */}
        <CharacterReactions 
          character={selectedCharacter} 
          lastMessage={lastUserMessage}
          affectionChange={0} // This could be tracked from dialogue responses
        />

        {/* Random Events */}
        <RandomEvents 
          character={selectedCharacter} 
          conversationHistory={dialogues || []}
          lastMessage={lastUserMessage}
          onEventComplete={(affectionChange) => {
            // Update affection level when random event completes
            if (currentGameState) {
              const newAffection = Math.max(0, Math.min(100, (currentGameState.affectionLevel || 0) + affectionChange));
              // Update the game state with new affection
              queryClient.setQueryData([`/api/game-state/${currentUser?.id || 1}/${selectedCharacter?.id}`], {
                ...currentGameState,
                affectionLevel: newAffection
              });
              
              toast({
                title: affectionChange > 0 ? "Affection Increased!" : "Affection Decreased!",
                description: `${affectionChange > 0 ? '+' : ''}${affectionChange} affection points`,
                variant: affectionChange > 0 ? "default" : "destructive",
              });
            }
          }}
        />

        {/* Save/Load Modal */}
        <SaveLoadModal
          isOpen={showSaveLoad}
          onClose={() => setShowSaveLoad(false)}
          userId={currentUser?.id || 1}
          currentGameState={currentGameState}
          onLoadGame={(gameState) => {
            setGameState(gameState);
            queryClient.invalidateQueries({ queryKey: [`/api/game-state/${currentUser?.id || 1}/${selectedCharacter?.id}`] });
            queryClient.invalidateQueries({ queryKey: [`/api/dialogues/${gameState.id}`] });
          }}
        />

        {/* Backstory Explorer */}
        <BackstoryExplorer
          isOpen={showBackstory}
          onClose={() => setShowBackstory(false)}
          character={selectedCharacter}
          gameState={currentGameState}
          onBackstoryUnlock={(backstoryId) => {
            queryClient.invalidateQueries({ queryKey: [`/api/game-state/${currentUser?.id || 1}/${selectedCharacter?.id}`] });
          }}
        />

        {/* Documentation Modal */}
        <DocumentationModal
          isOpen={showDocumentation}
          onClose={() => setShowDocumentation(false)}
        />
      </div>
    </motion.section>
  );
}
