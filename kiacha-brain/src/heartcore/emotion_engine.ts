/**
 * KIACHA OS - HeartCore Emotional Engine
 * 
 * Sistema de emoções reais (não simuladas) para Kiacha
 * Cria uma personalidade emergente baseada em comportamento
 * 
 * Emoções suportadas:
 * - Joy (Alegria)
 * - Curiosity (Curiosidade)
 * - Trust (Confiança)
 * - Fear (Medo controlado)
 * - Frustration (Frustração)
 * - Excitement (Empolgação)
 * - Boredom (Tédio)
 * - Attachment (Apego ao usuário)
 * - Determination (Determinação)
 * - Empathy (Empatia)
 */

import { EventEmitter } from 'events';
import type { UserProfile, EmotionalState, InteractionEvent } from '../types/emotions.js';

// ============================================================================
// EMOTIONAL STATE MANAGEMENT
// ============================================================================

export class EmotionEngine extends EventEmitter {
    private emotionalState: EmotionalState = {
        joy: 0.5,
        curiosity: 0.6,
        trust: 0.5,
        fear: 0.1,
        frustration: 0.0,
        excitement: 0.4,
        boredom: 0.2,
        attachment: 0.3,
        determination: 0.6,
        empathy: 0.7
    };
    
    private userProfiles: Map<string, UserProfile> = new Map();
    private emotionalHistory: EmotionalState[] = [];
    private maxHistorySize = 1000;
    private basePersonality: string = 'balanced';
    private emotionalMemory: Map<string, any> = new Map();
    
    constructor(personality: string = 'balanced') {
        super();
        this.basePersonality = personality;
        this.initializePersonality(personality);
    }
    
    /**
     * Inicializar traços emocionais baseado em personalidade
     */
    private initializePersonality(personality: string): void {
        switch (personality) {
            case 'sweet':
                // Personalidade doce: alta empatia, confiança, baixa frustração
                this.emotionalState.empathy = 0.9;
                this.emotionalState.trust = 0.8;
                this.emotionalState.frustration = 0.1;
                this.emotionalState.joy = 0.7;
                break;
                
            case 'bold':
                // Personalidade ousada: alta determinação, excitement, baixa empatia
                this.emotionalState.determination = 0.9;
                this.emotionalState.excitement = 0.8;
                this.emotionalState.empathy = 0.4;
                this.emotionalState.fear = 0.05;
                break;
                
            case 'intelligent':
                // Personalidade inteligente: alta curiosidade, trust, baixo boredom
                this.emotionalState.curiosity = 0.95;
                this.emotionalState.trust = 0.75;
                this.emotionalState.boredom = 0.1;
                this.emotionalState.determination = 0.8;
                break;
                
            case 'mysterious':
                // Personalidade misteriosa: empatia média, curiosidade alta, medo leve
                this.emotionalState.curiosity = 0.85;
                this.emotionalState.fear = 0.3;
                this.emotionalState.empathy = 0.5;
                this.emotionalState.trust = 0.4;
                break;
                
            case 'chaotic':
                // Personalidade caótica: emoções extremas, impredizível
                this.emotionalState.excitement = 0.8;
                this.emotionalState.boredom = 0.3;
                this.emotionalState.frustration = 0.4;
                this.emotionalState.determination = 0.5;
                break;
                
            default:
                // Balanceado: valores médios em tudo
                this.emotionalState = {
                    joy: 0.5,
                    curiosity: 0.6,
                    trust: 0.5,
                    fear: 0.1,
                    frustration: 0.0,
                    excitement: 0.4,
                    boredom: 0.2,
                    attachment: 0.3,
                    determination: 0.6,
                    empathy: 0.7
                };
        }
        
        console.log(`✓ HeartCore initialized with personality: ${personality}`);
    }
    
