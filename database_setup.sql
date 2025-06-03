-- Rick and Morty Dating Simulator Database Setup
-- Complete database structure with sample data

-- Users table with global settings
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_picture TEXT,
    global_settings JSONB DEFAULT '{
        "masterVolume": 75,
        "sfxVolume": 50,
        "musicVolume": 25,
        "animationSpeed": "normal",
        "particleEffects": true,
        "portalGlow": true,
        "autosaveFrequency": 5,
        "typingSpeed": "normal",
        "nsfwContent": false,
        "openrouterApiKey": "",
        "aiModel": "deepseek/deepseek-chat-v3-0324:free"
    }'
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    personality TEXT NOT NULL,
    sprite VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    traits TEXT[] NOT NULL,
    emotion_states TEXT[] NOT NULL
);

-- Game states table
CREATE TABLE IF NOT EXISTS game_states (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    affection_level INTEGER DEFAULT 0,
    relationship_status VARCHAR(50) DEFAULT 'stranger',
    conversation_count INTEGER DEFAULT 0,
    current_emotion VARCHAR(50) DEFAULT 'neutral',
    unlocked_backstories TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, character_id)
);

-- Dialogues table
CREATE TABLE IF NOT EXISTS dialogues (
    id SERIAL PRIMARY KEY,
    game_state_id INTEGER NOT NULL REFERENCES game_states(id) ON DELETE CASCADE,
    speaker VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'normal',
    affection_change INTEGER DEFAULT 0,
    emotion_triggered VARCHAR(50),
    backstory_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Save slots table
CREATE TABLE IF NOT EXISTS save_slots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL,
    affection_level INTEGER NOT NULL,
    relationship_status VARCHAR(50) NOT NULL,
    game_state_snapshot JSONB NOT NULL,
    character_name VARCHAR(255) NOT NULL,
    dialogue_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, slot_number)
);

-- Insert default characters
INSERT INTO characters (name, description, personality, sprite, color, traits, emotion_states) VALUES
(
    'Rick Sanchez (C-137)',
    'Genius scientist with drinking problem and zero filter',
    'Sarcastic, brilliant, nihilistic, interdimensional traveler with a drinking problem. Often burps mid-sentence and has zero patience for stupidity.',
    'flask',
    '#00ff41',
    ARRAY['genius', 'alcoholic', 'sarcastic', 'nihilistic', 'scientist'],
    ARRAY['neutral', 'drunk', 'angry', 'excited', 'dismissive', 'amused']
),
(
    'Morty Smith',
    'Anxious teenager dragged into interdimensional adventures',
    'Nervous, honest, sweet, morally conscious teenager who stutters when anxious and genuinely cares about others.',
    'user-graduate',
    '#ffeb3b',
    ARRAY['anxious', 'kind', 'moral', 'innocent', 'stuttering'],
    ARRAY['neutral', 'nervous', 'happy', 'scared', 'confused', 'determined']
),
(
    'Evil Morty',
    'The Morty who escaped the Central Finite Curve',
    'Strategic, calculated, manipulative, intelligent. The most dangerous Morty who orchestrated his escape from Rick''s control.',
    'eye-slash',
    '#ff5722',
    ARRAY['calculating', 'manipulative', 'intelligent', 'cold', 'strategic'],
    ARRAY['neutral', 'smug', 'angry', 'calculating', 'satisfied', 'threatening']
),
(
    'Rick Prime',
    'The Rick who killed C-137''s family',
    'Cold, efficient, superior, villainous. The most ruthless Rick who considers himself above all other Ricks.',
    'skull',
    '#9c27b0',
    ARRAY['ruthless', 'superior', 'cold', 'efficient', 'villainous'],
    ARRAY['neutral', 'superior', 'angry', 'dismissive', 'threatening', 'amused']
) ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_states_user_character ON game_states(user_id, character_id);
CREATE INDEX IF NOT EXISTS idx_dialogues_game_state ON dialogues(game_state_id);
CREATE INDEX IF NOT EXISTS idx_save_slots_user ON save_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_dialogues_timestamp ON dialogues(timestamp);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_game_states_updated_at ON game_states;
CREATE TRIGGER update_game_states_updated_at
    BEFORE UPDATE ON game_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_save_slots_updated_at ON save_slots;
CREATE TRIGGER update_save_slots_updated_at
    BEFORE UPDATE ON save_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();