
import type { SubtitleEntry } from '../types';

export const parseSrt = (srtContent: string): SubtitleEntry[] => {
  if (!srtContent) return [];
  
  const entries: SubtitleEntry[] = [];
  const blocks = srtContent.trim().replace(/\r/g, '').split('\n\n');

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;

    const index = parseInt(lines[0], 10);
    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s-->\s(\d{2}:\d{2}:\d{2},\d{3})/);

    if (!isNaN(index) && timeMatch) {
      const startTime = timeMatch[1];
      const endTime = timeMatch[2];
      const text = lines.slice(2).join('\n');
      
      entries.push({ index, startTime, endTime, text });
    }
  }
  
  return entries;
};
