/**
 * Kiacha gRPC Client
 * Node.js client to communicate with the Rust Kernel via gRPC
 */

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../../../shared/proto/kiacha.proto");

export class KiachaKernelClient {
  private client: any;
  private address: string;

  constructor(address: string = "localhost:50051") {
    this.address = address;

    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const kiachaProto = grpc.loadPackageDefinition(packageDefinition) as any;
    this.client = new kiachaProto.kiacha.KiachaKernel(
      address,
      grpc.credentials.createInsecure()
    );
  }

  /**
   * Spawn a new module in the kernel
   */
  async spawnModule(name: string, type: number, config: Record<string, string> = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.spawnModule(
        { name, type, config },
        (err: any, response: any) => {
          if (err) reject(err);
          else resolve(response.module_id);
        }
      );
    });
  }

  /**
   * List all active modules
   */
  async listModules(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.client.listModules({}, (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response.modules || []);
      });
    });
  }

  /**
   * Send IPC message between modules
   */
  async sendIpc(from: string, to: string, payload: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.sendIpc(
        { from, to, payload, timestamp: Date.now() },
        (err: any, response: any) => {
          if (err) reject(err);
          else resolve(response.success);
        }
      );
    });
  }

  /**
   * Subscribe to events from the kernel
   */
  subscribeToEvents(eventType: string): grpc.ClientReadableStream<any> {
    return this.client.subscribeToEvents({ value: eventType });
  }

  /**
   * Check permission for a module
   */
  async checkPermission(moduleId: string, permission: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.checkPermission(
        { module_id: moduleId, permission },
        (err: any, response: any) => {
          if (err) reject(err);
          else resolve(response.granted);
        }
      );
    });
  }

  /**
   * Grant permission to a module
   */
  async grantPermission(moduleId: string, permission: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.grantPermission(
        { module_id: moduleId, permission },
        (err: any) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  /**
   * Revoke permission from a module
   */
  async revokePermission(moduleId: string, permission: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.revokePermission(
        { module_id: moduleId, permission },
        (err: any) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  /**
   * Get resource statistics from kernel
   */
  async getResources(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.getResources({}, (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }

  /**
   * Run WASM code in the kernel sandbox
   */
  async runWasm(moduleId: string, wasmData: Buffer, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.runWasm(
        { module_id: moduleId, wasm_data: wasmData, args },
        (err: any, response: any) => {
          if (err) reject(err);
          else if (!response.success) reject(new Error(response.error));
          else resolve(response.result);
        }
      );
    });
  }

  /**
   * Pause a module
   */
  async pauseModule(moduleId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.pauseModule({ value: moduleId }, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Resume a module
   */
  async resumeModule(moduleId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.resumeModule({ value: moduleId }, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Get audit logs from kernel
   */
  getAuditLogs(): grpc.ClientReadableStream<any> {
    return this.client.getAuditLogs({});
  }

  /**
   * Close the gRPC connection
   */
  close(): void {
    grpc.closeClient(this.client);
  }
}

export default KiachaKernelClient;
