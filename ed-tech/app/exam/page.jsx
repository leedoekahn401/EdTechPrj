'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Icon Components ---
const ClockIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const SunIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
);
const MoonIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);
const CalculatorIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="2"></rect>
        <line x1="8" y1="6" x2="16" y2="6" strokeWidth="2"></line>
        <line x1="16" y1="14" x2="16" y2="18" strokeWidth="2"></line>
        <path d="M16 10h.01"></path>
        <path d="M12 10h.01"></path>
        <path d="M8 10h.01"></path>
        <path d="M12 14h.01"></path>
        <path d="M8 14h.01"></path>
        <path d="M12 18h.01"></path>
        <path d="M8 18h.01"></path>
    </svg>
);
const TrashIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const UnderlineIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
);
const FlagIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
);
const ChevronDownIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

// --- Static Data ---
const MOCK_QUESTION = {
    id: 1,
    text: "Which choice completes the text with the most logical and precise word or phrase?",
    passage: `Although critics believed that customers would never agree to pay to pick their own produce on farms, such concerns didn't __________ Whatley's efforts to promote the practice. Thanks in part to Whatley's determined advocacy, farms that allow visitors to pick their own apples, pumpkins, and other produce can be found throughout the United States.`,
    options: [
        { key: 'A', text: 'enhance' },
        { key: 'B', text: 'hinder' },
        { key: 'C', text: 'misrepresent' },
        { key: 'D', text: 'aggravate' },
    ]
};

const COLOR_MAP = {
    yellow: '#fce38a',
    blue: '#a4e6f4',
    pink: '#f7b7e2',
};

// Define colors
const DARK_BG = '#000000'; // Pure black for high contrast
const DARK_PANEL = '#121212'; // Slightly lighter black for panels
const PRIMARY_COLOR = '#3b82f6'; // Bright Blue

