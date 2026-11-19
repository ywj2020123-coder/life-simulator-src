import { useCallback, useRef, useState } from 'react';
import { GATE_HASH, GATE_KEY } from '../config';

/**
 * 群密码访问门（朋友私玩定制版）。
 * 纯前端校验：输入密码 → SHA-256 → 与 GATE_HASH 比对，正确才放行。
 * 防君子不防黑客（源码公开，懂行的人可以绕过），用于挡住搜到链接的陌生人。
 */

/** 极老内核兜底（无 crypto.subtle 时）：UTF-8 → Base64 常量比对 */
const FALLBACK_B64 = '6ZqP6aOO5pyA5biF';

async function checkPassword(input: string): Promise<boolean> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
      const hex = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return hex === GATE_HASH;
    } catch {
      // 走兜底
    }
  }
  try {
    return btoa(unescape(encodeURIComponent(input))) === FALLBACK_B64;
  } catch {
    return false;
  }
}

export default function GateScreen({ onPass }: { onPass: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(async () => {
    const input = value.trim();
    if (!input || checking) return;
    setChecking(true);
    const ok = await checkPassword(input);
    setChecking(false);
    if (ok) {
      try {
        localStorage.setItem(GATE_KEY, '1');
      } catch {
        // 存储不可用也不拦着进游戏
      }
      onPass();
    } else {
      setError(true);
      setValue('');
      inputRef.current?.focus();
    }
  }, [value, checking, onPass]);

  return (
    <div className="w-full h-full flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🎮</div>
          <h1 className="text-xl font-bold tracking-wide">人生模拟器</h1>
          <p className="text-sm text-white/60 mt-1">朋友们的私玩小站 · 请输入群密码</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); void submit(); }}>
          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="群密码"
            autoFocus
            enterKeyHint="go"
            className={`w-full rounded-lg border bg-black/30 px-4 py-3 text-center text-base outline-none placeholder:text-white/30 focus:border-sky-400/60 ${error ? 'border-red-500/70 animate-[shake_0.3s_ease]' : 'border-white/15'}`}
          />
          {error && (
            <p className="text-center text-red-400 text-xs mt-2">密码不对，再想想～（想不起来就去群里问）</p>
          )}
          <button
            type="submit"
            disabled={checking || !value.trim()}
            className="mt-4 w-full rounded-lg bg-sky-500/90 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-40 py-3 font-semibold transition-colors"
          >
            {checking ? '验证中…' : '进入人生'}
          </button>
        </form>
        <p className="text-center text-white/35 text-xs mt-4">密码只需输一次，之后直接进</p>
      </div>
      <style>{'@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }'}</style>
    </div>
  );
}
