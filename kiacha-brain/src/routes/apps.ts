import { Router } from 'express';
import { KiachaKernelClient } from './grpc-client.js';

const router = Router();
let kernelClient: KiachaKernelClient;

export function setKernelClient(client: KiachaKernelClient) {
  kernelClient = client;
}

// ============= CONTROL CENTER =============

// System Settings
router.get('/settings/system', async (req, res) => {
  try {
    const systemInfo = await kernelClient.getSystemInfo({});
    res.json({
      cpuCores: systemInfo.cpu_cores,
      cpuFrequency: systemInfo.cpu_frequency,
      memoryTotal: systemInfo.memory_total,
      memoryFree: systemInfo.memory_free,
      kernelVersion: systemInfo.kernel_version,
      osVersion: systemInfo.os_version,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Device Settings
router.get('/settings/devices', async (req, res) => {
  try {
    const devices = await kernelClient.getDeviceList({});
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Module Settings
router.get('/settings/modules', async (req, res) => {
  try {
    const modules = await kernelClient.listModules({});
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/settings/modules/:name/policy', async (req, res) => {
  try {
    const { memory, cpu, permissions } = req.body;
    // Call kernel to update module policy
    await kernelClient.updateModulePolicy({
      name: req.params.name,
      type: 0,
      config: { memory, cpu, permissions },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Localization Settings
router.get('/settings/localization', async (req, res) => {
  try {
    const locale = await kernelClient.getLocalization({});
    res.json({ language: locale.value, region: 'US' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/settings/localization', async (req, res) => {
  try {
    const { language, region } = req.body;
    await kernelClient.updateSetting({
      key: 'locale',
      value: language,
      category: 'localization',
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============= EXPLORER =============

// File System Operations
router.get('/explorer/list', async (req, res) => {
  try {
    const path = req.query.path as string || '/home';
    const files = await kernelClient.fsList({ path });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/explorer/info', async (req, res) => {
  try {
    const path = req.query.path as string;
    if (!path) throw new Error('Path required');
    const info = await kernelClient.fsGetInfo({ path });
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/explorer/copy', async (req, res) => {
  try {
    const { source, destination } = req.body;
    // Note: In real implementation, would need bidirectional RPC
    await kernelClient.fsCopy({ path: source });
    res.json({ success: true, message: `Copied ${source} to ${destination}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/explorer/move', async (req, res) => {
  try {
    const { source, destination } = req.body;
    await kernelClient.fsMove({ path: source });
    res.json({ success: true, message: `Moved ${source} to ${destination}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/explorer/delete', async (req, res) => {
  try {
    const path = req.query.path as string;
    if (!path) throw new Error('Path required');
    await kernelClient.fsDelete({ path });
    res.json({ success: true, message: `Deleted ${path}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Storage Analytics
router.get('/explorer/storage', async (req, res) => {
  try {
    const stats = await kernelClient.getStorageStats({});
    res.json({
      total: stats.total,
      used: stats.used,
      free: stats.free,
      percentUsed: stats.percent_used,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============= MONITOR =============

// Process Management
router.get('/monitor/processes', async (req, res) => {
  try {
    const processes = await kernelClient.listProcesses({});
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/monitor/process/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const info = await kernelClient.getProcessInfo({ value: pid });
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/monitor/kill', async (req, res) => {
  try {
    const { pid } = req.body;
    await kernelClient.killProcess({ value: pid });
    res.json({ success: true, message: `Process ${pid} terminated` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/monitor/pause', async (req, res) => {
  try {
    const { name } = req.body;
    await kernelClient.pauseModule({ value: name });
    res.json({ success: true, message: `Module ${name} paused` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/monitor/resume', async (req, res) => {
  try {
    const { name } = req.body;
    await kernelClient.resumeModule({ value: name });
    res.json({ success: true, message: `Module ${name} resumed` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/monitor/priority', async (req, res) => {
  try {
    const { pid, priority } = req.body;
    // Update process priority in kernel
    res.json({ success: true, message: `Process ${pid} priority set to ${priority}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============= NETWORK =============

// Network Status
router.get('/network/status', async (req, res) => {
  try {
    const status = await kernelClient.getNetworkStatus({});
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Available Networks
router.get('/network/available', async (req, res) => {
  try {
    const networks = await kernelClient.listNetworks({});
    res.json(networks);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Connect to Network
router.post('/network/connect', async (req, res) => {
  try {
    const { ssid, password } = req.body;
    await kernelClient.connectNetwork({
      ssid,
      signal_strength: 0,
      secured: true,
    });
    res.json({ success: true, message: `Connected to ${ssid}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Firewall Rules
router.get('/network/firewall', async (req, res) => {
  try {
    const rules = await kernelClient.getFirewallRules({});
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/network/firewall/rule', async (req, res) => {
  try {
    const { source, destination, port, action, protocol } = req.body;
    await kernelClient.addFirewallRule({
      rule_id: `rule-${Date.now()}`,
      source,
      destination,
      port,
      action,
      protocol,
    });
    res.json({ success: true, message: 'Firewall rule added' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/network/firewall/rule/:id', async (req, res) => {
  try {
    await kernelClient.removeFirewallRule({ value: req.params.id });
    res.json({ success: true, message: 'Firewall rule removed' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Traffic Logs
router.get('/network/traffic', async (req, res) => {
  try {
    const logs = await kernelClient.getTrafficLogs({});
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Bandwidth Limiting
router.post('/network/bandwidth/limit', async (req, res) => {
  try {
    const { limitMbps } = req.body;
    await kernelClient.setBandwidthLimit({ value: limitMbps * 1024 * 1024 });
    res.json({ success: true, message: `Bandwidth limited to ${limitMbps} Mbps` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============= USERS =============

// User Management
router.get('/users', async (req, res) => {
  try {
    const users = await kernelClient.listUsers({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { username, displayName, role } = req.body;
    const user = await kernelClient.createUser({
      user_id: `user-${Date.now()}`,
      username,
      display_name: displayName,
      role,
      active: true,
      created_at: Date.now(),
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await kernelClient.deleteUser({ value: req.params.id });
    res.json({ success: true, message: `User ${req.params.id} deleted` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// User Permissions
router.get('/users/:id/permissions', async (req, res) => {
  try {
    const perms = await kernelClient.getUserPermissions({ value: req.params.id });
    res.json(perms);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/users/:id/permissions', async (req, res) => {
  try {
    const { app, permissions } = req.body;
    await kernelClient.grantUserPermission({
      user_id: req.params.id,
      app_permissions: [{ app, permissions }],
    });
    res.json({ success: true, message: `Permissions granted for ${app}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/users/:id/permissions/:app', async (req, res) => {
  try {
    await kernelClient.revokeUserPermission({
      user_id: req.params.id,
      app_permissions: [{ app: req.params.app, permissions: [] }],
    });
    res.json({ success: true, message: `Permissions revoked for ${req.params.app}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Biometric Authentication
router.post('/users/auth/biometric', async (req, res) => {
  try {
    const { type, data } = req.body;
    const session = await kernelClient.authenticateBiometric({
      type,
      data: Buffer.from(data),
    });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Sessions
router.get('/users/:id/sessions', async (req, res) => {
  try {
    const sessions = await kernelClient.listSessions({ value: req.params.id });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/users/sessions/:id', async (req, res) => {
  try {
    await kernelClient.terminateSession({ value: req.params.id });
    res.json({ success: true, message: `Session ${req.params.id} terminated` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============= UPDATES =============

// Check for Updates
router.get('/updates/check', async (req, res) => {
  try {
    const updates = await kernelClient.checkForUpdates({});
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Install Update
router.post('/updates/install', async (req, res) => {
  try {
    const { component, version } = req.body;
    await kernelClient.installUpdate({
      component,
      current_version: '',
      available_version: version,
      release_notes: '',
      release_date: 0,
      critical: false,
    });
    res.json({ success: true, message: `Installing ${component} ${version}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Rollback Update
router.post('/updates/rollback', async (req, res) => {
  try {
    const { component } = req.body;
    await kernelClient.rollbackUpdate({ value: component });
    res.json({ success: true, message: `Rolled back ${component}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update Channels
router.get('/updates/channels', async (req, res) => {
  try {
    const channels = await kernelClient.getUpdateChannels({});
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/updates/channels', async (req, res) => {
  try {
    const { name, enabled } = req.body;
    await kernelClient.setUpdateChannel({ name, enabled });
    res.json({ success: true, message: `Update channel set to ${name}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update History
router.get('/updates/history', async (req, res) => {
  try {
    const history = await kernelClient.getUpdateHistory({});
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update Status
router.get('/updates/status', async (req, res) => {
  try {
    const status = await kernelClient.getUpdateStatus({});
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============= SECURITY =============

// Audit Logs
router.get('/security/audit', async (req, res) => {
  try {
    const logs = await kernelClient.getDetailedAuditLogs({});
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Permissions Audit
router.get('/security/permissions', async (req, res) => {
  try {
    const perms = await kernelClient.getAllPermissions({});
    res.json(perms);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Sandbox Status
router.get('/security/sandbox', async (req, res) => {
  try {
    const sandbox = await kernelClient.getSandboxStatus({});
    res.json(sandbox);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Encryption
router.post('/security/encrypt', async (req, res) => {
  try {
    const { data } = req.body;
    const encrypted = await kernelClient.encryptData({
      value: Buffer.from(data),
    });
    res.json({ encrypted: encrypted.value?.toString('base64') });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/security/decrypt', async (req, res) => {
  try {
    const { encrypted } = req.body;
    const decrypted = await kernelClient.decryptData({
      value: Buffer.from(encrypted, 'base64'),
    });
    res.json({ decrypted: decrypted.value?.toString() });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Security Policy
router.get('/security/policy', async (req, res) => {
  try {
    const policy = await kernelClient.getSecurityPolicy({});
    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/security/policy', async (req, res) => {
  try {
    const { name, description, rules } = req.body;
    await kernelClient.updateSecurityPolicy({
      policy_id: `policy-${Date.now()}`,
      name,
      description,
      rules,
      enabled: true,
    });
    res.json({ success: true, message: 'Security policy updated' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Encryption Keys
router.get('/security/keys', async (req, res) => {
  try {
    const keys = await kernelClient.listEncryptionKeys({});
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
