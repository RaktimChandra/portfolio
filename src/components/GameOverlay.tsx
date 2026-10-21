"use client";

import Modal from "./Modal";
import PenaltyGame from "./PenaltyGame";

export default function GameOverlay() {
  return (
    <Modal label="Penalty shoot-out" className="game">
      <div className="game__head">
        <p className="text-lead">Penalty shoot-out</p>
        <p className="text-small muted">Five kicks. The keeper reads about one in three.</p>
      </div>
      <PenaltyGame />
    </Modal>
  );
}
