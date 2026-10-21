"use client";

import { useX } from "@/i18n/x/client";
import Modal from "./Modal";
import PenaltyGame from "./PenaltyGame";

export default function GameOverlay() {
  const xl = useX();
  return (
    <Modal label={xl("Penalty shoot-out")} className="game">
      <div className="game__head">
        <p className="text-lead">{xl("Penalty shoot-out")}</p>
        <p className="text-small muted">{xl("Five kicks. The keeper reads about one in three.")}</p>
      </div>
      <PenaltyGame />
    </Modal>
  );
}
