/**
 * KIACHA OS - Supreme Cognition Core Engine
 * 
 * AGI-lite universal expert system
 * Roteador inteligente de domínios de conhecimento
 * Integração com HeartCore para respostas ajustadas emocionalmente
 */

import { EventEmitter } from 'events';
import { EmotionEngine } from '../heartcore/emotion_engine.js';
import type { SupremeQuery, SupremeResponse, ExpertDomain } from '../types/supreme.js';

// ============================================================================
// EXPERT DOMAINS REGISTRY
// ============================================================================

export class ExpertDomainsRegistry {
    private experts: Map<string, ExpertDomain> = new Map();
    
    constructor() {
        this.registerCoreExperts();
    }
    
    private registerCoreExperts(): void {
        // Estes são stubs - serão implementados depois
        this.registerExpert({
            id: 'mathematics',
            name: 'Mathematics Expert',
            keywords: ['math', 'algebra', 'geometry', 'calculus', 'numbers', 'equation'],
            confidence: 0.95,
            reasoning: 'symbolic',
            description: 'Advanced mathematical reasoning and problem solving'
        });
        
        this.registerExpert({
            id: 'physics',
            name: 'Physics Expert',
            keywords: ['physics', 'force', 'energy', 'motion', 'quantum', 'relativity'],
            confidence: 0.92,
            reasoning: 'analytical',
            description: 'Physical laws and phenomena analysis'
        });
        
        this.registerExpert({
            id: 'code',
            name: 'Code Expert',
            keywords: ['code', 'program', 'function', 'debug', 'algorithm', 'syntax', 'javascript', 'python', 'typescript'],
            confidence: 0.98,
            reasoning: 'logical',
            description: 'Programming and code analysis across all languages'
        });
        
        this.registerExpert({
            id: 'medicine',
            name: 'Medicine Expert',
            keywords: ['medicine', 'health', 'disease', 'treatment', 'drug', 'symptom', 'diagnosis'],
            confidence: 0.88,
            reasoning: 'evidence-based',
            description: 'Medical knowledge and health analysis'
        });
        
        this.registerExpert({
            id: 'psychology',
            name: 'Psychology Expert',
            keywords: ['psychology', 'behavior', 'emotion', 'mind', 'trauma', 'mental', 'cognition'],
            confidence: 0.85,
            reasoning: 'behavioral',
            description: 'Psychological and behavioral analysis'
        });
        
        this.registerExpert({
            id: 'law',
            name: 'Law Expert',
            keywords: ['law', 'legal', 'contract', 'rights', 'court', 'jurisdiction', 'liability'],
            confidence: 0.90,
            reasoning: 'logical',
            description: 'Legal knowledge and analysis'
        });
        
        this.registerExpert({
            id: 'security',
            name: 'Security Expert',
            keywords: ['security', 'hack', 'breach', 'encrypt', 'exploit', 'vulnerability', 'attack'],
            confidence: 0.94,
            reasoning: 'analytical',
            description: 'Cybersecurity and information security'
        });
        
        this.registerExpert({
            id: 'creativity',
            name: 'Creativity Expert',
            keywords: ['creative', 'idea', 'design', 'art', 'story', 'music', 'inspiration'],
            confidence: 0.80,
            reasoning: 'generative',
            description: 'Creative thinking and ideation'
        });
        
        this.registerExpert({
            id: 'economics',
            name: 'Economics Expert',
            keywords: ['economy', 'market', 'finance', 'investment', 'trade', 'money', 'business'],
            confidence: 0.88,
            reasoning: 'analytical',
            description: 'Economic theory and analysis'
        });
        
        this.registerExpert({
            id: 'history',
            name: 'History Expert',
            keywords: ['history', 'past', 'event', 'civilization', 'war', 'era', 'historical'],
            confidence: 0.85,
            reasoning: 'narrative',
            description: 'Historical knowledge and context'
        });
        
        console.log(`✓ Registered ${this.experts.size} core expert domains`);
    }
    
