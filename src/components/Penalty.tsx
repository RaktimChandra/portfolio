"use client";

import { useState } from "react";
import { blip } from "@/lib/sound";

/** Kept outside render so it reads as an event-time choice. */
const roll = (n: number) => Math.floor(Math.random() * n);

const SPOTS = [
  [12, 62], [47, 62], [82, 62],
  [12, 18], [47, 18], [82, 18],
];

/** 404 game: pick a spot, the keeper picks one too. */
export default function Penalty() {
  const [shots, setShots] = useState(0);
  const [goals, setGoals] = useState(0);
  const [ball, setBall] = useState<[number, number] | null>(null);
  const [keeper, setKeeper] = useState<number | null>(null);
  const [msg, setMsg] = useState("Pick a corner.");

  const shoot = (i: number) => {
    const k = roll(6);
    setBall(SPOTS[i] as [number, number]);
    setKeeper(k);
    const saved = k === i || (Math.abs(k - i) === 3 && roll(2) === 0);
    setShots((s) => s + 1);
    if (!saved) setGoals((g) => g + 1);
    setMsg(saved ? "Saved. The keeper guessed right." : "Goal. Top bins.");
    blip(saved ? "close" : "goal");
    setTimeout(() => (setBall(null), setKeeper(null)), 1100);
  };

  const ks = keeper === null ? null : SPOTS[keeper];
  return (
    <div className="grid gap-3" style={{ maxWidth: 720 }}>
      <div className="penalty" role="group" aria-label="Goal, six target zones">
        {[3, 4, 5, 0, 1, 2].map((i) => (
          <button key={i} type="button" aria-label={`Shoot ${["bottom left", "bottom centre", "bottom right", "top left", "top centre", "top right"][i]}`} onClick={() => shoot(i)} disabled={ball !== null} />
        ))}
        <span className="penalty__keeper" style={ks ? { left: `${ks[0] - 9}%`, bottom: ks[1] > 40 ? "0%" : "38%", rotate: ks[0] < 40 ? "-35deg" : ks[0] > 60 ? "35deg" : "0deg" } : undefined} />
        <span className="penalty__ball" style={ball ? { left: `${ball[0]}%`, bottom: `${100 - ball[1] - 6}%` } : undefined} />
      </div>
      <p aria-live="polite"><b>{msg}</b> <span className="muted tabular">Goals {goals} / {shots}</span></p>
    </div>
  );
}
