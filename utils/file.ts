
import type { SubtitleEntry } from '../types';

export const formatSrt = (entries: SubtitleEntry[]): string => {
  return entries
    .map(entry => {
      return `${entry.index}\n${entry.startTime} --> ${entry.endTime}\n${entry.text}`;
    })
    .join('\n\n') + '\n\n';
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
