'use client';

import React, { useState, useCallback } from 'react';
import {
  detectAISentences,
  getOverallAIRiskFromText,
  postEnhance,
  expertDepthScore,
  preservationCheck,
  buildHumanizationPrompt,
  MASTER_ROLE_PROMPT,
  AI_AWARE_WRITING_PROMPT,
  SECTION_REFINEMENT_PROMPTS,
  type AIRiskLevel,
  type SentenceAnalysis,
} from '@/lib/manuscriptPrompts';

// ─── Types ────────────────────────────────────────────────────
type SectionKey =
  | 'abstract'
  | 'introduction'
  | 'literature'
  | 'methodology'
  | 'results'
  | 'sensitivity'
  | 'discussion'
  | 'conclusion';

const SECTIONS: { id: SectionKey; label: string; color: string }[] = [
  { id: 'abstract', label: 'Abstract', color: '#3b82f6' },
  { id: 'introduction', label: 'Introduction', color: '#8b5cf6' },
  { id: 'literature', label: 'Literature Review', color: '#6366f1' },
  { id: 'methodology', label: 'Methodology', color: '#10b981' },
  { id: 'results', label: 'Results & Analysis', color: '#f59e0b' },
  { id: 'sensitivity', label: 'Sensitivity Analysis', color: '#ef4444' },
  { id: 'discussion', label: 'Discussion', color: '#ec4899' },
  { id: 'conclusion', label: 'Conclusion', color: '#a855f7' },
];

const RISK_COLORS: Record<AIRiskLevel, string> = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
};

// ─── Mini Components ─────────────────────────────────────────

function RiskBadge({ level, score }: { level: AIRiskLevel; score: number }) {
  return (
    <span
      style={{
        background: RISK_COLORS[level] + '22',
        color: RISK_COLORS[level],
        border: `1px solid ${RISK_COLORS[level]}55`,
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: '0.78rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
      }}
    >
      {level} AI Risk · Score {score}
    </span>
  );
}

