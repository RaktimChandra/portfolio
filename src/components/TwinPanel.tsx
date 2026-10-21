"use client";

import Modal from "./Modal";
import TwinBox from "./TwinBox";
import { useUI } from "@/lib/store";

export default function TwinPanel() {
  const prompt = useUI((s) => s.twinPrompt);
  return (
    <Modal label="Ask the AI twin" className="twin-modal">
      <div className="twin-modal__head">
        <h2 className="text-lead">Ask the AI twin</h2>
        <p className="text-small muted">Answers come from Raktim's projects, roles and papers, with sources. It says so when it doesn't know.</p>
      </div>
      <TwinBox variant="panel" initial={prompt} />
    </Modal>
  );
}
