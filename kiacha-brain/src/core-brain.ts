import pino from 'pino';
import { PythonShell } from 'python-shell';
import KiachaKernelClient from './grpc-client.js';
import KiachaEventBus from './event-bus.js';

const logger = pino();

export interface MemoryEntry {
  id: string;
  data: unknown;
  embedding?: number[];
  timestamp: number;
}

export class Memory {
  private entries: Map<string, MemoryEntry> = new Map();

  async store(data: unknown): Promise<string> {
    const id = Math.random().toString(36).substr(2, 9);
    const entry: MemoryEntry = {
      id,
      data,
      timestamp: Date.now(),
    };
    this.entries.set(id, entry);
    logger.info(`Memory stored: ${id}`);
    return id;
  }

  async search(query: string): Promise<MemoryEntry[]> {
    // Simple search implementation; in production, use semantic search
    const results = Array.from(this.entries.values()).filter(
      (entry) => JSON.stringify(entry.data).includes(query)
    );
    return results;
  }

  get(id: string): MemoryEntry | undefined {
    return this.entries.get(id);
  }
}

export class AudioModule {
  async transcribe(audioData: unknown): Promise<string> {
    logger.info('Transcribing audio...');
    try {
      const result = await this.callPython('whisper', { audio: audioData });
      return result as string;
    } catch (error) {
      logger.error('Transcription failed:', error);
      return 'Transcription failed';
    }
  }

  async speak(text: string): Promise<unknown> {
    logger.info(`Speaking: ${text}`);
    try {
      const result = await this.callPython('piper', { text });
      return result;
    } catch (error) {
      logger.error('TTS failed:', error);
      return null;
    }
  }

  private async callPython(service: string, args: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      PythonShell.run(
        `modules/${service}.py`,
        { args: [JSON.stringify(args)] },
        (err, results) => {
          if (err) reject(err);
          else resolve(results?.[0]);
        }
      );
    });
  }
}

export class KiachaCoreBrain {
  private logger = pino();
  public memory = new Memory();
  public audio = new AudioModule();
  private modules: Map<string, unknown> = new Map();
  private kernelClient: KiachaKernelClient;
  private eventBus: KiachaEventBus;
  private brainModuleId: string | null = null;

  constructor(kernelAddress: string = 'localhost:50051') {
    this.kernelClient = new KiachaKernelClient(kernelAddress);
    this.eventBus = new KiachaEventBus(kernelAddress);
    this.initializeModules();
  }

  private initializeModules() {
    this.logger.info('🧠 Initializing Kiacha Core Brain modules...');
    this.modules.set('memory', this.memory);
    this.modules.set('audio', this.audio);
  }

  /**
   * Connect to kernel and register brain module
   */
  async connect(): Promise<void> {
    try {
      // Spawn the brain module in the kernel
      this.brainModuleId = await this.kernelClient.spawnModule(
        'core-brain',
        1, // MODULE_TYPE_BRAIN
        { version: '0.1.0' }
      );

      this.logger.info(`✓ Brain connected to kernel: ${this.brainModuleId}`);

      // Subscribe to kernel events
      await this.eventBus.subscribeToKernelEvents('module_spawned');
      await this.eventBus.subscribeToKernelEvents('module_failed');

      // Listen to events
      this.eventBus.on('module_spawned', (data: any) => {
        this.logger.info(`Module spawned event: ${JSON.stringify(data)}`);
      });

      this.eventBus.on('module_failed', (data: any) => {
        this.logger.error(`Module failed event: ${JSON.stringify(data)}`);
      });
    } catch (error) {
      this.logger.error('Failed to connect to kernel:', error);
      throw error;
    }
  }

  /**
   * Main inference function — generates text from prompt
   */
  async infer(prompt: string): Promise<string> {
    this.logger.info(`Inferring: ${prompt}`);

    // In production, this would call a language model
    const response = `Kiacha thinking about: "${prompt}"...`;

    // Store in memory
    await this.memory.store({ type: 'inference', prompt, response });

    // Emit event via event bus
    this.eventBus.emitLocal('inference', { prompt, response });

    return response;
  }

  /**
   * Reasoning engine — deep chain-of-thought
   */
  async reason(task: string): Promise<string> {
    this.logger.info(`Reasoning about: ${task}`);

    const steps: string[] = [];
    steps.push(`Step 1: Analyzing task: ${task}`);
    steps.push(`Step 2: Breaking down components...`);
    steps.push(`Step 3: Evaluating options...`);
    steps.push(`Step 4: Concluding...`);

    const reasoning = steps.join('\n');

    await this.memory.store({ type: 'reasoning', task, steps });

    return reasoning;
  }

  /**
   * Vision module — image processing
   */
  async vision(imageData: unknown): Promise<string> {
    this.logger.info('Processing image...');

    try {
      const result = await this.callPythonModule('vision', { image: imageData });
      await this.memory.store({ type: 'vision', result });
      return result as string;
    } catch (error) {
      this.logger.error('Vision processing failed:', error);
      return 'Vision processing failed';
    }
  }

  /**
   * Router — decides which module handles the request
   */
  async router(event: { type: string; payload: unknown }): Promise<unknown> {
    this.logger.info(`Routing event: ${event.type}`);

    switch (event.type) {
      case 'infer':
        return this.infer(event.payload as string);
      case 'reason':
        return this.reason(event.payload as string);
      case 'vision':
        return this.vision(event.payload);
      case 'memory_store':
        return this.memory.store(event.payload);
      case 'memory_search':
        return this.memory.search(event.payload as string);
      default:
        this.logger.warn(`Unknown event type: ${event.type}`);
        return null;
    }
  }

  /**
   * Get module status from kernel
   */
  async getModuleStatus(): Promise<Record<string, unknown>> {
    try {
      const modules = await this.kernelClient.listModules();
      return {
        brain: 'active',
        kernel_modules: modules.length,
        memory: 'active',
        audio: 'active',
        vision: 'active',
        reasoning: 'active',
      };
    } catch (error) {
      this.logger.error('Failed to get module status:', error);
      return {
        error: 'Failed to connect to kernel',
      };
    }
  }

  /**
   * Get kernel resources
   */
  async getKernelResources(): Promise<any> {
    try {
      return await this.kernelClient.getResources();
    } catch (error) {
      this.logger.error('Failed to get kernel resources:', error);
      throw error;
    }
  }

  /**
   * Run WASM in kernel sandbox
   */
  async runWasmInKernel(wasmData: Buffer, args: string[] = []): Promise<string> {
    if (!this.brainModuleId) {
      throw new Error('Brain not connected to kernel');
    }

    try {
      return await this.kernelClient.runWasm(this.brainModuleId, wasmData, args);
    } catch (error) {
      this.logger.error('Failed to run WASM:', error);
      throw error;
    }
  }

  /**
   * Cleanup and disconnect
   */
  disconnect(): void {
    this.eventBus.close();
    this.kernelClient.close();
    this.logger.info('Brain disconnected from kernel');
  }

  private async callPythonModule(module: string, args: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      PythonShell.run(
        `modules/${module}.py`,
        { args: [JSON.stringify(args)] },
        (err, results) => {
          if (err) reject(err);
          else resolve(results?.[0]);
        }
      );
    });
  }
}