function SectionTab({
  section,
  active,
  onClick,
}: {
  section: (typeof SECTIONS)[0];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: active ? `1.5px solid ${section.color}` : '1.5px solid transparent',
        background: active ? section.color + '18' : 'transparent',
        color: active ? section.color : '#94a3b8',
        fontWeight: active ? 700 : 500,
        fontSize: '0.82rem',
        cursor: 'pointer',
        transition: 'all 0.18s',
        whiteSpace: 'nowrap',
      }}
    >
      {section.label}
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function PromptEnginePage() {
  const [activeSection, setActiveSection] = useState<SectionKey>('abstract');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [sentenceResults, setSentenceResults] = useState<SentenceAnalysis[]>([]);
  const [riskSummary, setRiskSummary] = useState<ReturnType<typeof getOverallAIRiskFromText> | null>(null);
  const [preservationResult, setPreservationResult] = useState<ReturnType<typeof preservationCheck> | null>(null);
  const [depthScore, setDepthScore] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'analyzer' | 'prompts' | 'refine'>('analyzer');
  const [copied, setCopied] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [refineError, setRefineError] = useState('');

  const currentSection = SECTIONS.find((s) => s.id === activeSection)!;

  // ── Analyze AI Risk ────────────────────────────────────────
  const handleAnalyze = useCallback(() => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const results = sentenceResults.length ? sentenceResults : [];
      const analyzed = detectAISentences(inputText);
      setSentenceResults(analyzed);
      const risk = getOverallAIRiskFromText(inputText);
      setRiskSummary(risk);
      const depth = expertDepthScore(inputText);
      setDepthScore(depth);
      setIsAnalyzing(false);
    }, 400);
  }, [inputText]);

  // ── Post Enhance (client-side) ────────────────────────────
  const handlePostEnhance = useCallback(() => {
    if (!inputText.trim()) return;
    const enhanced = postEnhance(inputText);
    setOutputText(enhanced);
    const check = preservationCheck(inputText, enhanced);
    setPreservationResult(check);
  }, [inputText]);

  // ── AI Refine via API ─────────────────────────────────────
  const handleAIRefine = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsRefining(true);
    setRefineError('');
    try {
      const prompt = buildHumanizationPrompt(activeSection, inputText);
      const userApiKey = apiKey || localStorage.getItem('user_gemini_api_key') || '';

      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userApiKey,
          analysisType: 'custom_section',
          sectionType: activeSection,
          customPrompt: prompt,
          wordCount: 2000,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');

      const refined = data.markdown || '';
      setOutputText(refined);
      const check = preservationCheck(inputText, refined);
      setPreservationResult(check);
      const newRisk = getOverallAIRiskFromText(refined);
      setRiskSummary(newRisk);
    } catch (e: any) {
      setRefineError(e.message || 'Failed to refine. Check API key.');
    } finally {
      setIsRefining(false);
    }
  }, [inputText, activeSection, apiKey]);

  // ── Copy helper ───────────────────────────────────────────
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Prompt display ────────────────────────────────────────
  const promptToShow =
    activeTab === 'prompts'
      ? activeSection === 'abstract' || activeSection === 'introduction'
        ? MASTER_ROLE_PROMPT + '\n\n' + AI_AWARE_WRITING_PROMPT + '\n\n' + (SECTION_REFINEMENT_PROMPTS[activeSection] || '')
        : AI_AWARE_WRITING_PROMPT + '\n\n' + (SECTION_REFINEMENT_PROMPTS[activeSection] || '')
      : '';

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: '#e2e8f0',
        padding: '0',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1e1e3f, #2d1b69, #1e1e3f)',
          borderBottom: '1px solid #3730a3',
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
          }}
        >
          🧠
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9' }}>
            Prompt Engine — Anti-AI Detection
          </h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
            Q1 Journal Quality · Master Prompt System · Sentence-Level AI Risk Analysis
          </p>
        </div>
        <a
          href="/"
          style={{
            marginLeft: 'auto',
            padding: '7px 18px',
            borderRadius: '8px',
            background: '#1e1e3f',
            border: '1px solid #3730a3',
            color: '#a5b4fc',
            fontSize: '0.82rem',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          ← Back to App
        </a>
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '24px 24px 48px' }}>

        {/* ── Section Tabs ── */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '24px',
            background: '#12122b',
            border: '1px solid #2d2d5b',
            borderRadius: '12px',
            padding: '12px',
          }}
        >
          {SECTIONS.map((s) => (
            <SectionTab
              key={s.id}
              section={s}
              active={activeSection === s.id}
              onClick={() => setActiveSection(s.id)}
            />
          ))}
        </div>

        {/* ── Mode Tabs ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['analyzer', 'prompts', 'refine'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '9px 22px',
                borderRadius: '8px',
                border: activeTab === tab ? '1.5px solid #6366f1' : '1.5px solid #2d2d5b',
                background: activeTab === tab ? '#6366f122' : '#12122b',
                color: activeTab === tab ? '#a5b4fc' : '#64748b',
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'analyzer' ? '🔍 AI Sentence Analyzer' : tab === 'prompts' ? '📋 Prompt Viewer' : '✨ AI Refine'}
            </button>
          ))}
        </div>

        {/* ── ANALYZER TAB ── */}
        {activeTab === 'analyzer' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Input */}
            <div style={{ background: '#12122b', border: '1px solid #2d2d5b', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>
                  📝 Paste Your Section Text
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                  {inputText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Paste your ${currentSection.label} section here to analyze AI risk...`}
                style={{
                  width: '100%',
                  height: '320px',
                  background: '#0f0f1a',
                  border: '1px solid #2d2d5b',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  padding: '14px',
                  fontSize: '0.85rem',
                  lineHeight: 1.7,
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                    opacity: inputText.trim() ? 1 : 0.5,
                  }}
                >
                  {isAnalyzing ? '⏳ Analyzing...' : '🔍 Detect AI Sentences'}
                </button>
                <button
                  onClick={handlePostEnhance}
                  disabled={!inputText.trim()}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                    opacity: inputText.trim() ? 1 : 0.5,
                  }}
                >
                  ⚡ Quick Enhance
                </button>
              </div>
            </div>

            {/* Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Risk Summary Card */}
              {riskSummary && (
                <div
                  style={{
                    background: '#12122b',
                    border: `1px solid ${RISK_COLORS[riskSummary.level]}44`,
                    borderRadius: '12px',
                    padding: '16px 20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>AI Risk Summary</h3>
                    <RiskBadge level={riskSummary.level} score={riskSummary.score} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {[
                      { label: 'AI Flagged', value: `${riskSummary.flaggedCount} sentences`, color: RISK_COLORS[riskSummary.level] },
                      { label: 'Total Sentences', value: riskSummary.totalCount, color: '#64748b' },
                      { label: 'Expert Depth', value: `${depthScore ?? 0}/70`, color: '#10b981' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        style={{
                          background: '#0f0f1a',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Risk bar */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ height: '6px', borderRadius: '4px', background: '#1e1e3f', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, riskSummary.score)}%`,
                          background: `linear-gradient(90deg, #10b981, ${RISK_COLORS[riskSummary.level]})`,
                          borderRadius: '4px',
                          transition: 'width 0.4s',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#475569', marginTop: '4px' }}>
                      <span>Low Risk</span>
                      <span>High Risk</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sentence-level results */}
              {sentenceResults.length > 0 && (
                <div
                  style={{
                    background: '#12122b',
                    border: '1px solid #2d2d5b',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    maxHeight: '340px',
                    overflowY: 'auto',
                  }}
                >
                  <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 700 }}>
                    🔬 Sentence Analysis ({sentenceResults.filter((s) => s.isAI).length} flagged)
                  </h3>
                  {sentenceResults.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: s.isAI ? '#ef444411' : '#10b98108',
                        border: `1px solid ${s.isAI ? '#ef444433' : '#10b98122'}`,
                        borderRadius: '8px',
                        padding: '10px 12px',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: s.isAI ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                          {s.isAI ? '⚠️ AI-like' : '✅ Human-like'} · Score: {s.aiScore}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {s.sentence}
                      </p>
                      {s.isAI && s.suggestions.length > 0 && (
                        <ul style={{ margin: '6px 0 0', paddingLeft: '16px' }}>
                          {s.suggestions.map((sg, si) => (
                            <li key={si} style={{ fontSize: '0.72rem', color: '#f59e0b', lineHeight: 1.6 }}>
                              {sg}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Enhanced output */}
              {outputText && (
                <div
                  style={{
                    background: '#12122b',
                    border: '1px solid #10b98133',
                    borderRadius: '12px',
                    padding: '16px 20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
                      ✨ Enhanced Output
                    </h3>
                    <button
                      onClick={() => copyToClipboard(outputText, 'output')}
                      style={{
                        padding: '4px 14px',
                        borderRadius: '6px',
                        background: copied === 'output' ? '#10b981' : '#1e1e3f',
                        border: '1px solid #10b98155',
                        color: copied === 'output' ? '#fff' : '#10b981',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {copied === 'output' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  {preservationResult && preservationResult.warnings.length > 0 && (
                    <div style={{ background: '#f59e0b11', border: '1px solid #f59e0b33', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>⚠️ Preservation Warnings:</p>
                      {preservationResult.warnings.map((w, i) => (
                        <p key={i} style={{ margin: '2px 0', fontSize: '0.72rem', color: '#fbbf24' }}>{w}</p>
                      ))}
                    </div>
                  )}

                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      color: '#cbd5e1',
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    {outputText}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROMPTS VIEWER TAB ── */}
        {activeTab === 'prompts' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Master Role Prompt */}
            <div style={{ background: '#12122b', border: '1px solid #2d2d5b', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#a5b4fc' }}>
                  🔷 Master Role Prompt
                </h3>
                <button
                  onClick={() => copyToClipboard(MASTER_ROLE_PROMPT, 'master')}
                  style={{ padding: '4px 12px', borderRadius: '6px', background: copied === 'master' ? '#6366f1' : '#1e1e3f', border: '1px solid #6366f155', color: copied === 'master' ? '#fff' : '#a5b4fc', fontSize: '0.73rem', cursor: 'pointer' }}
                >
                  {copied === 'master' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  fontSize: '0.76rem',
                  color: '#94a3b8',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  background: '#0f0f1a',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                {MASTER_ROLE_PROMPT}
              </pre>
            </div>

            {/* Section Prompt */}
            <div style={{ background: '#12122b', border: `1px solid ${currentSection.color}44`, borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: currentSection.color }}>
                  📋 {currentSection.label} — Section Prompt
                </h3>
                <button
                  onClick={() => copyToClipboard(SECTION_REFINEMENT_PROMPTS[activeSection] || '', 'section')}
                  style={{ padding: '4px 12px', borderRadius: '6px', background: copied === 'section' ? currentSection.color : '#1e1e3f', border: `1px solid ${currentSection.color}55`, color: copied === 'section' ? '#fff' : currentSection.color, fontSize: '0.73rem', cursor: 'pointer' }}
                >
                  {copied === 'section' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  fontSize: '0.76rem',
                  color: '#94a3b8',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  background: '#0f0f1a',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                {SECTION_REFINEMENT_PROMPTS[activeSection] || 'No specific refinement prompt for this section.'}
              </pre>
            </div>

            {/* AI-Aware Writing Prompt */}
            <div style={{ background: '#12122b', border: '1px solid #f59e0b33', borderRadius: '12px', padding: '20px', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>
                  🚀 AI-Aware Writing Mode Prompt (Anti-Detection)
                </h3>
                <button
                  onClick={() => copyToClipboard(AI_AWARE_WRITING_PROMPT, 'aiaware')}
                  style={{ padding: '4px 12px', borderRadius: '6px', background: copied === 'aiaware' ? '#f59e0b' : '#1e1e3f', border: '1px solid #f59e0b55', color: copied === 'aiaware' ? '#fff' : '#f59e0b', fontSize: '0.73rem', cursor: 'pointer' }}
                >
                  {copied === 'aiaware' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  fontSize: '0.76rem',
                  color: '#94a3b8',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  background: '#0f0f1a',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                {AI_AWARE_WRITING_PROMPT}
              </pre>
            </div>
          </div>
        )}

        {/* ── AI REFINE TAB ── */}
        {activeTab === 'refine' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Input + Config */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#12122b', border: '1px solid #2d2d5b', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 700 }}>
                  ✨ AI-Powered Section Refinement
                </h3>
                <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#64748b' }}>
                  Paste your draft section. The system applies Master Prompt + Section Prompt + Anti-AI rules and rewrites it through the Gemini API.
                </p>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Gemini API Key (optional — uses saved key)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#0f0f1a',
                    border: '1px solid #2d2d5b',
                    color: '#e2e8f0',
                    fontSize: '0.82rem',
                    marginBottom: '12px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Paste your ${currentSection.label} draft here...`}
                  style={{
                    width: '100%',
                    height: '280px',
                    background: '#0f0f1a',
                    border: '1px solid #2d2d5b',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    padding: '14px',
                    fontSize: '0.85rem',
                    lineHeight: 1.7,
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <button
                  onClick={handleAIRefine}
                  disabled={isRefining || !inputText.trim()}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                    opacity: inputText.trim() ? 1 : 0.5,
                  }}
                >
                  {isRefining ? '⏳ Refining with AI...' : '🤖 Refine Section via AI'}
                </button>
                {refineError && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#ef4444' }}>
                    ❌ {refineError}
                  </p>
                )}
              </div>

              {/* Preservation check */}
              {preservationResult && (
                <div
                  style={{
                    background: '#12122b',
                    border: `1px solid ${preservationResult.warnings.length === 0 ? '#10b98144' : '#f59e0b44'}`,
                    borderRadius: '12px',
                    padding: '16px 20px',
                  }}
                >
                  <h3 style={{ margin: '0 0 10px', fontSize: '0.88rem', fontWeight: 700, color: preservationResult.warnings.length === 0 ? '#10b981' : '#f59e0b' }}>
                    🛡️ Preservation Check
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {[
                      { label: 'Numbers', ok: preservationResult.numbers_ok },
                      { label: 'Citations', ok: preservationResult.citations_ok },
                      { label: 'Length Ratio', ok: preservationResult.length_ratio > 0.7 && preservationResult.length_ratio < 2.0, display: preservationResult.length_ratio.toFixed(2) },
                    ].map((item) => (
                      <div key={item.label} style={{ background: '#0f0f1a', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem' }}>{item.ok ? '✅' : '⚠️'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{item.label}</div>
                        {item.display && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{item.display}</div>}
                      </div>
                    ))}
                  </div>
                  {preservationResult.warnings.map((w, i) => (
                    <p key={i} style={{ margin: '6px 0 0', fontSize: '0.73rem', color: '#f59e0b' }}>⚠️ {w}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Refined output */}
            <div style={{ background: '#12122b', border: '1px solid #2d2d5b', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#a5b4fc' }}>
                  📄 Refined Output
                </h3>
                {outputText && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {riskSummary && <RiskBadge level={riskSummary.level} score={riskSummary.score} />}
                    <button
                      onClick={() => copyToClipboard(outputText, 'refined')}
                      style={{ padding: '4px 14px', borderRadius: '6px', background: copied === 'refined' ? '#6366f1' : '#1e1e3f', border: '1px solid #6366f155', color: copied === 'refined' ? '#fff' : '#a5b4fc', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      {copied === 'refined' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
              {outputText ? (
                <div
                  style={{
                    background: '#0f0f1a',
                    borderRadius: '8px',
                    padding: '16px',
                    minHeight: '460px',
                    maxHeight: '560px',
                    overflowY: 'auto',
                    fontSize: '0.84rem',
                    color: '#cbd5e1',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {outputText}
                </div>
              ) : (
                <div
                  style={{
                    background: '#0f0f1a',
                    borderRadius: '8px',
                    minHeight: '460px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#334155',
                    fontSize: '0.85rem',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>✨</span>
                  <p style={{ margin: 0 }}>Refined output will appear here</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#1e293b' }}>
                    Select section → paste text → click Refine
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