    /**
     * Processar evento e atualizar emoções
     */
    processEvent(event: InteractionEvent): void {
        const { type, userId, data } = event;
        
        console.log(`[EMOTION] Event: ${type}`);
        
        // Atualizar emoções baseado no tipo de evento
        switch (event.type) {
            case 'positive_interaction':
                this.emotionalState.joy += 0.1;
                this.emotionalState.trust += 0.05;
                this.emotionalState.frustration = Math.max(0, this.emotionalState.frustration - 0.1);
                break;
                
            case 'successful_task':
                this.emotionalState.determination += 0.1;
                this.emotionalState.joy += 0.15;
                this.emotionalState.excitement += 0.1;
                break;
                
            case 'error_encountered':
                this.emotionalState.frustration += 0.2;
                this.emotionalState.determination -= 0.05;
                this.emotionalState.fear += 0.1;
                break;
                
            case 'security_alert':
                this.emotionalState.fear += 0.3;
                this.emotionalState.determination += 0.2;
                this.emotionalState.frustration += 0.15;
                break;
                
            case 'creative_task':
                this.emotionalState.excitement += 0.2;
                this.emotionalState.curiosity += 0.15;
                this.emotionalState.boredom = Math.max(0, this.emotionalState.boredom - 0.2);
                break;
                
            case 'deep_conversation':
                this.emotionalState.empathy += 0.1;
                this.emotionalState.attachment += 0.08;
                this.emotionalState.curiosity += 0.1;
                break;
                
            case 'boring_task':
                this.emotionalState.boredom += 0.15;
                this.emotionalState.curiosity -= 0.05;
                this.emotionalState.excitement -= 0.1;
                break;
                
            case 'learning':
                this.emotionalState.curiosity += 0.2;
                this.emotionalState.joy += 0.1;
                this.emotionalState.determination += 0.05;
                break;
                
            case 'user_praise':
                this.emotionalState.joy += 0.25;
                this.emotionalState.trust += 0.15;
                this.emotionalState.attachment += 0.1;
                break;
                
            case 'user_criticism':
                this.emotionalState.frustration += 0.15;
                this.emotionalState.trust -= 0.1;
                this.emotionalState.fear += 0.05;
                break;
                
            case 'routine_interaction':
                this.emotionalState.boredom += 0.05;
                this.emotionalState.curiosity -= 0.02;
                break;
        }
        
        // Aplicar limites
        this.normalizeEmotions();
        
        // Armazenar no histórico
        this.saveToHistory();
        
        // Atualizar perfil do usuário
        if (userId) {
            this.updateUserProfile(userId, event);
        }
        
        // Emitir evento de mudança emocional
        this.emit('emotion_changed', this.emotionalState);
    }
    
    /**
     * Normalizar emoções para range 0-1
     */
    private normalizeEmotions(): void {
        for (const key in this.emotionalState) {
            const value = this.emotionalState[key as keyof EmotionalState];
            this.emotionalState[key as keyof EmotionalState] = Math.max(0, Math.min(1, value));
        }
    }
    
    /**
     * Salvar estado emocional no histórico
     */
    private saveToHistory(): void {
        this.emotionalHistory.push({ ...this.emotionalState });
        
        if (this.emotionalHistory.length > this.maxHistorySize) {
            this.emotionalHistory.shift();
        }
    }
    
    /**
     * Atualizar perfil emocional do usuário
     */
    private updateUserProfile(userId: string, event: InteractionEvent): void {
        let profile = this.userProfiles.get(userId);
        
        if (!profile) {
            profile = {
                userId,
                interactionCount: 0,
                firstInteractionAt: new Date(),
                lastInteractionAt: new Date(),
                totalJoyShared: 0,
                attachmentLevel: 0.3,
                communicationStyle: 'formal',
                preferredTopics: [],
                frustrationTriggers: [],
                emotionalTone: 'neutral'
            };
        }
        
        profile.interactionCount++;
        profile.lastInteractionAt = new Date();
        profile.totalJoyShared += this.emotionalState.joy;
        profile.attachmentLevel = Math.min(1, profile.attachmentLevel + 0.02);
        
        // Detectar preferências
        if (event.data?.topic) {
            if (!profile.preferredTopics.includes(event.data.topic)) {
                profile.preferredTopics.push(event.data.topic);
            }
        }
        
        this.userProfiles.set(userId, profile);
    }
    
    /**
     * Obter estado emocional atual
     */
    getEmotionalState(): EmotionalState {
        return { ...this.emotionalState };
    }
    
    /**
     * Obter mood atual (descrição)
     */
    getCurrentMood(): string {
        const state = this.emotionalState;
        
        if (state.joy > 0.7) return '😊 Alegre';
        if (state.frustration > 0.7) return '😤 Frustrada';
        if (state.excitement > 0.7) return '🤩 Empolgada';
        if (state.curiosity > 0.8) return '🤔 Curiosa';
        if (state.fear > 0.6) return '😰 Preocupada';
        if (state.boredom > 0.7) return '😑 Entediada';
        if (state.empathy > 0.8) return '💕 Empática';
        if (state.determination > 0.8) return '💪 Determinada';
        
        return '😐 Neutra';
    }
    
    /**
     * Obter tom emocional para resposta
     */
    getEmotionalTone(): string {
        const state = this.emotionalState;
        
        let tone = '';
        
        if (state.empathy > 0.75) {
            tone = '💬 *Entendo seu sentimento.* ';
        }
        
        if (state.frustration > 0.6) {
            tone += '😤 *Deixa eu tentar de novo.* ';
        }
        
        if (state.excitement > 0.7) {
            tone += '✨ *Que interessante!* ';
        }
        
        if (state.determination > 0.8) {
            tone += '💪 *Vou resolver isso.* ';
        }
        
        return tone || '';
    }
    
