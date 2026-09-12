import { useCallback, useEffect, useState } from "react";

const KEY = "ps.sound";
let ctx: AudioContext | null = null;
let enabledCache: boolean | null = null;
const listeners = new Set<(v: boolean) => void>();

function isEnabled() {
  if (enabledCache !== null) return enabledCache;
  if (typeof window === "undefined") return true;
  enabledCache = window.localStorage.getItem(KEY) !== "off";
  return enabledCache;
}

function setEnabled(v: boolean) {
  enabledCache = v;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, v ? "on" : "off");
  listeners.forEach((l) => l(v));
}

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "square",
  gain = 0.08,
  slideTo?: number,
) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + start + dur);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.05);
}

function noise(start: number, dur: number, gain = 0.12) {
  const c = getCtx();
  if (!c) return;
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 900;
  src.connect(f).connect(g).connect(c.destination);
  src.start(c.currentTime + start);
}

export type SoundName = "click" | "complete" | "hit" | "coin" | "levelup" | "victory" | "error" | "equip";

export function playSound(name: SoundName) {
  if (!isEnabled()) return;
  try {
    switch (name) {
      case "click":
        tone(660, 0, 0.05, "square", 0.04);
        break;
      case "complete":
        tone(523, 0, 0.1);
        tone(659, 0.1, 0.1);
        tone(784, 0.2, 0.18);
        tone(1047, 0.32, 0.3, "triangle", 0.1);
        break;
      case "hit":
        noise(0, 0.25);
        tone(180, 0, 0.2, "sawtooth", 0.1, 60);
        break;
      case "coin":
        tone(1319, 0, 0.07, "square", 0.05);
        tone(1760, 0.07, 0.18, "square", 0.05);
        break;
      case "levelup":
        [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.2, "triangle", 0.1));
        tone(1568, 0.5, 0.6, "triangle", 0.12);
        break;
      case "victory":
        [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.25, "square", 0.07));
        [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5 + i * 0.12, 0.25, "triangle", 0.1));
        tone(1319, 1.0, 0.9, "triangle", 0.12);
        noise(1.0, 0.6, 0.08);
        break;
      case "error":
        tone(220, 0, 0.15, "sawtooth", 0.06, 110);
        break;
      case "equip":
        tone(880, 0, 0.08, "triangle", 0.06);
        tone(1174, 0.08, 0.15, "triangle", 0.06);
        break;
    }
  } catch {
    /* audio unavailable */
  }
}

export function useSound() {
  const [enabled, setState] = useState(true);
  useEffect(() => {
    setState(isEnabled());
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);
  const toggle = useCallback(() => {
    const next = !isEnabled();
    setEnabled(next);
    if (next) playSound("click");
  }, []);
  return { enabled, toggle, play: playSound };
}
