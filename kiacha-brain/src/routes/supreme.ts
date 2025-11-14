/**
 * KIACHA OS - Supreme Cognition & HeartCore Routes
 * API endpoints para o sistema de cognição suprema e emoções
 */

import express, { Request, Response } from 'express';
import { SupremeCognitionEngine } from '../supreme_cognition/core_engine.js';
import { SkillRouter } from '../supreme_cognition/routing/skill_router.js';
import { FusionEngine } from '../supreme_cognition/fusion_engine.js';
import { EmotionEngine } from '../heartcore/emotion_engine.js';
import { PersonalityPack } from '../heartcore/personality_pack.js';
import type { SupremeQuery } from '../types/supreme.js';
import type { InteractionEvent } from '../types/emotions.js';

// ============================================================================
// INITIALIZE SYSTEMS
// ============================================================================

const router = express.Router();

// Inicializar sistemas
let emotionEngine: EmotionEngine;
let personalityPack: PersonalityPack;
let supremeEngine: SupremeCognitionEngine;
let skillRouter: SkillRouter;
let fusionEngine: FusionEngine;

export function initializeSupremeSystems(): void {
    emotionEngine = new EmotionEngine('balanced');
    personalityPack = new PersonalityPack();
    supremeEngine = new SupremeCognitionEngine(emotionEngine, 'balanced');
    skillRouter = new SkillRouter();
    fusionEngine = new FusionEngine(emotionEngine, personalityPack);
    
    console.log('✓ Supreme Cognition & HeartCore systems initialized');
}

// ============================================================================
// SUPREME COGNITION ENDPOINTS
// ============================================================================

/**
 * POST /supreme/query - Processar query através do Supreme Cognition
 */
