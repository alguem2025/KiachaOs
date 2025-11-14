/**
 * KIACHA OS - Supreme Cognition Types
 * Definições de tipos para o sistema de cognição suprema
 */

export interface SupremeQuery {
    text: string;
    userId?: string;
    context?: string;
    timestamp?: Date;
    priority?: 'low' | 'normal' | 'high';
}

export interface SupremeResponse {
    text: string;
    domain: string;
    confidence: number;
    reasoning: string;
    emotionalTone: string;
    timestamp: Date;
}

export interface ExpertDomain {
    id: string;
    name: string;
    keywords: string[];
    confidence: number;
    reasoning: 'symbolic' | 'analytical' | 'logical' | 'evidence-based' | 'behavioral' | 'narrative' | 'generative';
    description: string;
}

export interface DomainExpert {
    id: string;
    name: string;
    specialties: string[];
    examples: string[];
}

export interface SkillRoute {
    query: string;
    matchedDomains: {
        domain: string;
        confidence: number;
        reasoning: string;
    }[];
    selectedDomain: string;
    alternativeDomains: string[];
}

export interface FusionContext {
    rawAnswer: string;
    domain: string;
    emotionalState: any;
    personality: string;
    userProfile?: any;
    context?: string;
}

export interface FusedResponse {
    original: string;
    fused: string;
    emotionalAdjustments: string[];
    personalityImpact: string;
    tone: string;
}
