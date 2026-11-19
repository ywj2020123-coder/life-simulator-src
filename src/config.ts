/**
 * 后端 API 基础地址。
 *
 * 默认留空，表示「未配置后端」——前端会静默跳过所有 API，可完全离线游玩。
 * 部署时通过环境变量注入自己的 Worker 地址，避免 fork、测试环境或恶意站点误写生产数据：
 *   VITE_API_BASE=https://life-simulator.<你的子域>.workers.dev npm run build
 */
const rawApiBase = import.meta.env.VITE_API_BASE as string | undefined;

export const API_BASE = (rawApiBase ?? '').trim().replace(/\/+$/, '');

/**
 * 群密码访问门（朋友私玩定制版）。
 * GATE_HASH = 群密码的 SHA-256（hex，小写）；置空字符串即关闭访问门。
 * 部署时可用环境变量覆盖：VITE_GATE_HASH=<sha256 hex> npm run build
 */
export const GATE_HASH = (import.meta.env.VITE_GATE_HASH as string | undefined)?.trim()
  || 'b9911178a4c28999979295a90819e36053b2cac2fdb98f2bf5257d09d59e3ef1';
export const GATE_ENABLED = GATE_HASH.length > 0;
/** 通过后写入 localStorage 的标记 key */
export const GATE_KEY = 'life-sim-gate-passed';
