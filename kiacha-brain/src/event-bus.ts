import pino from 'pino';
import { EventEmitter } from 'events';
import KiachaKernelClient from './grpc-client.js';

const logger = pino();

export class KiachaEventBus extends EventEmitter {
  private kernelClient: KiachaKernelClient;
  private eventSubscriptions: Map<string, any> = new Map();

  constructor(kernelAddress: string = 'localhost:50051') {
    super();
    this.kernelClient = new KiachaKernelClient(kernelAddress);
  }

  /**
   * Subscribe to kernel events
   */
  async subscribeToKernelEvents(eventType: string): Promise<void> {
    if (this.eventSubscriptions.has(eventType)) {
      logger.warn(`Already subscribed to event type: ${eventType}`);
      return;
    }

    try {
      const stream = this.kernelClient.subscribeToEvents(eventType);

      stream.on('data', (event: any) => {
        logger.debug(`Received event: ${event.event_type} from ${event.source}`);
        this.emit(event.event_type, {
          source: event.source,
          payload: event.payload,
          timestamp: event.timestamp,
        });
      });

      stream.on('error', (error: any) => {
        logger.error(`Event stream error: ${error.message}`);
        this.eventSubscriptions.delete(eventType);
      });

      stream.on('end', () => {
        logger.info(`Event stream ended: ${eventType}`);
        this.eventSubscriptions.delete(eventType);
      });

      this.eventSubscriptions.set(eventType, stream);
      logger.info(`Subscribed to kernel events: ${eventType}`);
    } catch (error) {
      logger.error(`Failed to subscribe to events: ${error}`);
      throw error;
    }
  }

  /**
   * Emit local event
   */
  emitLocal(eventType: string, data: unknown): void {
    logger.debug(`Local event: ${eventType}`);
    this.emit(eventType, data);
  }

  /**
   * Unsubscribe from kernel events
   */
  unsubscribeFromKernelEvents(eventType: string): void {
    const stream = this.eventSubscriptions.get(eventType);
    if (stream) {
      stream.cancel();
      this.eventSubscriptions.delete(eventType);
      logger.info(`Unsubscribed from kernel events: ${eventType}`);
    }
  }

  /**
   * Cleanup all subscriptions
   */
  close(): void {
    for (const [eventType, stream] of this.eventSubscriptions) {
      stream.cancel();
    }
    this.eventSubscriptions.clear();
    this.kernelClient.close();
    logger.info('Event bus closed');
  }
}

export default KiachaEventBus;
