import { TutorMeta, SessionSummary } from '../types';

interface ParsedResponse {
  text: string;
  meta: TutorMeta | null;
  summary: SessionSummary | null;
}

export function parseGeminiResponse(fullText: string): ParsedResponse {
  let text = fullText;
  let meta: TutorMeta | null = null;
  let summary: SessionSummary | null = null;

  // Regex to find JSON block at the end of the string, handling potential extra newlines
  const jsonMatch = fullText.match(/(\s*\{[\s\S]*\})\s*$/);

  if (jsonMatch) {
    const jsonString = jsonMatch[0];
    try {
      const parsed = JSON.parse(jsonString.trim());
      
      // Determine if it is a meta update or a final summary based on keys
      if ('total_turns' in parsed) {
        summary = parsed as SessionSummary;
      } else if ('scene' in parsed) {
        meta = parsed as TutorMeta;
      }

      // Remove the JSON from the display text
      text = fullText.replace(jsonString, '').trim();
    } catch (e) {
      console.warn("Failed to parse JSON from response", e);
    }
  }

  return { text, meta, summary };
}