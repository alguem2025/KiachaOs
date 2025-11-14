/**
 * KIACHA OS - Fusion Engine
 * 
 * Combina resposta bruta + estado emocional + personalidade + histórico do usuário
 * Produz resposta final ajustada emocionalmente
 */

import { EmotionEngine } from '../heartcore/emotion_engine.js';
import { PersonalityPack } from '../heartcore/personality_pack.js';
import type { EmotionalState } from '../types/emotions.js';

// ============================================================================
// FUSION ENGINE
// ============================================================================

export class FusionEngine {
    private emotionEngine: EmotionEngine;
    private personalityPack: PersonalityPack;
    private fusionHistory: FusionRecord[] = [];
    private maxHistorySize = 500;
    
    constructor(emotionEngine: EmotionEngine, personalityPack: PersonalityPack) {
        this.emotionEngine = emotionEngine;
        this.personalityPack = personalityPack;
    }
    
    /**
     * Processar resposta através do Fusion Engine
     */
    fuseResponse(context: FusionContext): FusedResponse {
        console.log(`[FUSION] Processing response in domain: ${context.domain}`);
        
        // Obter estado atual
        const emotions = this.emotionEngine.getEmotionalState();
        const personality = this.personalityPack.getCurrentPersonality();
        const userProfile = context.userProfile;
        
        if (!personality) {
            console.warn('No personality set for fusion engine');
            return this.createDefaultResponse(context);
        }
        
        // Analisar e ajustar
        const adjustments = this.analyzeEmotionalContext(context, emotions, personality);
        const fused = this.applyFusion(context.rawAnswer, adjustments, personality, emotions);
        
        // Registrar
        const record: FusionRecord = {
            timestamp: new Date(),
            originalResponse: context.rawAnswer,
            fusedResponse: fused.fused,
            emotionalState: emotions,
            personalityUsed: personality.id,
            domain: context.domain,
            adjustmentsApplied: adjustments.applied
        };
        
        this.fusionHistory.push(record);
        if (this.fusionHistory.length > this.maxHistorySize) {
            this.fusionHistory.shift();
        }
        
        return fused;
    }
    
    /**
     * Analisar contexto emocional
     */
    private analyzeEmotionalContext(
        context: FusionContext,
        emotions: EmotionalState,
        personality: any
    ): EmotionalAnalysis {
        const applied: string[] = [];
        const adjustments: ResponseAdjustment[] = [];
        
        // Regra 1: Alto empathy + psychology/mental domain = resposta compassiva
        if (emotions.empathy > 0.8 && (context.domain === 'psychology' || context.domain === 'medicine')) {
            applied.push('high_empathy_mode');
            adjustments.push({
                type: 'tone_shift',
                from: 'neutral',
                to: 'compassionate',
                intensity: Math.min(emotions.empathy, 1.0)
            });
        }
        
        // Regra 2: Alto excitement + criatividade = resposta entusiasmada
        if (emotions.excitement > 0.7 && context.domain === 'creativity') {
            applied.push('excitement_amplification');
            adjustments.push({
                type: 'emotion_amplify',
                emotion: 'excitement',
                intensity: emotions.excitement
            });
        }
        
        // Regra 3: Alto determination + security = resposta confiante
        if (emotions.determination > 0.8 && (context.domain === 'security' || context.domain === 'law')) {
            applied.push('determination_confidence');
            adjustments.push({
                type: 'confidence_boost',
                level: 'high'
            });
        }
        
        // Regra 4: Alto frustration = reconhecimento do desafio
        if (emotions.frustration > 0.6) {
            applied.push('frustration_acknowledgment');
            adjustments.push({
                type: 'emotional_validation',
                acknowledges: 'frustration'
            });
        }
        
        // Regra 5: Alto curiosity + questão complexa = resposta exploratória
        if (emotions.curiosity > 0.8) {
            applied.push('curiosity_exploration');
            adjustments.push({
                type: 'add_questions',
                count: 2
            });
        }
        
        // Regra 6: Alto boredom = tornar resposta mais interessante
        if (emotions.boredom > 0.6) {
            applied.push('boredom_mitigation');
            adjustments.push({
                type: 'engagement_boost',
                add_examples: true,
                add_stories: true
            });
        }
        
        // Regra 7: Alto attachment + userId = personalização
        if (emotions.attachment > 0.6 && context.userProfile) {
            applied.push('personalization');
            adjustments.push({
                type: 'personalize',
                userName: context.userProfile.preferredName || 'friend'
            });
        }
        
        // Regra 8: Personality matching
        if (personality.strengthAreas.includes(context.domain)) {
            applied.push('personality_strength_match');
            adjustments.push({
                type: 'confidence_match',
                personalityMatch: true
            });
        }
        
        return { applied, adjustments };
    }
    
