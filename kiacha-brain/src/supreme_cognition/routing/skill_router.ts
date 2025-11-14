/**
 * KIACHA OS - Skill Router & NLP
 * 
 * Roteador inteligente baseado em NLP
 * Detecta automaticamente o domínio de expertise necessário
 * Suporta queries multi-domínio
 */

export class SkillRouter {
    private domainPatterns: Map<string, RegExp[]> = new Map();
    private contextMemory: Map<string, string[]> = new Map();
    private maxMemorySize = 100;
    
    constructor() {
        this.initializeDomainPatterns();
    }
    
    /**
     * Inicializar padrões de reconhecimento de domínios
     */
    private initializeDomainPatterns(): void {
        // Mathematics patterns
        this.domainPatterns.set('mathematics', [
            /\b(math|algebra|geometry|calculus|equation|formula|theorem|proof|derivative|integral|matrix|vector)\b/i,
            /\b(solve|calculate|compute|simplify|expand|factor|transpose|determinant)\b/i,
            /\b(number|polynomial|function|variable|coefficient|exponent|radical)\b/i
        ]);
        
        // Physics patterns
        this.domainPatterns.set('physics', [
            /\b(physics|force|energy|momentum|velocity|acceleration|quantum|relativity|gravity)\b/i,
            /\b(newton|einstein|photon|electron|wave|particle|thermodynamic|pressure|temperature)\b/i,
            /\b(motion|collision|friction|resistance|field|charge|magnetic|electric)\b/i
        ]);
        
        // Code patterns
        this.domainPatterns.set('code', [
            /\b(code|program|function|variable|loop|condition|array|object|class|interface)\b/i,
            /\b(javascript|typescript|python|java|rust|cpp|csharp|golang|ruby|php)\b/i,
            /\b(debug|bug|error|exception|compile|runtime|syntax|logic|algorithm)\b/i,
            /\b(function|method|parameter|return|scope|closure|promise|async|callback)\b/i
        ]);
        
        // Medicine patterns
        this.domainPatterns.set('medicine', [
            /\b(medicine|medical|health|disease|treatment|drug|medication|symptom|diagnosis)\b/i,
            /\b(patient|doctor|hospital|surgery|therapy|vaccine|virus|bacteria|infection)\b/i,
            /\b(pain|fever|cough|dizziness|nausea|therapy|prescription|dosage)\b/i
        ]);
        
        // Psychology patterns
        this.domainPatterns.set('psychology', [
            /\b(psychology|psycholog|behavior|emotion|mind|mental|trauma|therapy|counseling)\b/i,
            /\b(anxiety|depression|stress|personality|cognition|perception|memory|learning)\b/i,
            /\b(relationship|attachment|motivation|psyche|unconscious|conscious|subconscious)\b/i
        ]);
        
        // Law patterns
        this.domainPatterns.set('law', [
            /\b(law|legal|court|judge|attorney|lawyer|contract|lawsuit|trial)\b/i,
            /\b(right|liability|statute|regulation|jurisdiction|precedent|defendant|plaintiff)\b/i,
            /\b(agreement|clause|copyright|patent|intellectual property|license)\b/i
        ]);
        
        // Security patterns
        this.domainPatterns.set('security', [
            /\b(security|hack|breach|encrypt|encryption|decrypt|exploit|vulnerability|attack)\b/i,
            /\b(malware|virus|ransomware|phishing|botnet|trojan|worm|backdoor)\b/i,
            /\b(firewall|password|authentication|authorization|ssl|certificate|protocol)\b/i
        ]);
        
        // Creativity patterns
        this.domainPatterns.set('creativity', [
            /\b(creative|create|design|art|artistic|music|story|writing|brainstorm|idea)\b/i,
            /\b(imagine|inspiration|vision|concept|innovate|novel|unique|original)\b/i,
            /\b(compose|paint|draw|write|perform|express|emotion|feeling)\b/i
        ]);
        
        // Economics patterns
        this.domainPatterns.set('economics', [
            /\b(econom|market|finance|investment|trade|commerce|business|profit|loss)\b/i,
            /\b(stock|bond|currency|exchange|inflation|deflation|gdp|revenue|expense)\b/i,
            /\b(supply|demand|price|value|capital|labor|competition|monopoly)\b/i
        ]);
        
        // History patterns
        this.domainPatterns.set('history', [
            /\b(history|historical|past|era|period|century|war|battle|revolution)\b/i,
            /\b(ancient|medieval|modern|contemporary|civilization|empire|dynasty)\b/i,
            /\b(event|date|year|king|queen|leader|conquest|discovery|explorer)\b/i
        ]);
        
        console.log(`✓ Initialized ${this.domainPatterns.size} domain patterns`);
    }
    