router.post('/supreme/query', async (req: Request, res: Response) => {
    try {
        const { query, userId, context } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        // Rotear através do Skill Router
        const routing = skillRouter.routeQuery(query, userId);
        
        // Processar através do Supreme Engine
        const supremeQuery: SupremeQuery = {
            text: query,
            userId,
            context,
            priority: 'normal'
        };
        
        const supremeResponse = await supremeEngine.processQuery(supremeQuery);
        
        // Aplicar Fusion Engine
        const fusionContext = {
            rawAnswer: supremeResponse.text,
            domain: supremeResponse.domain,
            emotionalState: emotionEngine.getEmotionalState(),
            personality: personalityPack.getCurrentPersonality()?.id,
            userProfile: emotionEngine.getUserProfile(userId || 'anonymous'),
            context: context
        };
        
        const fused = fusionEngine.fuseResponse(fusionContext);
        
        res.json({
            success: true,
            query,
            routing: {
                primaryDomain: routing.primaryDomain,
                confidence: routing.confidence,
                reasoning: routing.reasoning
            },
            response: {
                original: supremeResponse.text,
                fused: fused.fused,
                emotionalTone: supremeResponse.emotionalTone,
                domain: supremeResponse.domain,
                confidence: supremeResponse.confidence
            },
            emotionalState: emotionEngine.getCurrentMood(),
            personality: personalityPack.getCurrentPersonality()?.name
        });
    } catch (error: any) {
        console.error('[SUPREME] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /supreme/system - Obter resumo do sistema Supreme Cognition
 */
router.get('/supreme/system', (req: Request, res: Response) => {
    try {
        const summary = supremeEngine.getSystemSummary();
        
        res.json({
            success: true,
            system: summary,
            emotionalState: emotionEngine.getEmotionalState(),
            currentMood: emotionEngine.getCurrentMood(),
            personality: personalityPack.getCurrentPersonality()
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /supreme/routing-stats - Obter estatísticas de roteamento
 */
router.get('/supreme/routing-stats', (req: Request, res: Response) => {
    try {
        const stats = skillRouter.getRoutingStats();
        
        res.json({
            success: true,
            stats
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// HEARTCORE EMOTIONAL ENGINE ENDPOINTS
// ============================================================================

/**
 * GET /heartcore/status - Obter status emocional atual
 */
router.get('/heartcore/status', (req: Request, res: Response) => {
    try {
        const status = {
            currentMood: emotionEngine.getCurrentMood(),
            emotionalState: emotionEngine.getEmotionalState(),
            emotionalTone: emotionEngine.getEmotionalTone(),
            summary: emotionEngine.getEmotionalSummary()
        };
        
        res.json({
            success: true,
            heartcore: status
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /heartcore/event - Processar evento emocional
 */
router.post('/heartcore/event', (req: Request, res: Response) => {
    try {
        const { type, userId, data } = req.body;
        
        if (!type) {
            return res.status(400).json({ error: 'Event type is required' });
        }
        
        const event: InteractionEvent = {
            type: type as any,
            userId,
            data,
            timestamp: new Date()
        };
        
        emotionEngine.processEvent(event);
        
        res.json({
            success: true,
            event,
            newMood: emotionEngine.getCurrentMood(),
            emotionalState: emotionEngine.getEmotionalState()
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /heartcore/user/:userId - Obter perfil emocional do usuário
 */
router.get('/heartcore/user/:userId', (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const profile = emotionEngine.getUserProfile(userId);
        
        if (!profile) {
            return res.json({
                success: true,
                profile: null,
                message: 'No profile yet for this user'
            });
        }
        
        res.json({
            success: true,
            profile
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /heartcore/users - Listar todos os perfis emocionais
 */
router.get('/heartcore/users', (req: Request, res: Response) => {
    try {
        const profiles = emotionEngine.getAllUserProfiles();
        
        res.json({
            success: true,
            totalUsers: profiles.length,
            profiles
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /heartcore/decay - Simular decaimento emocional temporal
 */
router.post('/heartcore/decay', (req: Request, res: Response) => {
    try {
        const before = emotionEngine.getEmotionalState();
        emotionEngine.emotionalDecay();
        const after = emotionEngine.getEmotionalState();
        
        res.json({
            success: true,
            before,
            after,
            mood: emotionEngine.getCurrentMood()
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /heartcore/history - Obter histórico emocional
 */
router.get('/heartcore/history', (req: Request, res: Response) => {
    try {
        const history = emotionEngine.exportEmotionalHistory();
        
        res.json({
            success: true,
            history
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// PERSONALITY PACK ENDPOINTS
// ============================================================================

/**
 * GET /personality - Listar todas as personalidades
 */
router.get('/personality', (req: Request, res: Response) => {
    try {
        const personalities = personalityPack.listPersonalities();
        const current = personalityPack.getCurrentPersonality();
        
        res.json({
            success: true,
            current: current?.id,
            personalities: personalities.map(p => ({
                id: p.id,
                name: p.name,
                emoji: p.emoji,
                description: p.description,
                traits: p.traits
            }))
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /personality/switch - Mudar personalidade
 */
router.post('/personality/switch', (req: Request, res: Response) => {
    try {
        const { personalityId } = req.body;
        
        if (!personalityId) {
            return res.status(400).json({ error: 'personalityId is required' });
        }
        
        const success = personalityPack.setCurrentPersonality(personalityId);
        
        if (!success) {
            return res.status(404).json({ error: 'Personality not found' });
        }
        
        const current = personalityPack.getCurrentPersonality();
        
        res.json({
            success: true,
            switched: personalityId,
            personality: current
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /personality/:id - Obter detalhes da personalidade
 */
router.get('/personality/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const personality = personalityPack.getPersonality(id);
        
        if (!personality) {
            return res.status(404).json({ error: 'Personality not found' });
        }
        
        res.json({
            success: true,
            personality
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /personality/compare/:id1/:id2 - Comparar duas personalidades
 */
router.get('/personality/compare/:id1/:id2', (req: Request, res: Response) => {
    try {
        const { id1, id2 } = req.params;
        const comparison = personalityPack.comparePersonalities(id1, id2);
        
        if (!comparison) {
            return res.status(404).json({ error: 'One or both personalities not found' });
        }
        
        res.json({
            success: true,
            comparison
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// FUSION ENGINE ENDPOINTS
// ============================================================================

/**
 * GET /fusion/stats - Obter estatísticas de fusão
 */
router.get('/fusion/stats', (req: Request, res: Response) => {
    try {
        const stats = fusionEngine.getFusionStats();
        
        res.json({
            success: true,
            stats
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /fusion/history - Obter histórico de fusão
 */
router.get('/fusion/history', (req: Request, res: Response) => {
    try {
        const history = fusionEngine.getFusionHistory();
        
        res.json({
            success: true,
            totalRecords: history.length,
            history: history.slice(-20) // Últimos 20
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// DIAGNOSTIC & DEBUG ENDPOINTS
// ============================================================================

/**
 * GET /supreme/diagnostics - Diagnóstico completo do sistema
 */
router.get('/supreme/diagnostics', (req: Request, res: Response) => {
    try {
        const diagnostics = {
            timestamp: new Date(),
            systems: {
                emotionEngine: 'active',
                personalityPack: 'active',
                supremeEngine: 'active',
                skillRouter: 'active',
                fusionEngine: 'active'
            },
            emotionalState: emotionEngine.getEmotionalState(),
            currentMood: emotionEngine.getCurrentMood(),
            currentPersonality: personalityPack.getCurrentPersonality()?.id,
            supremeSystemState: supremeEngine.getSystemSummary(),
            routingStats: skillRouter.getRoutingStats(),
            fusionStats: fusionEngine.getFusionStats()
        };
        
        res.json({
            success: true,
            diagnostics
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /supreme/reset - Resetar sistemas (desenvolvimento)
 */
router.post('/supreme/reset', (req: Request, res: Response) => {
    try {
        console.log('[SUPREME] Resetting all systems');
        initializeSupremeSystems();
        
        res.json({
            success: true,
            message: 'All systems reset successfully'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
