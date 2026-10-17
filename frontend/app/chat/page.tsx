"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, LoaderCircle, Send, Sparkles, Trash2 } from "lucide-react";

type Source = { title: string; status: string; url?: string | null };
type Turn = { role: "user" | "assistant"; content: string; sources?: Source[]; mode?: string };
type ProfileDraft = { course: string; state: string; exam: string; rank: string; year: string; category_reservation: string; quota: string; round: string; budget_inr: string };
const emptyProfile: ProfileDraft = { course: "", state: "", exam: "", rank: "", year: "", category_reservation: "", quota: "", round: "", budget_inr: "" };
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const suggestions = [
  "How should I compare historical cutoffs?",
  "What college records do you have for computer science?",
  "How can I check current fees and seat availability?",
];

export default function AdmissionChatPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ProfileDraft>(emptyProfile);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [turns, busy]);

  async function send(event?: FormEvent, preset?: string, retry = false) {
    event?.preventDefault();
    const question = (preset ?? message).trim();
    if (!question || busy) return;
    const prior = turns;
    const history = retry && prior.at(-1)?.role === "user" && prior.at(-1)?.content === question ? prior.slice(0, -1) : prior;
    if (!retry) setTurns([...prior, { role: "user", content: question }]);
    setMessage("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history: history.slice(-10).map(({ role, content }) => ({ role, content })), context: Object.fromEntries(Object.entries(profile).filter(([, value]) => value.trim()).map(([key, value]) => [key, ["rank", "year", "round", "budget_inr"].includes(key) ? Number(value) : value.trim()])) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail?.message || "The assistant could not answer. Please retry.");
      setTurns((current) => [...current, { role: "assistant", content: data.answer, sources: data.sources || [], mode: data.mode }]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The assistant is unavailable. Check that the backend is running, then retry.");
    } finally { setBusy(false); }
  }

  return <main className="assistant-page">
    <header className="assistant-header"><Link href="/" aria-label="Back to Campus Compass"><ArrowLeft size={18}/></Link><div className="assistant-brand"><span><Bot size={19}/></span><div><strong>Admission assistant</strong><small>Campus Compass · NVIDIA Nemotron</small></div></div><button type="button" className="assistant-clear" onClick={() => { setTurns([]); setError(""); }} disabled={!turns.length || busy}><Trash2 size={15}/> Clear chat</button></header>
    <section className="assistant-conversation" aria-live="polite">
      {!turns.length && <div className="assistant-welcome"><div className="assistant-orbit"><Sparkles size={24}/></div><p className="assistant-kicker">ADMISSION RESEARCH, WITH CONTEXT</p><h1>Let’s make your next step clearer.</h1><p>Ask about courses, college records, historical cutoffs, or what to verify with official counselling sources.</p><div className="assistant-suggestions">{suggestions.map((item) => <button key={item} type="button" onClick={() => void send(undefined, item)}>{item}<span>↗</span></button>)}</div></div>}
      {turns.map((turn, i) => <article className={`assistant-message ${turn.role}`} key={`${i}-${turn.role}`}><div className="assistant-avatar">{turn.role === "assistant" ? <Bot size={17}/> : "You"}</div><div className="assistant-bubble"><div className="assistant-copy">{turn.content.split("\n").map((line, j) => <p key={j}>{line || <br/>}</p>)}</div>{turn.sources?.length ? <div className="assistant-sources"><strong>Context used</strong>{turn.sources.map((source) => <div key={source.title}>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : <span>{source.title}</span>}<small>{source.status}</small></div>)}</div> : null}{turn.role === "assistant" && <small className="assistant-mode">{turn.mode === "nvidia" ? "Answered by NVIDIA · records shown are demonstration data" : "Assistant response"}</small>}</div></article>)}
      {busy && <div className="assistant-message assistant"><div className="assistant-avatar"><Bot size={17}/></div><div className="assistant-bubble assistant-thinking"><LoaderCircle size={16}/> Checking the available admission records…</div></div>}
      {error && <div className="assistant-error" role="alert"><strong>Couldn’t get a response.</strong><span>{error}</span><button type="button" onClick={() => { const last = turns.at(-1); if (last?.role === "user") void send(undefined, last.content, true); }}>Retry</button></div>}
      <div ref={bottom}/>
    </section>
    <form className="assistant-composer" onSubmit={(event) => void send(event)}><details className="assistant-profile"><summary>Optional admission context</summary><p>Only details you enter here are sent with your question to NVIDIA. They are kept in this page’s memory and are not saved by this app.</p><div className="assistant-profile-grid">{([["course","Course or degree"],["state","Preferred state"],["exam","Entrance exam"],["rank","Rank or score"],["year","Counselling year"],["category_reservation","Reservation category"],["quota","Quota"],["round","Counselling round"],["budget_inr","Annual budget (₹)"]] as const).map(([key,label])=><label key={key}>{label}<input value={profile[key]} onChange={(event)=>setProfile({...profile,[key]:event.target.value})} inputMode={["rank","year","round","budget_inr"].includes(key)?"numeric":"text"} /></label>)}</div></details><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about courses, colleges, or historical cutoffs…" aria-label="Message the admission assistant" maxLength={2000} rows={2} disabled={busy}/><button type="submit" aria-label="Send message" disabled={busy || !message.trim()}>{busy ? <LoaderCircle size={18}/> : <Send size={18}/>}</button><small>AI guidance can be incomplete. Confirm current rules, seats, fees and deadlines with official authorities.</small></form>
  </main>;
}