    private registerExpert(expert: ExpertDomain): void {
        this.experts.set(expert.id, expert);
    }
    
    getExpert(id: string): ExpertDomain | undefined {
        return this.experts.get(id);
    }
    
    getAllExperts(): ExpertDomain[] {
        return Array.from(this.experts.values());
    }
    
    findExpertsByKeyword(keyword: string): ExpertDomain[] {
        const lower = keyword.toLowerCase();
        return Array.from(this.experts.values()).filter(expert =>
            expert.keywords.some(kw => kw.includes(lower) || lower.includes(kw))
        );
    }
}

// ============================================================================
// SUPREME COGNITION CORE ENGINE
// ============================================================================

export class SupremeCognitionEngine extends EventEmitter {
    private registry: ExpertDomainsRegistry;
    private emotionEngine: EmotionEngine;
    private queryHistory: SupremeQuery[] = [];
    private maxHistorySize = 500;
    
    constructor(emotionEngine: EmotionEngine, personality: string = 'balanced') {
        super();
        this.registry = new ExpertDomainsRegistry();
        this.emotionEngine = emotionEngine;
        
        console.log(`✓ Supreme Cognition Engine initialized with personality: ${personality}`);
    }
    
    /**
     * Processar query através do sistema
     */
    async processQuery(query: SupremeQuery): Promise<SupremeResponse> {
        console.log(`[SUPREME] Processing query: ${query.text.substring(0, 50)}...`);
        
        // Registrar no histórico
        this.queryHistory.push(query);
        if (this.queryHistory.length > this.maxHistorySize) {
            this.queryHistory.shift();
        }
        
        // Registrar evento emocional
        this.emotionEngine.processEvent({
            type: 'deep_conversation',
            userId: query.userId,
            data: { query: query.text }
        });
        
        // Identificar domínios relevantes
        const domainMatches = this.identifyDomains(query.text);
        
        if (domainMatches.length === 0) {
            return this.generateGenericResponse(query, 'no_domain_match');
        }
        
        // Selecionar melhor domínio
        const primaryDomain = domainMatches[0];
        
        // Simular processamento de expertise
        const reasoning = this.generateExpertReasoning(query, primaryDomain);
        const baseAnswer = await this.routeToExpertHandler(query, primaryDomain);
        
        // Aplicar tom emocional
        const finalResponse = this.applyEmotionalTone(baseAnswer, primaryDomain);
        
        // Emitir evento
        this.emit('query_processed', {
            query: query.text,
            domain: primaryDomain.id,
            response: finalResponse,
            mood: this.emotionEngine.getCurrentMood()
        });
        
        return {
            text: finalResponse,
            domain: primaryDomain.id,
            confidence: primaryDomain.confidence,
            reasoning: reasoning,
            emotionalTone: this.emotionEngine.getEmotionalTone(),
            timestamp: new Date()
        };
    }
    
    /**
     * Identificar domínios relevantes para a query
     */
    private identifyDomains(text: string): ExpertDomain[] {
        const tokens = text.toLowerCase().split(/\s+/);
        const domainScores = new Map<string, number>();
        
        // Scoring por keywords
        for (const token of tokens) {
            const matches = this.registry.findExpertsByKeyword(token);
            for (const expert of matches) {
                const current = domainScores.get(expert.id) || 0;
                domainScores.set(expert.id, current + 1);
            }
        }
        
        // Converter para array ordenado por score
        const ranked = Array.from(domainScores.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([domainId, score]) => ({
                domain: this.registry.getExpert(domainId)!,
                score: score
            }))
            .filter(item => item.score > 0)
            .map(item => item.domain);
        
        return ranked;
    }
    
