import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Send, CircleUser, Bot , StopCircle } from 'lucide-react';
import CodeBlock from "./CodeBlock";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// No changes needed in this component
const MessageContent = ({ content, isStreaming }) => {
    return (
        <ReactMarkdown
            children={content}
            remarkPlugins={[remarkGfm]}
            // The prose classes applied to the parent will style this output
            components={{
                code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    // return match && !isStreaming ? (
                    //     <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                    // ) : (
                    //     <code {...rest} className={className}>
                    //         {children}
                    //     </code>
                    // );
                    // This enables real-time syntax highlighting.
                    if (match) {
                        return (
                            <div className="scrollbar-hide relative"> {/* Wrapper for positioning the cursor */}
                                <CodeBlock
                                    language={match[1]}
                                    code={String(children).replace(/\n$/, '')}
                                />
                                {isStreaming && (
                                    <span className="absolute bottom-1 right-2 w-2 h-4 bg-white/70 animate-pulse" />
                                )}
                            </div>
                        );
                    }

                    // For inline code or code without a specified language, use a standard <code> tag.
                    return (
                        <code {...rest} className={className}>
                            {children}
                        </code>
                    );
                }
            }}
        />
    );
};

// All logic is preserved. Only the JSX return block is modified for styling.
function ChatAi({ problem, chatMsg, setChatMsg }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isStreaming, setIsStreaming] = useState(false);

    const charQueue = useRef([]);
    const timeoutId = useRef(null);
    const isStreamingRef = useRef(false);
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null); // Ref for the scrollable message area
    const abortControllerRef = useRef(null); // Ref to hold the AbortController

    // --- All useEffects and the onSubmit function remain exactly the same ---
    useEffect(() => {
        isStreamingRef.current = isStreaming;
    }, [isStreaming]);

    useEffect(() => {
        if (chatMsg.length === 0 && problem) {
            setChatMsg([
                { role: 'model', content: `Hello! I'm here to help you with the "${problem.title}" problem. How can I assist you?` }
            ]);
        }
    }, [problem, chatMsg.length, setChatMsg]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollThreshold = 50; // pixels
            const isScrolledToBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= scrollThreshold;
            // Check if user is near the bottom before auto-scrolling
            // const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 1; // +1 for tolerance
            if (isScrolledToBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [chatMsg]);
    
    
    const handleStopStreaming = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort(); // Abort the fetch request
            abortControllerRef.current = null;
        }
        setIsStreaming(false); // Manually set streaming to false
        clearTimeout(timeoutId.current); // Stop the text processing queue
    };

    const processQueue = useCallback(() => {
        if (charQueue.current.length > 0) {
            const charsToAdd = charQueue.current.splice(0, 5).join('');
            setChatMsg(prev => {
                const lastMsgIndex = prev.length - 1;
                if (lastMsgIndex >= 0 && prev[lastMsgIndex].role === 'model') {
                    const updated = [...prev];
                    updated[lastMsgIndex] = {
                        ...updated[lastMsgIndex],
                        content: (updated[lastMsgIndex].content || '') + charsToAdd
                    };
                    return updated;
                }
                return prev;
            });
        }
        if (charQueue.current.length === 0 && !isStreamingRef.current) {
            clearTimeout(timeoutId.current);
            timeoutId.current = null;
            setIsStreaming(false);
            return;
        }
        timeoutId.current = setTimeout(processQueue, 25);
    }, [setChatMsg]);

    const onSubmit = async (data) => {
        if (isStreaming) return;
        const userMessage = { role: 'user', content: data.message };
        setChatMsg(prev => [...prev, userMessage]);

         setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 0);

        const historyForApi = chatMsg.map(msg => ({ role: msg.role, parts: [{ text: msg.content || '' }] }));
        charQueue.current = [];       
        reset();
        setIsStreaming(true);

        if (!timeoutId.current) {
            timeoutId.current = setTimeout(processQueue, 30);
        }
        try {
            
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            setChatMsg(prev => [...prev, { role: 'model', content: '' }]);
            const API_URL = import.meta.env.VITE_API_URL;
            const response = await fetch(`${API_URL}/ai/chat-stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    messages: [...historyForApi, { role: 'user', parts: [{ text: data.message }] }],
                    title: problem.title,
                    description: problem.description,
                    testCases: problem.visibleTestCases,
                    startCode: problem.startCode
                }) ,
                signal
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred.' }));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            if (!response.body) throw new Error("Response body is missing.");
            const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const lines = value.split('\n\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.substring(6);
                        if (jsonStr.includes('[DONE]')) continue;
                        try {
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.text) {
                                charQueue.current.push(...parsed.text.split(''));
                            }
                        } catch (e) {
                            console.error("Failed to parse stream JSON:", jsonStr);
                        }
                    }
                }
            }
        } catch (error) {
            // Gracefully handle the abortion of the request
            if (error.name === 'AbortError') {
                console.log("Stream stopped by user.");
                // setChatMsg(prev => {
                //     const lastMsg = prev[prev.length - 1];
                //     if (lastMsg.role === 'model' && lastMsg.content === '') {
                //         return prev.slice(0, -1); // Remove empty model message
                //     }
                //     return prev;
                // });
                return ;
            } 
            // Exit without showing an error
            console.error("API Error:", error);
            setChatMsg(prev => {
                const lastMsgIndex = prev.length - 1;
                const updated = [...prev];
                updated[lastMsgIndex] = { ...updated[lastMsgIndex], content: `\n\n**Error:** ${error.message}` };
                return updated;
            });
        } finally {
            // setIsStreaming(false);
            isStreamingRef.current = false;
            abortControllerRef.current = null;
        }
    };
    
    // --- STYLING APPLIED TO THE JSX BELOW ---

    return (
        // --- LAYOUT FIX: Use h-full and flex-col for proper containment ---
        <div className="flex flex-col h-full bg-transparent">
            {/* Messages Area */}
            <div ref={scrollContainerRef} className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto hide-scrollbar">
                {chatMsg.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex hide-scrollbar items-start gap-3 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'model' && (
                            <div className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[var(--primary-from)] to-[var(--primary-to)] flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div className={`max-w-lg md:max-w-xl hide-scrollbar lg:max-w-2xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-[var(--primary-from)]/10 text-foreground rounded-br-lg' : 'bg-[var(--input-background)] text-foreground/90 rounded-bl-lg'}`}>
                            <div className="prose prose-sm md:prose-base prose-invert prose-p:my-2 hide-scrollbar prose-headings:text-foreground/90 prose-strong:text-foreground prose-a:text-[var(--primary-from)]">
                                <MessageContent content={msg.content} isStreaming={isStreaming && index === chatMsg.length - 1} />
                                {index === chatMsg.length - 1 && isStreaming && msg.role === 'model' && (
                                    <span className="ml-1 inline-block w-2 h-4 bg-[var(--primary-from)]/80 animate-pulse hide-scrollbar" />
                                )}
                            </div>
                        </div>
                        {msg.role === 'user' && (
                            // --- STYLING FIX: Themed User Icon ---
                            <div className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[var(--primary-from)] to-[var(--primary-to)] flex items-center justify-center">
                                <CircleUser className="w-5 h-5 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form Area */}
            <div className="flex-shrink-0 p-3 md:p-4 border-t border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-3">
                    <input
                        placeholder={isStreaming ? "AI is responding..." : "Ask a follow-up question..."}
                        className="w-full bg-[var(--input-background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] transition-all duration-200 disabled:opacity-60"
                        {...register("message", { required: true, minLength: 2 })}
                        disabled={isStreaming}
                        autoComplete="off"
                    />
                    {/* --- FEATURE: Dynamic Send/Stop Button --- */}
                    {isStreaming ? (
                        <button
                            type="button"
                            onClick={handleStopStreaming}
                            className="p-2.5 rounded-lg bg-[var(--primary-from)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer "
                            aria-label="Stop generating"
                        >
                             <StopCircle size={20} />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="p-2.5 rounded-lg bg-[var(--primary-from)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer "
                            disabled={!!errors.message}
                            aria-label="Send message"
                        >
                            <Send size={20} />
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}

export default ChatAi;




// src/components/ChatAi.jsx
// import { useState, useRef, useEffect , useCallback} from "react";
// import { useForm } from "react-hook-form";
// import { Send , CircleUser , Bot} from 'lucide-react';
// import CodeBlock from "./CodeBlock";
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

// const MessageContent = ({ content , isStreaming }) => {
//     // ... (This component is correct, no changes needed)
//     return (
//         <ReactMarkdown
//             children={content}
//             remarkPlugins={[remarkGfm]}
//             components={{
//                 code(props) {
//                     const {children, className, node, ...rest} = props
//                     const match = /language-(\w+)/.exec(className || '')
//                     return match && !isStreaming ? (
//                         <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
//                     ) : (
//                         <code {...rest} className={className}>
//                             {children}
//                         </code>
//                     )
//                 }
//             }}
//         />
//     )
// }

// function ChatAi({ problem, chatMsg, setChatMsg }) {
//     const { register, handleSubmit, reset, formState: { errors } } = useForm();
//     const messagesEndRef = useRef(null);
//     const [isStreaming, setIsStreaming] = useState(false);

//     const charQueue = useRef([]);
//     const timeoutId = useRef(null);
//     // const TYPING_SPEED_MS = 25;

//     // This ref will safely track the streaming status inside the timer
//     const isStreamingRef = useRef(false);

//     useEffect(() => {
//         isStreamingRef.current = isStreaming;
//     }, [isStreaming]);

//     // This useEffect is fine, but simplified dependencies
//     useEffect(() => {
//         if (chatMsg.length == 0 && problem) {
//             setChatMsg([
//                 { role: 'model', content: `Hello! I'm here to help you with the "${problem.title}" problem. How can I assist you?` }
//             ]);   
//         }
//     }, [problem , chatMsg.length, setChatMsg]);


//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [chatMsg]);

//         const processQueue = useCallback(() => {
//         // If there's content in the queue, process it
//         if (charQueue.current.length > 0) {
//             const charsToAdd = charQueue.current.splice(0, 5).join('');
//             setChatMsg(prev => {
//                 const lastMsgIndex = prev.length - 1;
//                 if (lastMsgIndex >= 0 && prev[lastMsgIndex].role === 'model') {
//                     const updated = [...prev];
//                     updated[lastMsgIndex] = {
//                         ...updated[lastMsgIndex],
//                         content: (updated[lastMsgIndex].content || '') + charsToAdd
//                     };
//                     return updated;
//                 }
//                 return prev;
//             });
//         }

//         // If the queue is empty AND the network stream is finished, we stop.
//         if (charQueue.current.length === 0 && !isStreamingRef.current) {
//             clearTimeout(timeoutId.current);
//             timeoutId.current = null;
//             return;
//         }

//         // Otherwise, schedule the next run. This continues running even if the queue is temporarily empty but the stream is still active.
//         timeoutId.current = setTimeout(processQueue, 25); // Typing speed
//     }, [setChatMsg]);


//     const onSubmit = async (data) => {
//         if (isStreaming) return;

//         const userMessage = { role: 'user', content: data.message };
//         const historyForApi = chatMsg.map(msg => ({
//             role: msg.role,
//             parts: [{ text: msg.content || '' }]
//         }));

//         charQueue.current = [];

//         setChatMsg(prev => [...prev, userMessage]);
//         reset();
//         setIsStreaming(true);

//         if (!timeoutId.current) {
//             timeoutId.current = setTimeout(processQueue, 30);
//         }

//         try {
//             setChatMsg(prev => [...prev, { role: 'model', content: '' }]);

//             const headers = {
//                 'Content-Type': 'application/json',
//             };

//             // --- THIS IS THE FIX ---
//             // Construct the full, absolute URL using the environment variable.
//             const API_URL = import.meta.env.VITE_API_URL;
//             const response = await fetch(`${API_URL}/ai/chat-stream`, { // <-- Use the full URL
//                 method: 'POST',
//                 headers: headers,
//                 credentials: 'include',
//                 body: JSON.stringify({
//                     messages: [...historyForApi, { role: 'user', parts: [{ text: data.message }] }],
//                     title: problem.title,
//                     description: problem.description,
//                     testCases: problem.visibleTestCases,
//                     startCode: problem.startCode
//                 })
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred.' }));
//                 throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//             }

//             if (!response.body) throw new Error("Response body is missing.");
            
//             const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
            
//             while (true) {
//                 const { value, done } = await reader.read();
//                 if (done) break;

//                 const lines = value.split('\n\n').filter(line => line.trim() !== '');
//                 for (const line of lines) {
//                     if (line.startsWith('data: ')) {
//                         const jsonStr = line.substring(6);
//                         if (jsonStr.includes('[DONE]')) continue;
//                         try {
//                             const parsed = JSON.parse(jsonStr);
//                             if (parsed.text) {
//                                 // setChatMsg(prev => {
//                                 //     const lastMsgIndex = prev.length - 1;
//                                 //     const updated = [...prev];
//                                 //     updated[lastMsgIndex] = { ...updated[lastMsgIndex], content: updated[lastMsgIndex].content + parsed.text };
//                                 //     return updated;
//                                 // });

//                                 charQueue.current.push(...parsed.text.split(''));
//                             }
//                         } catch (e) {
//                             console.error("Failed to parse stream JSON:", jsonStr);
//                         }
//                     }
//                 }
//             }

//         } catch (error) {
//             console.error("API Error:", error);
//             setChatMsg(prev => {
//                 const lastMsgIndex = prev.length - 1;
//                 const updated = [...prev];
//                 updated[lastMsgIndex] = { ...updated[lastMsgIndex], content: `\n\n**Error:** ${error.message}` };
//                 return updated;
//             });
//         } finally {
//             setIsStreaming(false);
//         }
//     };

//     // The JSX part is correct, no changes needed here.
//     return (
//         <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
           
//             <div className="flex-1 p-4 space-y-4 overflow-y-auto leading-loose relative ">
//                 {chatMsg.map((msg, index) => (
//                     <div key={index} className={`chat ${msg.role === "user" ? "chat-end"  : "chat-start"}  `}>

//                         <div >
//                             <div className="w-10 rounded-full">
//                                 {/* Conditionally render a different icon for user vs. model */}
//                                 {msg.role === 'user' 
//                                     ? <CircleUser className="w-10 h-10 text-primary" /> 
//                                     : <Bot className="w-10 h-10 text-secondary" />
//                                 }
//                             </div>
//                             <div className={`prosechat-bubble bg-base-200 text-base-content max-w-full md:max-w-3xl `}>
//                             <MessageContent content={msg.content} />
//                             {index === chatMsg.length - 1 && isStreaming && msg.role === 'model' && (
//                                     <span className="blinking-cursor animate-pulse">|</span>
//                             )}
//                             </div>
//                         </div>
                        
//                     </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//             </div>
//             <form onSubmit={handleSubmit(onSubmit)} className="sticky bottom-0 p-4 bg-base-100 border-t">
//                 <div className="flex items-center">
//                     <input 
//                         placeholder="Ask me anything..." 
//                         className="w-full input input-bordered flex-1 text-neutral-50 transition-colors duration-300 ease-in-out focus:outline-none" 
//                         {...register("message", { required: true, minLength: 2 })} 
//                         disabled={isStreaming}
//                     />
//                     <button type="submit" className="ml-2 btn btn-ghost btn-circle" disabled={!!errors.message || isStreaming}>
//                         <Send size={20} />
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }

// export default ChatAi;



// Abhinav123@


// // src/components/ChatAi.jsx 

// import { useState, useRef, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import axiosClient from "../utils/axiosClient";
// import { Send } from 'lucide-react';
// import CodeBlock from "./CodeBlock"; // Make sure this path is correct

// // Helper component to render different message content types
// // --- THIS IS THE KEY FIX ---
// const MessageContent = ({ message }) => {
//     // Check if the new `content` property exists and is an array
//     if (Array.isArray(message.content)) {
//         return (
//             <div>
//                 {message.content.map((block, index) => {
//                     if (block.type === 'text') {
//                         return <div key={index} className="whitespace-pre-wrap">{block.content}</div>;
//                     }
//                     if (block.type === 'code' && block.content) {
//                         return (
//                             <CodeBlock 
//                                 key={index}
//                                 language={block.content.language || 'text'} // Fallback language
//                                 code={block.content.code || ''} 
//                             />
//                         );
//                     }
//                     return null;
//                 })}
//             </div>
//         );
//     }

//     // Fallback for old message structure: { role, parts: [{text}] }
//     if (message.parts && message.parts[0]?.text) {
//         return <div className="whitespace-pre-wrap">{message.parts[0].text}</div>;
//     }

//     // If no renderable content is found, return nothing to avoid crashes
//     return null; 
// };


// function ChatAi({ problem, chatMsg, setChatMsg }) {
//     const { register, handleSubmit, reset, formState: { errors } } = useForm();
//     const messagesEndRef = useRef(null);

//     // Initial message setup (this part is fine)
//     useEffect(() => {
//         if (chatMsg.length === 0 && problem) {
//             setChatMsg([
//                 { 
//                     role: 'model', 
//                     content: [{ type: 'text', content: `Hello! I'm here to help you with the "${problem.title}" problem. How can I assist you?` }]
//                 }
//             ]);
//         }
//     }, [problem, chatMsg.length, setChatMsg]);


//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [chatMsg]);

//     const onSubmit = async (data) => {
//         const userMessage = { role: 'user', content: [{ type: 'text', content: data.message }] };
        
//         // --- THIS IS THE SECOND FIX ---
//         // Make the history generation robust to handle both data structures
//         const historyForApi = chatMsg.map(msg => {
//             let textContent = '';
//             // Handle new structure
//             if (Array.isArray(msg.content)) {
//                 textContent = msg.content.map(block => {
//                     if (block.type === 'text') return block.content;
//                     if (block.type === 'code' && block.content) return `\`\`\`${block.content.language}\n${block.content.code}\n\`\`\``;
//                     return '';
//                 }).join('\n\n');
//             // Handle old structure
//             } else if (msg.parts && msg.parts[0]?.text) {
//                 textContent = msg.parts[0].text;
//             }
//             return { role: msg.role, parts: [{ text: textContent }] };
//         });

//         const updatedMessagesForDisplay = [...chatMsg, userMessage];
//         setChatMsg(updatedMessagesForDisplay);
//         reset();

//         try {
//             const response = await axiosClient.post("/ai/chat", {
//                 messages: [...historyForApi, { role: 'user', parts: [{ text: data.message }] }],
//                 title: problem.title,
//                 description: problem.description,
//                 testCases: problem.visibleTestCases,
//                 startCode: problem.startCode
//             });
            
//             setChatMsg(prev => [...prev, { 
//                 role: 'model', 
//                 content: response.data.message 
//             }]);

//         } catch (error) {
//             console.error("API Error:", error);
//             setChatMsg(prev => [...prev, { 
//                 role: 'model', 
//                 content: [{ type: 'text', content: "An error occurred while fetching the response from the AI." }]
//             }]);
//         }
//     };

//     return (
//         <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
//             <div className="flex-1 p-4 space-y-4 overflow-y-auto">
//                 {chatMsg.map((msg, index) => (
//                     <div key={index} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
//                         <div className="chat-bubble bg-base-200 text-base-content max-w-full md:max-w-3xl">
//                            {/* Pass the entire message object to the renderer */}
//                            <MessageContent message={msg} />
//                         </div>
//                     </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//             </div>
//             <form 
//                 onSubmit={handleSubmit(onSubmit)} 
//                 className="sticky bottom-0 p-4 bg-base-100 border-t"
//             >
//                 <div className="flex items-center">
//                     <input 
//                         placeholder="Ask me anything..." 
//                         className="w-full input input-bordered flex-1" 
//                         {...register("message", { required: true, minLength: 2 })}
//                     />
//                     <button 
//                         type="submit" 
//                         className="ml-2 btn btn-ghost btn-circle"
//                         disabled={!!errors.message}
//                     >
//                         <Send size={20} />
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }

// export default ChatAi;



// import { useState, useRef, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import axiosClient from "../utils/axiosClient";
// import { Send } from 'lucide-react';

// function ChatAi({problem , chatMsg , setChatMsg}) {
//     // const [messages, setMessages] = useState([
//     //     { role: 'model', parts:[{text: "Hi, How are you"}]},
//     //     { role: 'user', parts:[{text: "I am Good"}]}
//     // ]);

//     const { register, handleSubmit, reset,formState: {errors} } = useForm();
//     const messagesEndRef = useRef(null);

//     useEffect(() => {
//         if (chatMsg.length === 0 && problem) {
//             setChatMsg([{ role: 'model', parts:[{text: "Hi, How are you"}]},{ role: 'user', parts:[{text: "I am Good"}]}]);
//         }
//     }, [problem]);

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [chatMsg]);

//     const onSubmit = async (data) => {
        
//         const userMessage = { role: 'user', parts: [{ text: data.message }] };
//         const updatedMessages = [...chatMsg, userMessage];
//         setChatMsg(updatedMessages);
//         reset() ;
//         console.log(updatedMessages) ;

//         try {
            
//             const response = await axiosClient.post("/ai/chat", {
//                 messages: updatedMessages,
//                 title:problem.title,
//                 description:problem.description,
//                 testCases: problem.visibleTestCases,
//                 startCode:problem.startCode
//             });

           
//             setChatMsg(prev => [...prev, { 
//                 role: 'model', 
//                 parts:[{text: response.data.message}] 
//             }]);
//         } catch (error) {
//             console.error("API Error:", error);
//             setChatMsg(prev => [...prev, { 
//                 role: 'model', 
//                 parts:[{text: "Error from AI Chatbot"}]
//             }]);
//         }
//     };

//     return (
//         <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
//             <div className="flex-1 overflow-y-auto p-4 space-y-4">
//                 {chatMsg.map((msg, index) => (
//                     <div key={index} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
//                         <div className="chat-bubble bg-base-200 text-base-content">
//                             {msg.role === "user" ? msg.parts[0].text : msg.parts[0].text}
//                         </div>
//                     </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//             </div>
//             <form 
//                 onSubmit={handleSubmit(onSubmit)} 
//                 className="sticky bottom-0 p-4 bg-base-100 border-t"
//             >
//                 <div className="flex items-center">
//                     <input 
//                         placeholder="Ask me anything" 
//                         className="input input-bordered flex-1" 
//                         {...register("message", { required: true, minLength: 2 })}
//                     />
//                     <button 
//                         type="submit" 
//                         className="btn btn-ghost ml-2"
//                         disabled={errors.message}
//                     >
//                         <Send size={20} />
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }

// export default ChatAi;

{/* <div>
    <div className="user w-10 rounded-full">
        <CircleUser className="w-10 h-10 text-primary" />
        <div className="prose chat-bubble bg-base-200 text-base-content max-w-full md:max-w-3xl">
            <MessageContent content={msg.content} /> 
            {index === chatMsg.length - 1 && isStreaming && msg.role === 'model' && (
            <span className="blinking-cursor animate-pulse">|</span>
            )}
        </div>      
    </div>

    <div className="bot w-10 rounded-full">
        <Bot className="w-10 h-10 text-secondary" />
        <div className="prose chat-bubble bg-base-200 text-base-content max-w-full md:max-w-3xl">
            <MessageContent content={msg.content} /> 
            {index === chatMsg.length - 1 && isStreaming && msg.role === 'model' && (
            <span className="blinking-cursor animate-pulse">|</span>
            )}
        </div>      
    </div>

</div> */}

