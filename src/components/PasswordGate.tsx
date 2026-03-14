"use client";

import { useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "veomaking_auth";

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = 로딩중
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 세션 확인
  useEffect(() => {
    setAuthed(sessionStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.ok) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setAuthed(true);
      } else {
        setError(data.error ?? "인증에 실패했습니다.");
        setPassword("");
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 로딩 중
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 인증 완료
  if (authed) return <>{children}</>;

  // 비밀번호 입력 화면
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">🎬 VeoMaking</h1>
          <p className="text-sm text-gray-400">접속하려면 비밀번호를 입력하세요</p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoFocus
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none text-center text-lg tracking-widest"
        />

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password.trim()}
          className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${
            loading || !password.trim()
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "확인 중..." : "입장하기"}
        </button>
      </form>
    </div>
  );
}
