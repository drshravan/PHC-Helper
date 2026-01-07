import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CircularProgress } from '@mui/material';
import { AutoAwesome, ContentCopy, Check } from '@mui/icons-material';

const AncAiSummary = ({ ancData }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const generateSummary = async () => {
            // 1. Check for API Key securely
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            // If no key, fail silently as requested ("dont give any error")
            if (!apiKey) {
                // Determine if we should show a prompt or just hide. 
                // User said "free otherwise dont give any error".
                // We'll hide it to be safe, or we could show a "Configure AI" placeholder.
                // For now, let's just return and render nothing to allow "free" usage if configured.
                console.log("Gemini API Key missing - AI Summary disabled.");
                return;
            }

            if (!ancData) return;

            setLoading(true);
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `
                    Act as a senior obstetrician. Analyze the following ANC record and provide a brief, clinical summary (max 100 words).
                    Focus on:
                    1. Current Status (Weeks/Days, Risk Level).
                    2. Key Risk Factors identified.
                    3. Recommended immediate next steps for the ANM/Doctor.
                    
                    Format as a clean markdown list or paragraph. Do not use asterisks for bolding, just plain text or simple formatting.
                    
                    Data: ${JSON.stringify(ancData)}
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                setSummary(text);

            } catch (err) {
                // Fail silently as requested
                console.error("AI Generation Failed:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        generateSummary();
    }, [ancData]);

    const handleCopy = () => {
        if (summary) {
            navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // If no API key or error, render NULL (don't show anything)
    if (!import.meta.env.VITE_GEMINI_API_KEY || error) return null;

    // While loading, we can show a skeleton or just nothing until ready.
    // Let's show a subtle loading state if key exists.
    if (loading) {
        return (
            <div className="glass-section mt-3" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#8b5cf6' }}>
                    <CircularProgress size={20} style={{ color: '#8b5cf6' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Analyzing Record with Gemini AI...</span>
                </div>
            </div>
        );
    }

    if (!summary) return null;

    return (
        <div className="glass-section mt-3" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(30, 36, 51, 0.8))',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            position: 'relative'
        }}>
            <div className="section-header" style={{ marginBottom: '12px' }}>
                <div className="dot purple"></div>
                <span>GEMINI AI SUMMARY</span>
                <AutoAwesome style={{ fontSize: 16, marginLeft: '6px', color: '#c4b5fd' }} />
            </div>

            <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#e2e8f0', whiteSpace: 'pre-line' }}>
                {summary}
            </div>

            <button
                onClick={handleCopy}
                style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px',
                    cursor: 'pointer',
                    color: copied ? '#4ade80' : '#94a3b8',
                    transition: 'all 0.2s'
                }}
            >
                {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
            </button>
        </div>
    );
};

export default AncAiSummary;