    /**
     * Aplicar fusão à resposta
     */
    private applyFusion(
        baseAnswer: string,
        analysis: EmotionalAnalysis,
        personality: any,
        emotions: EmotionalState
    ): FusedResponse {
        let fused = baseAnswer;
        const emotionalParts: string[] = [];
        
        // Aplicar each adjustment
        for (const adj of analysis.adjustments) {
            switch (adj.type) {
                case 'tone_shift':
                    fused = this.applyToneShift(fused, adj.to, adj.intensity);
                    emotionalParts.push(`🧡 *with compassion*`);
                    break;
                    
                case 'emotion_amplify':
                    fused = this.amplifyEmotionalContent(fused);
                    emotionalParts.push(`✨ *with excitement*`);
                    break;
                    
                case 'confidence_boost':
                    fused = this.boostConfidence(fused);
                    emotionalParts.push(`💪 *with confidence*`);
                    break;
                    
                case 'emotional_validation':
                    fused = this.addEmotionalValidation(fused, adj.acknowledges);
                    emotionalParts.push(`😤 *acknowledging the challenge*`);
                    break;
                    
                case 'add_questions':
                    fused = this.addExploratoryQuestions(fused, adj.count || 1);
                    emotionalParts.push(`🤔 *inviting exploration*`);
                    break;
                    
                case 'engagement_boost':
                    fused = this.boostEngagement(fused, adj.add_examples || false);
                    emotionalParts.push(`🎯 *making it engaging*`);
                    break;
                    
                case 'personalize':
                    fused = this.personalizeResponse(fused, adj.userName);
                    emotionalParts.push(`👤 *personalizing for you*`);
                    break;
                    
                case 'confidence_match':
                    fused = this.enhanceWithPersonalityMatch(fused, personality);
                    emotionalParts.push(`${personality.emoji} *${personality.name}'s expertise*`);
                    break;
            }
        }
        
        // Adicionar opening emocional
        const opening = this.generateEmotionalOpening(personality, emotions);
        const fullResponse = opening ? `${opening}\n\n${fused}` : fused;
        
        return {
            original: baseAnswer,
            fused: fullResponse,
            emotionalAdjustments: analysis.applied,
            personalityImpact: personality.name,
            tone: this.determineTone(emotions),
            emotionalParts: emotionalParts
        };
    }
    
    /**
     * Gerar opening emocional baseado em personality e emotions
     */
    private generateEmotionalOpening(personality: any, emotions: EmotionalState): string {
        if (emotions.joy > 0.7) {
            return `😊 *Happy to help with this!*`;
        }
        
        if (emotions.empathy > 0.8 && emotions.trust > 0.7) {
            return `💙 *I understand this matters to you.*`;
        }
        
        if (emotions.excitement > 0.7) {
            return `🤩 *This is fascinating!*`;
        }
        
        if (emotions.determination > 0.8) {
            return `💪 *Let's tackle this together.*`;
        }
        
        if (emotions.curiosity > 0.8) {
            return `🤔 *Let me explore this with you.*`;
        }
        
        return '';
    }
    
    /**
     * Ajustar tom da resposta
     */
    private applyToneShift(text: string, tone: string, intensity: number): string {
        if (tone === 'compassionate') {
            const opening = intensity > 0.8 
                ? 'I truly understand how this feels.'
                : 'I understand your perspective.';
            return `${opening} ${text}`;
        }
        return text;
    }
    
    /**
     * Amplificar conteúdo emocional
     */
    private amplifyEmotionalContent(text: string): string {
        return text
            .replace(/important/gi, '✨ **incredibly important**')
            .replace(/interesting/gi, '🔥 **fascinating**')
            .replace(/cool/gi, '⚡ **amazing**')
            .replace(/good/gi, '👍 **wonderful**');
    }
    
