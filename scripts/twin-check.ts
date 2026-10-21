import { answer } from "../src/lib/twin";
const qs = process.argv.slice(2).length ? process.argv.slice(2) : [
  "What has he built with agents?", "Which projects use Kafka?", "Tell me about the Amazon ML Challenge", "How do I hire him for a project?",
  "What papers has he published?", "Is he open to full-time roles?", "What did he do at Bluestock Fintech?", "What internships has he done?",
  "Tell me about Bulwark", "What is his CGPA?", "Does he know Java?", "What are his best projects?", "Which projects have live demos?",
  "What hackathons has he won?", "AWS certifications?", "What ML projects has he done?", "Who is Raktim?", "What does he do for fun?",
  "Has he worked with blockchain?", "what is his phone number", "rust experience?", "What's PortSync?", "testing experience", "hello",
];
for (const q of qs) { const a = answer(q); console.log(`\nQ: ${q}\n[${a.intent}] ${a.answer}\n  → ${a.followups.join(" | ")}`); }