const ExamUI = () => {
    // --- State Management ---
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1674); 
    const [isHighlightMode, setIsHighlightMode] = useState(false);
    const [isPoeMode, setIsPoeMode] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isReviewMarked, setIsReviewMarked] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [eliminatedOptions, setEliminatedOptions] = useState({});
    const [isNavModalOpen, setIsNavModalOpen] = useState(false);
    
    // Highlight State
    const [highlights, setHighlights] = useState([]);
    const [popupStyle, setPopupStyle] = useState({ display: 'none' }); 
    const [activeHighlightId, setActiveHighlightId] = useState(null);
    const highlightIdRef = useRef(0);

    // Splitter State
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage

    // --- Refs ---
    const leftPanelRef = useRef(null);
    const splitterRef = useRef(null);
    const splitContainerRef = useRef(null);
    const highlightPopupRef = useRef(null);
    const readingPassageRef = useRef(null);
    
    // --- Computed State ---
    const activeHighlight = highlights.find(h => h.id === activeHighlightId);
    
    // --- Effects & Logic ---

    // Dark Mode Sync
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Timer Logic
    useEffect(() => {
        if (isPaused || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isPaused, timeLeft]);

    // Splitter Logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!splitterRef.current || !splitterRef.current.isDragging) return;
            const containerRect = splitContainerRef.current.getBoundingClientRect();
            let newLeftWidth = e.clientX - containerRect.left;
            let newLeftPercentage = (newLeftWidth / containerRect.width) * 100;
            if (newLeftPercentage >= 30 && newLeftPercentage <= 70) {
                setLeftPanelWidth(newLeftPercentage);
            }
        };

        const handleMouseUp = () => {
            if (splitterRef.current) {
                splitterRef.current.isDragging = false;
                document.body.classList.remove('select-none');
            }
        };

        const handleMouseDown = (e) => {
            if (e.target === splitterRef.current || e.target.closest('#splitter-handle')) {
                e.preventDefault();
                splitterRef.current.isDragging = true;
                document.body.classList.add('select-none');
            }
        };
        
        if (typeof window !== 'undefined') {
            const splitterElement = splitterRef.current;
            if (splitterElement) splitterElement.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                if (splitterElement) splitterElement.removeEventListener('mousedown', handleMouseDown);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, []);
    
    // Highlight Text Selection Logic
    const handleSelection = useCallback(() => {
        if (!isHighlightMode) return;
        const selection = window.getSelection();
        const selectionText = selection.toString();
        const selectionRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        if (selectionText.length > 0 && selectionRange) {
            if (readingPassageRef.current && readingPassageRef.current.contains(selectionRange.commonAncestorContainer)) {
                if (selectionRange.commonAncestorContainer.closest('.highlighted-text')) return;

                const newHighlight = {
                    id: `hl-${highlightIdRef.current++}`,
                    text: selectionText,
                    color: 'yellow',
                    underline: false,
                    startOffset: MOCK_QUESTION.passage.indexOf(selectionText),
                };

                setHighlights(prev => [...prev, newHighlight]);
                selection.removeAllRanges();

                setTimeout(() => {
                    const newSpan = document.querySelector(`[data-highlight-id="${newHighlight.id}"]`);
                    if (newSpan) showHighlightPopup(newSpan, newHighlight.id);
                }, 0);
            }
        }
        if (!isHighlightMode || selectionText.length === 0) {
            hideHighlightPopup();
        }
    }, [isHighlightMode]);

    useEffect(() => {
        document.addEventListener('mouseup', handleSelection);
        return () => document.removeEventListener('mouseup', handleSelection);
    }, [handleSelection]);

    const showHighlightPopup = (spanElement, highlightId) => {
        if (!isHighlightMode) return;
        const rect = spanElement.getBoundingClientRect();
        const parentRect = leftPanelRef.current.getBoundingClientRect();
        const popupTop = rect.top - parentRect.top - 45;
        let popupLeft = rect.left - parentRect.left + (rect.width / 2);
        
        setPopupStyle({
            display: 'flex',
            top: `${popupTop}px`,
            left: `calc(${popupLeft}px - 125px)`,
        });
        setActiveHighlightId(highlightId);
    };
    
    const hideHighlightPopup = () => {
        setPopupStyle({ display: 'none' });
        setActiveHighlightId(null);
    };
    
    const handleHighlightClick = (e) => {
        const target = e.target.closest('.highlighted-text');
        if (target) {
            showHighlightPopup(target, target.dataset.highlightId);
        } else if (!e.target.closest('#highlight-popup')) {
            hideHighlightPopup();
        }
    };
    
    const handleToolbarAction = (type, value) => {
        if (!activeHighlight) return;
        let newHighlights = [];
        if (type === 'delete') {
            newHighlights = highlights.filter(h => h.id !== activeHighlightId);
            hideHighlightPopup();
        } else {
            newHighlights = highlights.map(h => {
                if (h.id !== activeHighlightId) return h;
                if (type === 'color') return { ...h, color: value };
                if (type === 'underline') return { ...h, underline: !h.underline };
                return h;
            });
        }
        setHighlights(newHighlights);
    };

    const renderPassage = () => {
        let processedContent = MOCK_QUESTION.passage;
        const sortedHighlights = [...highlights].sort((a, b) => a.startOffset - b.startOffset);
        sortedHighlights.forEach(h => {
             const classList = `highlighted-text color-${h.color} ${h.underline ? 'underline' : ''}`;
             processedContent = processedContent.replace(h.text, `<span data-highlight-id="${h.id}" class="${classList}">${h.text}</span>`);
        });
        return <div dangerouslySetInnerHTML={{ __html: processedContent.replace(/\n/g, '<p>') }} />;
    };
    
    const handleToggleHighlight = () => {
        setIsHighlightMode(prev => !prev);
        window.getSelection().removeAllRanges();
        hideHighlightPopup();
    };

    const handleTogglePoe = () => {
        setIsPoeMode(prev => !prev);
        if (isPoeMode) setEliminatedOptions({});
    };

    const handleAnswerSelect = (key) => {
        setSelectedAnswer(key);
    };

    const handlePoeEliminate = (key) => {
        if (!isPoeMode) return;
        setEliminatedOptions(prev => ({ ...prev, [key]: !prev[key] }));
        if (selectedAnswer === key) setSelectedAnswer(null);
    };

    const formatTime = (totalSeconds) => {
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const timerDisplay = formatTime(timeLeft);

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@700&family=Inter:wght@400;500;600;700&display=swap');
                
                body { font-family: 'Inter', sans-serif; }
                .font-mono { font-family: 'Roboto Mono', monospace; }

                /* Custom scrollbar to match app feel */
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .dark ::-webkit-scrollbar-thumb { background: #475569; }

                /* Theme Colors */
                .bg-darkbg { background-color: ${DARK_BG}; }
                .text-darktext { color: #f8fafc; } /* Brighter white for text */
                .bg-darkpanel { background-color: ${DARK_PANEL}; }
                
                /* Highlight Styles */
                .highlight-active-button {
                    background-color: #eff6ff;
                    color: ${PRIMARY_COLOR};
                    border-bottom: 2px solid ${PRIMARY_COLOR};
                }
                .dark .highlight-active-button {
                    background-color: #1e293b;
                    color: #60a5fa;
                }
                .highlighted-text { background-color: #fce38a; padding: 0 1px; border-radius: 2px; cursor: pointer; color: black; }
                .highlighted-text.color-blue { background-color: #a4e6f4; }
                .highlighted-text.color-pink { background-color: #f7b7e2; }
                .highlighted-text.underline { text-decoration: underline; text-decoration-thickness: 2px; }

                /* Splitter */
                .splitter { width: 2px; cursor: ew-resize; background-color: #e2e8f0; position: relative; z-index: 10; transition: background-color 0.2s; }
                .splitter:hover { background-color: ${PRIMARY_COLOR}; }
                .dark .splitter { background-color: #333; }
                .splitter-handle {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 24px; height: 24px; background: white; border: 1px solid #e2e8f0;
                    border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    display: flex; align-items: center; justify-content: center;
                }
                .dark .splitter-handle { background: #2d2d2d; border-color: #525252; }

                /* Answer Options */
                .answer-option-label {
                    transition: all 0.15s ease-in-out;
                    border: 1px solid #cbd5e1;
                }
                .dark .answer-option-label { border-color: #404040; background-color: #1a1a1a; }
                
                .answer-option-label:hover { border-color: #94a3b8; background-color: #f8fafc; }
                .dark .answer-option-label:hover { border-color: #737373; background-color: #262626; }

                .answer-option-label.selected {
                    background-color: #e0f2fe; border-color: ${PRIMARY_COLOR}; box-shadow: 0 0 0 1px ${PRIMARY_COLOR};
                }
                .dark .answer-option-label.selected {
                    background-color: #0f172a; border-color: #3b82f6;
                }

                .option-circle {
                    width: 28px; height: 28px; border: 1px solid #64748b; color: #64748b;
                }
                .dark .option-circle { border-color: #a3a3a3; color: #a3a3a3; }
                
                .answer-option-label.selected .option-circle {
                    background-color: ${PRIMARY_COLOR}; border-color: ${PRIMARY_COLOR}; color: white;
                }

                /* PoE Styles */
                .poe-option-button { display: none; }
                .poe-active .poe-option-button { display: flex; }
                .poe-option-button.eliminated { color: #ef4444; border-color: #ef4444; }
                .poe-eliminated-text { text-decoration: line-through; opacity: 0.5; }

                /* Header Dashed Line */
                .header-dash-line {
                    height: 2px;
                    background-image: linear-gradient(to right, #3b82f6 50%, rgba(255, 255, 255, 0) 0%);
                    background-position: bottom;
                    background-size: 10px 1px;
                    background-repeat: repeat-x;
                }
            `}</style>

            {/* MAIN WRAPPER: Dark mode uses pure black background */}
            <div className={`flex flex-col min-h-screen w-full transition-colors duration-200 bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100`}>
                
                {/* 1. TOP HEADER */}
                <header className="flex-shrink-0 bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 h-16 sticky top-0 z-30 shadow-sm transition-colors">
                    <div className="max-w-[1400px] mx-auto px-4 h-full flex justify-between items-center">
                        {/* Left */}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-base font-bold text-gray-800 dark:text-white leading-tight">Section 1, Module 1: Reading and Writing</h1>
                            <button className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5 hover:text-gray-700 dark:hover:text-gray-200">
                                <span>Directions</span> <ChevronDownIcon className="w-3 h-3 ml-1" />
                            </button>
                        </div>

                        {/* Center: Timer */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                            <span className="font-mono text-xl font-bold tracking-wider dark:text-white">{timerDisplay}</span>
                            <button 
                                onClick={() => setIsPaused(prev => !prev)}
                                className="text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-full px-2 py-0.5 mt-0.5 bg-white dark:bg-transparent"
                            >
                                {isPaused ? 'Show' : 'Hide'}
                            </button>
                        </div>

                        {/* Right: Tools */}
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={handleToggleHighlight}
                                className={`flex flex-col items-center justify-center px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isHighlightMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                                <span className="text-lg font-serif italic font-bold">A</span>
                                <span className="text-[10px] font-medium mt-[-2px]">Annotate</span>
                            </button>
                            <button className="flex flex-col items-center justify-center px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
                                <CalculatorIcon className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-medium">Tools</span>
                            </button>
                             {/* Dark Mode Toggle */}
                             <button onClick={() => setIsDarkMode(prev => !prev)} className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-white" title="Toggle Theme">
                                {isDarkMode ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    {/* Blue Dashed Line at Bottom of Header */}
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 opacity-80"></div>
                </header>

                {/* 2. MAIN CONTENT */}
                <main className="flex-grow flex flex-col w-full max-w-[1400px] mx-auto px-4 py-6 overflow-hidden h-[calc(100vh-8rem)]">
                    <div ref={splitContainerRef} className="flex flex-col lg:flex-row h-full rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
                        
                        {/* LEFT PANEL: PASSAGE */}
                        <div 
                            ref={leftPanelRef}
                            style={{ width: `${leftPanelWidth}%` }} 
                            className="bg-white dark:bg-[#121212] overflow-y-auto relative flex flex-col transition-colors"
                            onClick={handleHighlightClick}
                        >
                            <div className="p-8 md:p-10 max-w-3xl mx-auto">
                                {/* Highlight Popup */}
                                <div 
                                    ref={highlightPopupRef}
                                    id="highlight-popup" 
                                    className="absolute z-50 p-1.5 bg-gray-900 text-white rounded shadow-xl flex items-center gap-2"
                                    style={popupStyle}
                                >
                                    {Object.entries(COLOR_MAP).map(([key, color]) => (
                                        <button 
                                            key={key}
                                            onClick={() => handleToolbarAction('color', key)}
                                            className={`w-6 h-6 rounded-full border-2 ${activeHighlight?.color === key ? 'border-white' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <div className="w-px h-5 bg-gray-600 mx-1"></div>
                                    <button onClick={() => handleToolbarAction('underline')} className={`p-1 rounded hover:bg-gray-700 ${activeHighlight?.underline ? 'bg-gray-700' : ''}`}><UnderlineIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleToolbarAction('delete')} className="p-1 rounded hover:bg-red-900/50 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                                </div>

                                <div ref={readingPassageRef} className="prose dark:prose-invert max-w-none text-lg leading-loose font-serif text-gray-800 dark:text-gray-100">
                                    {renderPassage()}
                                </div>
                            </div>
                        </div>

                        {/* SPLITTER */}
                        <div ref={splitterRef} className="splitter hidden lg:block">
                             <div id="splitter-handle" className="splitter-handle hover:scale-110 transition-transform">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500">
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="19" cy="12" r="1" />
                                    <circle cx="5" cy="12" r="1" />
                                </svg>
                            </div>
                        </div>

                        {/* RIGHT PANEL: QUESTION */}
                        <div className={`flex-grow bg-white dark:bg-[#121212] flex flex-col ${isPoeMode ? 'poe-active' : ''} transition-colors`}>
                            
                            {/* --- QUESTION HEADER BAR --- */}
                            <div className="px-6 py-5">
                                {/* In Dark Mode: Add a border to the header bar so it stands out against the black panel background */}
                                <div className="bg-gray-100 border border-gray-200 dark:bg-black dark:border-gray-700 rounded-md flex justify-between items-center p-2 shadow-sm">
                                    {/* Left Side: Question Number & Mark for Review */}
                                    <div className="flex items-center space-x-3 pl-2">
                                        <div className="text-white font-bold text-sm bg-black dark:bg-gray-800 px-2.5 py-0.5 rounded border border-gray-700">
                                            {MOCK_QUESTION.id}
                                        </div>
                                        <button 
                                            onClick={() => setIsReviewMarked(prev => !prev)}
                                            className="flex items-center space-x-2 text-gray-700 dark:text-white hover:text-black dark:hover:text-gray-300 transition-colors group"
                                        >
                                            <FlagIcon className={`w-5 h-5 ${isReviewMarked ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`} />
                                            <span className={`text-sm font-medium ${isReviewMarked ? 'text-red-600 dark:text-red-400' : ''}`}>
                                                {isReviewMarked ? 'Marked' : 'Mark for Review'}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Right Side: PoE Toggle */}
                                    <button 
                                        onClick={handleTogglePoe}
                                        className={`relative w-8 h-8 rounded flex items-center justify-center transition-all ${isPoeMode ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                                        title="Eliminate Answer Choices"
                                    >
                                        <span className="font-bold text-xs tracking-tighter" style={{ textDecoration: isPoeMode ? 'line-through' : 'none' }}>ABC</span>
                                        {isPoeMode && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-5 h-0.5 bg-white opacity-80 transform -rotate-45"></div>
                                        </div>}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-grow px-8 pb-8 overflow-y-auto">
                                <p className="text-lg text-gray-900 dark:text-gray-100 mb-8 leading-relaxed font-medium">
                                    {MOCK_QUESTION.text}
                                </p>
                                
                                <div className="space-y-4">
                                    {MOCK_QUESTION.options.map((option) => (
                                        <div key={option.key} className="flex items-center group">
                                            <label 
                                                onClick={() => handleAnswerSelect(option.key)}
                                                className={`flex-grow flex items-center p-4 rounded-lg cursor-pointer answer-option-label relative overflow-hidden ${selectedAnswer === option.key ? 'selected' : ''}`}
                                            >
                                                <div className={`option-circle rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 bg-white dark:bg-transparent transition-colors`}>
                                                    {option.key}
                                                </div>
                                                <span className={`text-base text-gray-800 dark:text-gray-100 font-medium ${eliminatedOptions[option.key] ? 'poe-eliminated-text' : ''}`}>
                                                    {option.text}
                                                </span>
                                                {selectedAnswer === option.key && (
                                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                                )}
                                            </label>
                                            
                                            {/* PoE Eliminator Button */}
                                            <button 
                                                onClick={() => handlePoeEliminate(option.key)}
                                                className={`ml-3 poe-option-button w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 items-center justify-center text-xs font-bold text-gray-400 hover:border-red-500 hover:text-red-500 transition-colors ${eliminatedOptions[option.key] ? 'eliminated' : ''}`}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* 3. BOTTOM FOOTER */}
                <footer className="flex-shrink-0 bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-gray-800 h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-30 transition-colors">
                    <div className="max-w-[1400px] mx-auto px-4 h-full flex justify-between items-center">
                        <div className="font-bold text-gray-700 dark:text-gray-300">Vinh Le</div>

                        <div className="flex items-center space-x-4">
                             {/* Question Navigator */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsNavModalOpen(!isNavModalOpen)}
                                    className="bg-gray-900 dark:bg-black dark:border dark:border-gray-700 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors flex items-center shadow-lg"
                                >
                                    <span>Question {MOCK_QUESTION.id} of 27</span>
                                    <svg className="w-4 h-4 ml-2 transform -rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                                {/* Nav Modal */}
                                {isNavModalOpen && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-72 bg-white dark:bg-[#121212] p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                                        <div className="grid grid-cols-5 gap-2">
                                            {[...Array(27)].map((_, i) => (
                                                <button key={i} className={`h-8 rounded text-sm font-medium ${i===0 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200'}`}>{i+1}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button className="px-6 py-2 rounded-full font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                Back
                            </button>
                            <button className="px-8 py-2 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md">
                                Next
                            </button>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};

export default ExamUI;