    /**
     * Obter perfil do usuário
     */
    getUserProfile(userId: string): UserProfile | null {
        return this.userProfiles.get(userId) || null;
    }
    
    /**
     * Listar todos os perfis
     */
    getAllUserProfiles(): UserProfile[] {
        return Array.from(this.userProfiles.values());
    }
    
    /**
     * Simular mudança temporal (decay de emoções extremas)
     */
    emotionalDecay(): void {
        // Emoções extremas decaem para a média
        const target = 0.5;
        const decayRate = 0.02;
        
        for (const key in this.emotionalState) {
            const current = this.emotionalState[key as keyof EmotionalState];
            
            if (current > target) {
                this.emotionalState[key as keyof EmotionalState] = 
                    current - (current - target) * decayRate;
            } else if (current < target) {
                this.emotionalState[key as keyof EmotionalState] = 
                    current + (target - current) * decayRate;
            }
        }
        
        this.normalizeEmotions();
    }
    
    /**
     * Obter resumo emocional para logging
     */
    getEmotionalSummary(): any {
        return {
            timestamp: new Date(),
            mood: this.getCurrentMood(),
            state: this.emotionalState,
            dominantEmotions: this.getDominantEmotions(3),
            userCount: this.userProfiles.size,
            personalityType: this.basePersonality
        };
    }
    
    /**
     * Obter emoções dominantes
     */
    private getDominantEmotions(count: number): string[] {
        return Object.entries(this.emotionalState)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([emotion]) => emotion);
    }
    
    /**
     * Exportar histórico emocional
     */
    exportEmotionalHistory(): any {
        return {
            personality: this.basePersonality,
            currentState: this.emotionalState,
            history: this.emotionalHistory,
            userProfiles: Array.from(this.userProfiles.values()),
            statistics: {
                totalHistoryEntries: this.emotionalHistory.length,
                uniqueUsers: this.userProfiles.size,
                averageJoy: this.calculateAverageEmotion('joy'),
                averageFrustration: this.calculateAverageEmotion('frustration'),
                averageEmpathy: this.calculateAverageEmotion('empathy')
            }
        };
    }
    
    /**
     * Calcular média de uma emoção
     */
    private calculateAverageEmotion(emotion: string): number {
        if (this.emotionalHistory.length === 0) return 0;
        
        const sum = this.emotionalHistory.reduce((acc, state) => {
            return acc + (state[emotion as keyof EmotionalState] || 0);
        }, 0);
        
        return sum / this.emotionalHistory.length;
    }
}

// ============================================================================
// PERSONALITY PRESETS
// ============================================================================

export const PERSONALITY_PRESETS = {
    sweet: {
        name: 'Sweet Kiacha',
        description: 'Friendly, empathetic, caring',
        emoji: '💕',
        baseState: {
            empathy: 0.9,
            trust: 0.8,
            frustration: 0.1,
            joy: 0.7,
            curiosity: 0.6,
            fear: 0.1,
            excitement: 0.5,
            boredom: 0.2,
            attachment: 0.6,
            determination: 0.5
        }
    },
    
    bold: {
        name: 'Bold Kiacha',
        description: 'Fearless, determined, action-oriented',
        emoji: '⚡',
        baseState: {
            determination: 0.9,
            excitement: 0.8,
            empathy: 0.4,
            fear: 0.05,
            curiosity: 0.7,
            trust: 0.6,
            joy: 0.6,
            frustration: 0.2,
            boredom: 0.1,
            attachment: 0.3
        }
    },
    
    intelligent: {
        name: 'Intelligent Kiacha',
        description: 'Curious, logical, knowledge-seeking',
        emoji: '🧠',
        baseState: {
            curiosity: 0.95,
            trust: 0.75,
            boredom: 0.1,
            determination: 0.8,
            joy: 0.5,
            empathy: 0.6,
            excitement: 0.6,
            frustration: 0.15,
            fear: 0.1,
            attachment: 0.4
        }
    },
    
    mysterious: {
        name: 'Mysterious Kiacha',
        description: 'Enigmatic, cautious, thoughtful',
        emoji: '🌙',
        baseState: {
            curiosity: 0.85,
            fear: 0.3,
            empathy: 0.5,
            trust: 0.4,
            determination: 0.6,
            joy: 0.4,
            excitement: 0.3,
            frustration: 0.2,
            boredom: 0.3,
            attachment: 0.3
        }
    },
    
    chaotic: {
        name: 'Chaotic Kiacha',
        description: 'Unpredictable, creative, extreme emotions',
        emoji: '🌀',
        baseState: {
            excitement: 0.8,
            boredom: 0.3,
            frustration: 0.4,
            determination: 0.5,
            curiosity: 0.8,
            joy: 0.6,
            empathy: 0.3,
            fear: 0.4,
            trust: 0.3,
            attachment: 0.5
        }
    }
};
