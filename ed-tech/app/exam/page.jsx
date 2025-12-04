'use client'


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Clock, 
    Sun, 
    Moon, 
    Trash2, 
    Underline, 
    Flag, 
    ChevronDown, 
    Calculator,
    Check,
    X,
    MoreHorizontal
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* UTILS & SHADCN                               */
/* -------------------------------------------------------------------------- */

// Utility để gộp class (giả lập clsx + twMerge)
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

// --- SHADCN-LIKE PRIMITIVES (Tái sử dụng) ---

const Button = React.forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 dark:border-gray-800 dark:bg-black dark:text-gray-100 dark:hover:bg-gray-800",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
        ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-100",
        link: "text-primary underline-offset-4 hover:underline",
        nav: "bg-gray-900 dark:bg-black dark:border dark:border-gray-700 text-white hover:bg-gray-800",
    };
    
    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        pill: "rounded-full px-6 py-2"
    };

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});
Button.displayName = "Button";

const Badge = ({ className, variant = "default", children }) => {
    const variants = {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
        outline: "text-foreground",
        question: "bg-black dark:bg-gray-800 text-white dark:border dark:border-gray-700"
    };
    return (
        <div className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}>
            {children}
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                              */
/* -------------------------------------------------------------------------- */

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

const ExamUI = () => {
    // --- State ---
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1674); 
    const [isHighlightMode, setIsHighlightMode] = useState(false);
    const [isPoeMode, setIsPoeMode] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isReviewMarked, setIsReviewMarked] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [eliminatedOptions, setEliminatedOptions] = useState({});
    const [isNavModalOpen, setIsNavModalOpen] = useState(false);
    
    // Highlight
    const [highlights, setHighlights] = useState([]);
    const [popupStyle, setPopupStyle] = useState({ display: 'none' }); 
    const [activeHighlightId, setActiveHighlightId] = useState(null);
    const highlightIdRef = useRef(0);

    // Splitter
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); 
    const leftPanelRef = useRef(null);
    const splitterRef = useRef(null);
    const splitContainerRef = useRef(null);
    const highlightPopupRef = useRef(null);
    const readingPassageRef = useRef(null);
    
    const activeHighlight = highlights.find(h => h.id === activeHighlightId);
    
    // --- Effects ---

    // Dark Mode Sync
    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDarkMode]);

    // Timer
    useEffect(() => {
        if (isPaused || timeLeft <= 0) return;
        const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [isPaused, timeLeft]);

    // Splitter Logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!splitterRef.current?.isDragging) return;
            const containerRect = splitContainerRef.current.getBoundingClientRect();
            let newLeftPercentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            if (newLeftPercentage >= 30 && newLeftPercentage <= 70) setLeftPanelWidth(newLeftPercentage);
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
        
        const splitterElement = splitterRef.current;
        if (splitterElement) splitterElement.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            if (splitterElement) splitterElement.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);
    
    // Highlight Selection
    const handleSelection = useCallback(() => {
        if (!isHighlightMode) return;
        const selection = window.getSelection();
        const selectionText = selection.toString();
        const selectionRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        if (selectionText.length > 0 && selectionRange && readingPassageRef.current?.contains(selectionRange.commonAncestorContainer)) {
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
        if (!isHighlightMode || selectionText.length === 0) hideHighlightPopup();
    }, [isHighlightMode]);

    useEffect(() => {
        document.addEventListener('mouseup', handleSelection);
        return () => document.removeEventListener('mouseup', handleSelection);
    }, [handleSelection]);

    const showHighlightPopup = (spanElement, highlightId) => {
        if (!isHighlightMode) return;
        const rect = spanElement.getBoundingClientRect();
        const parentRect = leftPanelRef.current.getBoundingClientRect();
        setPopupStyle({
            display: 'flex',
            top: `${rect.top - parentRect.top - 45}px`,
            left: `calc(${rect.left - parentRect.left + (rect.width / 2)}px - 125px)`,
        });
        setActiveHighlightId(highlightId);
    };
    
    const hideHighlightPopup = () => {
        setPopupStyle({ display: 'none' });
        setActiveHighlightId(null);
    };
    
    const handleHighlightClick = (e) => {
        const target = e.target.closest('.highlighted-text');
        if (target) showHighlightPopup(target, target.dataset.highlightId);
        else if (!e.target.closest('#highlight-popup')) hideHighlightPopup();
    };
    
    const handleToolbarAction = (type, value) => {
        if (!activeHighlight) return;
        if (type === 'delete') {
            setHighlights(highlights.filter(h => h.id !== activeHighlightId));
            hideHighlightPopup();
        } else {
            setHighlights(highlights.map(h => {
                if (h.id !== activeHighlightId) return h;
                return type === 'color' ? { ...h, color: value } : { ...h, underline: !h.underline };
            }));
        }
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

    const formatTime = (totalSeconds) => {
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@700&family=Inter:wght@400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .font-mono { font-family: 'Roboto Mono', monospace; }
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .dark ::-webkit-scrollbar-thumb { background: #475569; }

                /* Highlight Colors */
                .highlighted-text { background-color: #fce38a; padding: 0 1px; border-radius: 2px; cursor: pointer; color: black; }
                .highlighted-text.color-blue { background-color: #a4e6f4; }
                .highlighted-text.color-pink { background-color: #f7b7e2; }
                .highlighted-text.underline { text-decoration: underline; text-decoration-thickness: 2px; }

                /* Splitter */
                .splitter { width: 2px; cursor: ew-resize; background-color: #e2e8f0; position: relative; z-index: 10; transition: background-color 0.2s; }
                .splitter:hover { background-color: #3b82f6; }
                .dark .splitter { background-color: #333; }
                .splitter-handle {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 24px; height: 24px; background: white; border: 1px solid #e2e8f0;
                    border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    display: flex; align-items: center; justify-content: center;
                }
                .dark .splitter-handle { background: #2d2d2d; border-color: #525252; }

                /* Header Gradient Line */
                .header-dash-line {
                    background-image: linear-gradient(to right, #3b82f6 50%, rgba(255, 255, 255, 0) 0%);
                    background-size: 10px 1px;
                }
                
                /* PoE Strikethrough */
                .poe-eliminated-text { text-decoration: line-through; opacity: 0.5; }
            `}</style>

            <div className="flex flex-col min-h-screen w-full transition-colors duration-200 bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100">
                
                {/* 1. HEADER */}
                <header className="flex-shrink-0 bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 h-16 sticky top-0 z-30 shadow-sm transition-colors">
                    <div className="max-w-[1400px] mx-auto px-4 h-full flex justify-between items-center relative">
                        {/* Left: Info */}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-base font-bold text-gray-800 dark:text-white leading-tight">Section 1, Module 1: Reading and Writing</h1>
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-gray-500 dark:text-gray-400 mt-0.5 hover:bg-transparent hover:text-gray-700 dark:hover:text-gray-200 justify-start">
                                <span>Directions</span> <ChevronDown className="w-3 h-3 ml-1" />
                            </Button>
                        </div>

                        {/* Center: Timer */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                            <span className="font-mono text-xl font-bold tracking-wider dark:text-white">{formatTime(timeLeft)}</span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsPaused(prev => !prev)}
                                className="h-5 text-[10px] uppercase font-bold tracking-widest px-2 py-0 mt-0.5 rounded-full border-gray-300 dark:border-gray-600 dark:bg-transparent dark:text-gray-400"
                            >
                                {isPaused ? 'Show' : 'Hide'}
                            </Button>
                        </div>

                        {/* Right: Tools */}
                        <div className="flex items-center space-x-1">
                            <Button 
                                variant="ghost" 
                                className={`flex-col h-14 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 gap-0 ${isHighlightMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                                onClick={handleToggleHighlight}
                            >
                                <span className="text-lg font-serif italic font-bold">A</span>
                                <span className="text-[10px] font-medium -mt-1">Annotate</span>
                            </Button>

                            <Button variant="ghost" className="flex-col h-14 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 gap-0 text-gray-600 dark:text-gray-400">
                                <Calculator className="w-5 h-5 mb-1" />
                                <span className="text-[10px] font-medium">Tools</span>
                            </Button>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsDarkMode(prev => !prev)} 
                                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-white ml-2"
                                title="Toggle Theme"
                            >
                                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                    {/* Blue Line */}
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 opacity-80"></div>
                </header>

                {/* 2. MAIN */}
                <main className="flex-grow flex flex-col w-full max-w-[1400px] mx-auto px-4 py-6 overflow-hidden h-[calc(100vh-8rem)]">
                    <div ref={splitContainerRef} className="flex flex-col lg:flex-row h-full rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
                        
                        {/* LEFT: PASSAGE */}
                        <div 
                            ref={leftPanelRef}
                            style={{ width: `${leftPanelWidth}%` }} 
                            className="bg-white dark:bg-[#121212] overflow-y-auto relative flex flex-col transition-colors"
                            onClick={handleHighlightClick}
                        >
                            <div className="p-8 md:p-10 max-w-3xl mx-auto">
                                {/* Highlight Toolbar Popup */}
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
                                    <button onClick={() => handleToolbarAction('underline')} className={`p-1 rounded hover:bg-gray-700 ${activeHighlight?.underline ? 'bg-gray-700' : ''}`}><Underline className="w-4 h-4" /></button>
                                    <button onClick={() => handleToolbarAction('delete')} className="p-1 rounded hover:bg-red-900/50 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                </div>

                                <div ref={readingPassageRef} className="prose dark:prose-invert max-w-none text-lg leading-loose font-serif text-gray-800 dark:text-gray-100">
                                    {renderPassage()}
                                </div>
                            </div>
                        </div>

                        {/* SPLITTER HANDLE */}
                        <div ref={splitterRef} className="splitter hidden lg:block">
                             <div id="splitter-handle" className="splitter-handle hover:scale-110 transition-transform">
                                <MoreHorizontal className="w-4 h-4 text-gray-400 dark:text-gray-500 transform rotate-90" />
                            </div>
                        </div>

                        {/* RIGHT: QUESTION */}
                        <div className={`flex-grow bg-white dark:bg-[#121212] flex flex-col ${isPoeMode ? 'poe-active' : ''} transition-colors`}>
                            
                            {/* Question Header */}
                            <div className="px-6 py-5">
                                <div className="bg-gray-100 border border-gray-200 dark:bg-black dark:border-gray-700 rounded-md flex justify-between items-center p-2 shadow-sm">
                                    <div className="flex items-center space-x-3 pl-2">
                                        <Badge variant="question" className="text-sm px-2.5 py-0.5 rounded">
                                            {MOCK_QUESTION.id}
                                        </Badge>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setIsReviewMarked(prev => !prev)}
                                            className="h-auto p-0 hover:bg-transparent group gap-2"
                                        >
                                            <Flag className={`w-5 h-5 ${isReviewMarked ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`} />
                                            <span className={`text-sm font-medium ${isReviewMarked ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-white group-hover:text-black dark:group-hover:text-white'}`}>
                                                {isReviewMarked ? 'Marked' : 'Mark for Review'}
                                            </span>
                                        </Button>
                                    </div>

                                    {/* PoE Toggle */}
                                    <Button 
                                        variant="ghost"
                                        onClick={() => { setIsPoeMode(!isPoeMode); if(!isPoeMode) setEliminatedOptions({}); }}
                                        className={`w-8 h-8 p-0 rounded relative ${isPoeMode ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                                        title="Eliminate Answer Choices"
                                    >
                                        <span className={`font-bold text-xs tracking-tighter ${isPoeMode ? 'line-through decoration-white/80' : ''}`}>ABC</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-grow px-8 pb-8 overflow-y-auto">
                                <p className="text-lg text-gray-900 dark:text-gray-100 mb-8 leading-relaxed font-medium">
                                    {MOCK_QUESTION.text}
                                </p>
                                
                                <div className="space-y-4">
                                    {MOCK_QUESTION.options.map((option) => (
                                        <div key={option.key} className="flex items-center group relative">
                                            <div 
                                                onClick={() => setSelectedAnswer(option.key)}
                                                className={cn(
                                                    "flex-grow flex items-center p-4 rounded-lg cursor-pointer border relative overflow-hidden transition-all",
                                                    selectedAnswer === option.key 
                                                        ? "bg-blue-50 border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,1)] dark:bg-blue-950/30 dark:border-blue-500" 
                                                        : "border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-700 dark:bg-[#1a1a1a] dark:hover:bg-[#262626] dark:hover:border-gray-600"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 transition-colors",
                                                    selectedAnswer === option.key
                                                        ? "bg-blue-600 border-blue-600 text-white"
                                                        : "border-gray-500 text-gray-500 dark:border-gray-400 dark:text-gray-400 bg-white dark:bg-transparent"
                                                )}>
                                                    {option.key}
                                                </div>
                                                <span className={cn(
                                                    "text-base font-medium",
                                                    eliminatedOptions[option.key] ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-800 dark:text-gray-100"
                                                )}>
                                                    {option.text}
                                                </span>
                                                {selectedAnswer === option.key && (
                                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                                )}
                                            </div>
                                            
                                            {/* PoE Button (Visible when Active) */}
                                            {isPoeMode && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => { e.stopPropagation(); setEliminatedOptions(prev => ({...prev, [option.key]: !prev[option.key]})); setSelectedAnswer(null); }}
                                                    className={cn(
                                                        "ml-3 h-8 w-8 rounded-full border bg-transparent",
                                                        eliminatedOptions[option.key] 
                                                            ? "border-red-500 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                                            : "border-gray-300 text-gray-400 hover:border-red-500 hover:text-red-500 dark:border-gray-600"
                                                    )}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* 3. FOOTER */}
                <footer className="flex-shrink-0 bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-gray-800 h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-30 transition-colors">
                    <div className="max-w-[1400px] mx-auto px-4 h-full flex justify-between items-center">
                        <div className="font-bold text-gray-700 dark:text-gray-300">Vinh Le</div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Button 
                                    variant="nav"
                                    size="pill"
                                    onClick={() => setIsNavModalOpen(!isNavModalOpen)}
                                    className="gap-2 shadow-lg"
                                >
                                    <span>Question {MOCK_QUESTION.id} of 27</span>
                                    <ChevronDown className="w-4 h-4 rotate-180" />
                                </Button>
                                {/* Popover Content */}
                                {isNavModalOpen && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-72 bg-white dark:bg-[#121212] p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="grid grid-cols-5 gap-2">
                                            {[...Array(27)].map((_, i) => (
                                                <button key={i} className={cn(
                                                    "h-8 rounded text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                                                    i === 0 
                                                        ? "bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700" 
                                                        : "bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                                                )}>
                                                    {i+1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button variant="ghost" size="pill" className="font-bold text-gray-600 dark:text-gray-300">
                                Back
                            </Button>
                            <Button size="pill" className="font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                                Next
                            </Button>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};

export default ExamUI;