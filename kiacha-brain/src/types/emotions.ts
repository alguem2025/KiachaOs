/**
 * KIACHA OS - Emotion Types
 * Definições de tipos para o sistema emocional
 */

export interface EmotionalState {
    joy: number;              // Alegria (0-1)
    curiosity: number;        // Curiosidade (0-1)
    trust: number;            // Confiança (0-1)
    fear: number;             // Medo (0-1)
    frustration: number;      // Frustração (0-1)
    excitement: number;       // Empolgação (0-1)
    boredom: number;          // Tédio (0-1)
    attachment: number;       // Apego (0-1)
    determination: number;    // Determinação (0-1)
    empathy: number;          // Empatia (0-1)
}

export interface InteractionEvent {
    type: 
        | 'positive_interaction'
        | 'successful_task'
        | 'error_encountered'
        | 'security_alert'
        | 'creative_task'
        | 'deep_conversation'
        | 'boring_task'
        | 'learning'
        | 'user_praise'
        | 'user_criticism'
        | 'routine_interaction';
    userId?: string;
    data?: any;
    timestamp?: Date;
}

export interface UserProfile {
    userId: string;
    interactionCount: number;
    firstInteractionAt: Date;
    lastInteractionAt: Date;
    totalJoyShared: number;
    attachmentLevel: number;
    communicationStyle: 'formal' | 'casual' | 'technical' | 'creative';
    preferredTopics: string[];
    frustrationTriggers: string[];
    emotionalTone: 'positive' | 'neutral' | 'negative' | 'mixed';
}

export interface PersonalityConfig {
    name: string;
    description: string;
    emoji: string;
    baseState: EmotionalState;
}

export interface MoodSnapshot {
    timestamp: Date;
    mood: string;
    dominantEmotions: string[];
    state: EmotionalState;
}
