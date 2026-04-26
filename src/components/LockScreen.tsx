import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Input } from "./ui";

type Props = {
  researcherName: string;
  onUnlock: () => void;
};

export function LockScreen({ researcherName, onUnlock }: Props) {
  const [now, setNow] = useState(() => new Date());
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const expectedName = researcherName.trim();
  const backgroundUrl = `${import.meta.env.BASE_URL}images/Fuji_san_by_amaral.png`;

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = useMemo(() => {
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
  }, [now]);

  const date = useMemo(() => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(now);
  }, [now]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = name.trim();
    if (!value) {
      setError("사용자명을 입력하세요.");
      return;
    }
    if (expectedName && value !== expectedName) {
      setError("사용자명이 일치하지 않습니다.");
      return;
    }
    onUnlock();
  }

  return (
    <main
      className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-4 text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.18), rgba(2, 6, 23, 0.45)), url("${backgroundUrl}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="mb-20">
          <div className="text-7xl font-medium leading-none tracking-normal md:text-8xl">{time}</div>
          <div className="mt-4 text-sm text-white/85">{date}</div>
        </div>

        <form className="mx-auto w-full max-w-48 space-y-2" onSubmit={submit}>
          <Input
            className="h-9 border-white/20 bg-white/10 px-3 text-center text-sm text-white shadow-none outline-none placeholder:text-white/65 focus:ring-white/45"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="User name"
            autoFocus
          />
          {error && <p className="text-xs text-white/85">{error}</p>}
        </form>
      </div>
    </main>
  );
}
