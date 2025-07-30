// src/components/CodeBlock.jsx
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

// --- THIS IS THE FIX ---
// Helper function to map common language names to what the highlighter expects.
const getHighlighterLanguage = (lang) => {
    // Sanitize the input to be safe
    const lowerLang = (lang || '').toLowerCase();

    switch (lowerLang) {
        case 'c++':
            return 'cpp'; // <-- The critical mapping
        case 'javascript':
            return 'javascript';
        case 'js':
            return 'javascript';
        case 'java':
            return 'java';
        case 'python':
            return 'python';
        case 'py':
            return 'python';
        default:
            // If it's not a special case, return it as is (or a default)
            return lowerLang || 'text';
    }
};



function CodeBlock({ language, code }) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };
    
    // Use the helper function to get the correct language string
    const highlighterLang = getHighlighterLanguage(language);

    return (
        <div className="my-4 rounded-md bg-[#2d2d2d] overflow-y-auto  hide-scrollbar ">
            {/* Header */}
            <div className="flex hide-scrollbar items-center justify-between px-4 py-2 text-xs text-gray-300 bg-gray-800 rounded-t-md">
                <span className='text-lg '>{language}</span> {/* Display the original friendly name */}
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 p-1 text-gray-300 rounded hover:bg-gray-700 hover:cursor-pointer text-base "
                >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    {isCopied ? 'Copied!' : 'Copy Code'}
                </button>
            </div>

            {/* Code */}
            <SyntaxHighlighter
                language={highlighterLang} // <-- Use the sanitized language name
                style={atomDark}
                customStyle={{
                    margin: 0,
                    padding: '16px',
                    backgroundColor: '#2d2d2d',
                    borderBottomLeftRadius: '0.375rem',
                    borderBottomRightRadius: '0.375rem',
                    lineHeight: '1.6',
                    
                }}
                codeTagProps={{
                    style: {
                        // fontFamily: 'inherit',
                        fontFamily: '"JetBrains Mono", "Fira Mono", monospace',
                        fontSize: '14px',
                    },
                }}
                // Prevent error if code is null or undefined
                children={String(code || '')} 
            />
        </div>
    );
}

export default CodeBlock;