import React from 'react';
import type { SubtitleEntry } from '../types';

interface SubtitleTableProps {
  originalSrt: SubtitleEntry[];
  translatedSrt: SubtitleEntry[];
  refinedSrt: SubtitleEntry[] | null;
}

export const SubtitleTable: React.FC<SubtitleTableProps> = ({ originalSrt, translatedSrt, refinedSrt }) => {
  if (originalSrt.length === 0) {
    return null;
  }

  const findText = (entries: SubtitleEntry[], index: number) => {
    return entries.find(e => e.index === index)?.text || '';
  };

  return (
    <div className="w-full mt-8 flow-root">
       <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6 w-16">#</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white w-48">Mốc Thời Gian</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Bản Gốc (Tiếng Trung)</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Bản Dịch Thô (Tiếng Việt)</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Bản Dịch AI Tinh Chỉnh</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-gray-900/80">
          {originalSrt.map((entry) => (
            <tr key={entry.index} className="hover:bg-gray-700/50 transition-colors">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-300 sm:pl-6">{entry.index}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400 font-mono">{entry.startTime} &rarr; {entry.endTime}</td>
              <td className="whitespace-normal px-3 py-4 text-sm text-gray-300 align-top">{findText(originalSrt, entry.index)}</td>
              <td className="whitespace-normal px-3 py-4 text-sm text-gray-300 align-top">{findText(translatedSrt, entry.index)}</td>
              <td className="whitespace-normal px-3 py-4 text-sm text-emerald-300 align-top">
                {refinedSrt ? findText(refinedSrt, entry.index) : <span className="text-gray-500">Chưa tạo</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
      </div>
    </div>
  );
};