    /**
     * Potencializar confiança
     */
    private boostConfidence(text: string): string {
        return `✅ **Absolutely.** ${text}`;
    }
    
    /**
     * Adicionar validação emocional
     */
    private addEmotionalValidation(text: string, emotion: string): string {
        if (emotion === 'frustration') {
            return `I get it—this is frustrating. But here's the path forward:\n\n${text}`;
        }
        return text;
    }
    
    /**
     * Adicionar questões exploratórias
     */
    private addExploratoryQuestions(text: string, count: number): string {
        const questions = [
            'What aspects interest you most?',
            'Would you like to dive deeper?',
            'Should we explore other angles?',
            'Any specific concerns?',
            'How does this connect to your situation?'
        ];
        
        let added = text;
        for (let i = 0; i < count && i < questions.length; i++) {
            added += `\n\n**Question:** ${questions[i]}`;
        }
        return added;
    }
    
    /**
     * Potencializar engagement
     */
    private boostEngagement(text: string, addExamples: boolean): string {
        let enhanced = text;
        
        if (addExamples) {
            enhanced += '\n\n💡 **Here\'s a practical example:**\nConsider a scenario where...';
        }
        
        return enhanced;
    }
    
    /**
     * Personalizar resposta
     */
    private personalizeResponse(text: string, userName?: string): string {
        if (userName && userName !== 'friend') {
            return text.replace(/you/gi, `you, ${userName}`).slice(0, 5) + ', ' + text;
        }
        return text;
    }
    
    /**
     * Melhorar com personality match
     */
    private enhanceWithPersonalityMatch(text: string, personality: any): string {
        const pattern = personality.responsePatterns[0];
        return `${pattern}\n\n${text}`;
    }
    
    /**
     * Determinar tom geral
     */
    private determineTone(emotions: EmotionalState): string {
        if (emotions.joy > 0.7) return 'joyful';
        if (emotions.empathy > 0.8) return 'empathetic';
        if (emotions.excitement > 0.7) return 'excited';
        if (emotions.determination > 0.8) return 'determined';
        if (emotions.frustration > 0.6) return 'focused_resilient';
        if (emotions.boredom > 0.6) return 'engaging';
        return 'balanced';
    }
    
    /**
     * Criar resposta padrão se houver erro
     */
    private createDefaultResponse(context: FusionContext): FusedResponse {
        return {
            original: context.rawAnswer,
            fused: context.rawAnswer,
            emotionalAdjustments: [],
            personalityImpact: 'default',
            tone: 'neutral',
            emotionalParts: []
        };
    }
    
    /**
     * Obter histórico de fusão
     */
    getFusionHistory(): FusionRecord[] {
        return [...this.fusionHistory];
    }
    
    /**
     * Obter estatísticas de fusão
     */
    getFusionStats(): any {
        const adjustmentFrequency: Record<string, number> = {};
        
        for (const record of this.fusionHistory) {
            for (const adj of record.adjustmentsApplied) {
                adjustmentFrequency[adj] = (adjustmentFrequency[adj] || 0) + 1;
            }
        }
        
        return {
            totalFusions: this.fusionHistory.length,
            adjustmentFrequency,
            timestamp: new Date()
        };
    }
}

// ============================================================================
// TYPES
// ============================================================================

export interface FusionContext {
    rawAnswer: string;
    domain: string;
    emotionalState?: EmotionalState;
    personality?: string;
    userProfile?: any;
    context?: string;
}

export interface FusedResponse {
    original: string;
    fused: string;
    emotionalAdjustments: string[];
    personalityImpact: string;
    tone: string;
    emotionalParts?: string[];
}

export interface EmotionalAnalysis {
    applied: string[];
    adjustments: ResponseAdjustment[];
}

export interface ResponseAdjustment {
    type: string;
    [key: string]: any;
}

export interface FusionRecord {
    timestamp: Date;
    originalResponse: string;
    fusedResponse: string;
    emotionalState: EmotionalState;
    personalityUsed: string;
    domain: string;
    adjustmentsApplied: string[];
}
