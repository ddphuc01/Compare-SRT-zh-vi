import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from './Icon';

export const ScrollButtons: React.FC = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2">
            <button
                onClick={scrollToTop}
                aria-label="Cuộn lên đầu trang"
                className="p-3 bg-gray-700/80 text-white rounded-full shadow-lg hover:bg-indigo-600 backdrop-blur-sm transition-all duration-200"
            >
                <ArrowUpIcon className="h-6 w-6" />
            </button>
            <button
                onClick={scrollToBottom}
                aria-label="Cuộn xuống cuối trang"
                className="p-3 bg-gray-700/80 text-white rounded-full shadow-lg hover:bg-indigo-600 backdrop-blur-sm transition-all duration-200"
            >
                <ArrowDownIcon className="h-6 w-6" />
            </button>
        </div>
    );
};