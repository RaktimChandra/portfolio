/** Dictionary keys are English text with whitespace collapsed, so JSX line breaks don't matter. */
export const norm = (s: string) => s.replace(/\s+/g, " ").trim();