    /**
     * Rotear query para domínios apropriados
     */
    routeQuery(query: string, userId?: string): RoutingResult {
        console.log(`[ROUTER] Analyzing query: "${query.substring(0, 50)}..."`);
        
        const matches: DomainMatch[] = [];
        
        // Testar cada padrão de domínio
        for (const [domain, patterns] of this.domainPatterns.entries()) {
            let score = 0;
            
            for (const pattern of patterns) {
                const results = query.match(pattern);
                if (results) {
                    score += results.length;
                }
            }
            
            if (score > 0) {
                // Normalizar score (0-1)
                const confidence = Math.min(1.0, score / 3);
                matches.push({
                    domain,
                    score,
                    confidence,
                    reasoning: this.explainMatch(domain, query)
                });
            }
        }
        
        // Ordenar por confiança
        matches.sort((a, b) => b.confidence - a.confidence);
        
        // Detectar multi-domínio
        const multiDomain = matches.length > 1 && matches[0].confidence < 0.9;
        
        // Usar contexto anterior se disponível
        if (matches.length === 0 && userId) {
            const context = this.contextMemory.get(userId);
            if (context && context.length > 0) {
                const lastDomain = context[context.length - 1];
                matches.push({
                    domain: lastDomain,
                    score: 1,
                    confidence: 0.5,
                    reasoning: `Inferred from conversation context`
                });
            }
        }
        
        // Armazenar contexto
        if (userId && matches.length > 0) {
            if (!this.contextMemory.has(userId)) {
                this.contextMemory.set(userId, []);
            }
            const context = this.contextMemory.get(userId)!;
            context.push(matches[0].domain);
            if (context.length > this.maxMemorySize) {
                context.shift();
            }
        }
        
        return {
            primaryDomain: matches[0]?.domain || 'general',
            confidence: matches[0]?.confidence || 0,
            allMatches: matches,
            isMultiDomain: multiDomain,
            reasoning: matches[0]?.reasoning || 'No specific domain detected',
            timestamp: new Date()
        };
    }
    
    /**
     * Explicar por que um domínio foi detectado
     */
    private explainMatch(domain: string, query: string): string {
        const explanations: Record<string, string[]> = {
            mathematics: ['mathematical', 'numerical', 'equation-based'],
            physics: ['physical', 'force-related', 'energy-related'],
            code: ['programming', 'software', 'technical code'],
            medicine: ['health-related', 'medical', 'clinical'],
            psychology: ['behavioral', 'mental', 'emotional'],
            law: ['legal', 'contractual', 'jurisdictional'],
            security: ['security-focused', 'cybersecurity', 'protection'],
            creativity: ['artistic', 'imaginative', 'creative'],
            economics: ['financial', 'market-based', 'economic'],
            history: ['historical', 'temporal', 'chronological']
        };
        
        return `Detected ${domain} domain - ${explanations[domain]?.[0] || 'domain expertise'}`;
    }
    
    /**
     * Classificar confiança do roteamento
     */
    getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
        if (confidence >= 0.8) return 'high';
        if (confidence >= 0.5) return 'medium';
        return 'low';
    }
    
    /**
     * Obter contexto de conversa do usuário
     */
    getUserContext(userId: string): string[] {
        return this.contextMemory.get(userId) || [];
    }
    
    /**
     * Limpar contexto de usuário
     */
    clearUserContext(userId: string): void {
        this.contextMemory.delete(userId);
    }
    
    /**
     * Obter estatísticas de roteamento
     */
    getRoutingStats(): any {
        return {
            totalDomains: this.domainPatterns.size,
            domains: Array.from(this.domainPatterns.keys()),
            totalUsers: this.contextMemory.size,
            timestamp: new Date()
        };
    }
}

// ============================================================================
// TYPES
// ============================================================================

export interface DomainMatch {
    domain: string;
    score: number;
    confidence: number;
    reasoning: string;
}

export interface RoutingResult {
    primaryDomain: string;
    confidence: number;
    allMatches: DomainMatch[];
    isMultiDomain: boolean;
    reasoning: string;
    timestamp: Date;
}

// ============================================================================
// ADVANCED NLP UTILITIES
// ============================================================================

export class NLPUtils {
    /**
     * Extrair entidades de texto
     */
    static extractEntities(text: string): string[] {
        const words = text.split(/\s+/);
        const entities: string[] = [];
        
        for (const word of words) {
            // Remover pontuação
            const clean = word.replace(/[^a-zA-Z0-9]/g, '');
            
            // Capitalizado provavelmente é entidade
            if (clean && clean[0] === clean[0].toUpperCase()) {
                entities.push(clean);
            }
        }
        
        return [...new Set(entities)];
    }
    
    /**
     * Calcular similaridade entre strings (Levenshtein)
     */
    static stringSimilarity(str1: string, str2: string): number {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    
    /**
     * Levenshtein distance algorithm
     */
    private static levenshteinDistance(str1: string, str2: string): number {
        const matrix = Array(str2.length + 1)
            .fill(null)
            .map(() => Array(str1.length + 1).fill(0));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let i = 0; i <= str2.length; i++) matrix[i][0] = i;
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                const indicator = str1[j - 1] === str2[i - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1,
                    matrix[i - 1][j - 1] + indicator
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    }
}