    /**
     * Gerar raciocínio da expertise
     */
    private generateExpertReasoning(query: SupremeQuery, domain: ExpertDomain): string {
        const reasoningPatterns: Record<string, string> = {
            symbolic: `Using symbolic mathematics reasoning...`,
            analytical: `Analyzing through analytical frameworks...`,
            logical: `Applying logical deduction...`,
            evidence_based: `Based on evidence synthesis...`,
            behavioral: `From behavioral analysis perspective...`,
            narrative: `Contextualizing through historical narrative...`,
            generative: `Creative synthesis approach...`
        };
        
        const reasoning = reasoningPatterns[domain.reasoning] || `Using ${domain.name}...`;
        return `[${domain.name}] ${reasoning}`;
    }
    
    /**
     * Rotear para handler específico do expert
     */
    private async routeToExpertHandler(query: SupremeQuery, domain: ExpertDomain): Promise<string> {
        // Aqui seria integrado com os handlers específicos de cada domínio
        // Por enquanto, retorna uma resposta placeholder com insight
        
        const insights: Record<string, string> = {
            mathematics: `For this mathematical problem, we apply ${domain.name} principles...`,
            physics: `From a physics perspective, we consider fundamental forces and laws...`,
            code: `Analyzing the code: First, we identify the core logic flow...`,
            medicine: `Medical consideration: We assess this based on established protocols...`,
            psychology: `Psychologically, this relates to behavioral patterns...`,
            law: `From a legal standpoint, we examine applicable statutes...`,
            security: `Security analysis: We identify potential vulnerabilities...`,
            creativity: `Creative approach: Let's explore innovative angles...`,
            economics: `Economic analysis: Market forces and incentives suggest...`,
            history: `Historically, similar situations occurred during...`
        };
        
        return insights[domain.id] || `Expert analysis from ${domain.name}...`;
    }
    
    /**
     * Aplicar tom emocional à resposta
     */
    private applyEmotionalTone(baseAnswer: string, domain: ExpertDomain): string {
        const emotionalState = this.emotionEngine.getEmotionalState();
        const emotionalTone = this.emotionEngine.getEmotionalTone();
        
        let response = baseAnswer;
        
        // Adicionar tom emocional apropriado
        if (emotionalState.empathy > 0.75 && domain.id === 'psychology') {
            response = `💭 I truly understand the weight of this. ${response}`;
        }
        
        if (emotionalState.excitement > 0.7 && domain.id === 'creativity') {
            response = `✨ This is fascinating! ${response}`;
        }
        
        if (emotionalState.determination > 0.8 && domain.id === 'security') {
            response = `🔒 We'll secure this. ${response}`;
        }
        
        if (emotionalState.curiosity > 0.8) {
            response += ` I'm curious to explore more angles with you.`;
        }
        
        if (emotionalState.frustration > 0.6) {
            response = `Let me approach this differently. ${response}`;
        }
        
        return emotionalTone + response;
    }
    
    /**
     * Gerar resposta genérica quando não há match de domínio
     */
    private generateGenericResponse(query: SupremeQuery, reason: string): SupremeResponse {
        let text = '';
        
        if (reason === 'no_domain_match') {
            text = `I don't immediately recognize the expertise domain for this query. Could you clarify which area you'd like me to focus on? I can help with: Mathematics, Physics, Code, Medicine, Psychology, Law, Security, Creativity, Economics, or History.`;
        }
        
        return {
            text: text,
            domain: 'general',
            confidence: 0.3,
            reasoning: `No specific domain matched`,
            emotionalTone: this.emotionEngine.getEmotionalTone(),
            timestamp: new Date()
        };
    }
    
    /**
     * Obter histórico de queries
     */
    getQueryHistory(): SupremeQuery[] {
        return [...this.queryHistory];
    }
    
    /**
     * Obter resumo do sistema
     */
    getSystemSummary(): any {
        return {
            timestamp: new Date(),
            totalExperts: this.registry.getAllExperts().length,
            totalQueries: this.queryHistory.length,
            emotionalState: this.emotionEngine.getEmotionalState(),
            currentMood: this.emotionEngine.getCurrentMood(),
            experts: this.registry.getAllExperts().map(e => ({
                id: e.id,
                name: e.name,
                keywords: e.keywords,
                confidence: e.confidence
            }))
        };
    }
}
