import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useGameContext } from "@/context/game-context";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  Zap, 
  Eye, 
  Save,
  RotateCcw,
  User
} from "lucide-react";

// Audio manager for real-time volume control
const audioManager = {
  setVolumes: (master: number, sfx: number, music: number) => {
    // Implementation for audio volume control
    console.log(`Setting volumes - Master: ${master}%, SFX: ${sfx}%, Music: ${music}%`);
  }
};

// UI sound effects
const playUISound = (type: string) => {
  console.log(`Playing UI sound: ${type}`);
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { currentUser, gameState, setGameState } = useGameContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const defaultSettings = {
    masterVolume: 75,
    sfxVolume: 85,
    musicVolume: 65,
    animationSpeed: "normal",
    particleEffects: true,
    portalGlow: true,
    autosaveFrequency: 5,
    typingSpeed: "normal",
    nsfwContent: false,
    openrouterApiKey: "",
    aiModel: "deepseek/deepseek-chat-v3-0324:free"
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Get user global settings
  const { data: globalSettings, isLoading: settingsLoading } = useQuery<any>({
    queryKey: [`/api/user/${currentUser?.id || 1}/settings`],
    enabled: !!currentUser?.id,
  });

  // Load settings from global user settings (not per-character)
  useEffect(() => {
    if (globalSettings) {
      console.log("Loading settings from global user settings:", globalSettings);
      setSettings({ ...defaultSettings, ...globalSettings });
    } else if (!settingsLoading) {
      console.log("No global settings found, using defaults");
      setSettings(defaultSettings);
    }
  }, [globalSettings, settingsLoading]);

  // Track changes
  useEffect(() => {
    const originalSettings = globalSettings || defaultSettings;
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, globalSettings]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Update audio volumes immediately when changed
    if (key === 'masterVolume' || key === 'sfxVolume' || key === 'musicVolume') {
      const newSettings = { ...settings, [key]: value };
      audioManager.setVolumes(
        newSettings.masterVolume,
        newSettings.sfxVolume,
        newSettings.musicVolume
      );
      
      // Play test sound for volume feedback
      if (key === 'sfxVolume') {
        playUISound('select');
      }
    }
  };

  // Save settings mutation for global user settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsToSave: any) => {
      console.log("Saving global user settings:", settingsToSave);
      const response = await apiRequest("PUT", `/api/user/${currentUser?.id || 1}/settings`, settingsToSave);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${currentUser?.id || 1}/settings`] });
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved and will persist across all characters.",
      });
      setHasChanges(false);
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    try {
      saveSettingsMutation.mutate(settings);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const updatedGameState = await response.json();
      
      setGameState(updatedGameState);
      // Force reload settings from the updated game state
      setSettings({ ...defaultSettings, ...updatedGameState.settings });
      setHasChanges(false);
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been saved successfully.",
      });
      
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ['/api/game-states'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state', currentUser?.id, gameState.characterId] });
      
    } catch (error: any) {
      console.error("Settings save error:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Profile picture functionality removed for Render compatibility

  const handleReset = () => {
    setSettings(defaultSettings);
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to default values.",
    });
  };

  // Profile picture upload handlers removed

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-morphism/95 border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center">
            <Settings className="w-6 h-6 mr-2 text-primary" />
            Interdimensional Settings Portal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Section - Simplified for Render compatibility */}
            <Card className="glass-morphism/30 border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-secondary-foreground flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  User Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full border-2 border-border overflow-hidden bg-muted/50">
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{currentUser?.username}</div>
                    <div className="text-xs text-muted-foreground">Interdimensional Explorer</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Settings */}
            <Card className="glass-morphism/30 border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-secondary-foreground flex items-center">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Audio Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Master Volume</label>
                      {settings.masterVolume === 0 && <VolumeX className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <span className="text-sm text-muted-foreground min-w-[3ch]">
                      {settings.masterVolume}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.masterVolume]}
                    onValueChange={([value]) => handleSettingChange('masterVolume', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Sound Effects</label>
                    <span className="text-sm text-muted-foreground min-w-[3ch]">
                      {settings.sfxVolume}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.sfxVolume]}
                    onValueChange={([value]) => handleSettingChange('sfxVolume', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Background Music</label>
                    <span className="text-sm text-muted-foreground min-w-[3ch]">
                      {settings.musicVolume}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.musicVolume]}
                    onValueChange={([value]) => handleSettingChange('musicVolume', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI & API Settings */}
          <Card className="glass-morphism/30 border-border/30">
            <CardHeader>
              <CardTitle className="text-lg text-secondary-foreground flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                AI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">OpenRouter API Key</label>
                  <p className="text-xs text-muted-foreground mb-2">Required for character conversations. Get your key from openrouter.ai</p>
                  <input
                    type="password"
                    value={settings.openrouterApiKey}
                    onChange={(e) => handleSettingChange('openrouterApiKey', e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">AI Model</label>
                  <p className="text-xs text-muted-foreground mb-2">Choose the AI model for character responses</p>
                  <Select value={settings.aiModel} onValueChange={(value) => handleSettingChange('aiModel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek/deepseek-chat-v3-0324:free">DeepSeek Chat v3</SelectItem>
                      <SelectItem value="deepseek/deepseek-r1-0528:free">DeepSeek R1 0528</SelectItem>
                      <SelectItem value="deepseek/deepseek-r1:free">DeepSeek R1</SelectItem>
                      <SelectItem value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash</SelectItem>
                      <SelectItem value="deepseek/deepseek-chat:free">DeepSeek Chat</SelectItem>
                      <SelectItem value="google/gemma-3-27b-it:free">Gemma 3 27B</SelectItem>
                      <SelectItem value="mistralai/mistral-nemo:free">Mistral Nemo</SelectItem>
                      <SelectItem value="meta-llama/llama-4-maverick:free">Llama 4 Maverick</SelectItem>
                      <SelectItem value="mistralai/mistral-7b-instruct:free">Mistral 7B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual & Performance Settings */}
          <Card className="glass-morphism/30 border-border/30">
            <CardHeader>
              <CardTitle className="text-lg text-secondary-foreground flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Visual & Performance Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Animation Speed</label>
                  <Select value={settings.animationSpeed} onValueChange={(value) => handleSettingChange('animationSpeed', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="instant">Instant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Typing Speed</label>
                  <Select value={settings.typingSpeed} onValueChange={(value) => handleSettingChange('typingSpeed', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="instant">Instant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Autosave Frequency</label>
                  <Select value={settings.autosaveFrequency.toString()} onValueChange={(value) => handleSettingChange('autosaveFrequency', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every minute</SelectItem>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="10">Every 10 minutes</SelectItem>
                      <SelectItem value="0">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Particle Effects</label>
                  <Switch
                    checked={settings.particleEffects}
                    onCheckedChange={(checked) => handleSettingChange('particleEffects', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Portal Glow</label>
                  <Switch
                    checked={settings.portalGlow}
                    onCheckedChange={(checked) => handleSettingChange('portalGlow', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Mature Content</label>
                  <Switch
                    checked={settings.nsfwContent}
                    onCheckedChange={(checked) => handleSettingChange('nsfwContent', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </Button>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}