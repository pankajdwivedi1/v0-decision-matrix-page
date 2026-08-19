"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Key,
    Save,
    AlertCircle,
    ExternalLink,
    CheckCircle2,
    Loader2,
    Plus,
    Trash2,
    BarChart3,
    Info,
    Sparkles,
    Cpu,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ApiKeySettings() {
    const [provider, setProvider] = useState<"gemini" | "openai">("gemini");
    const [geminiKeys, setGeminiKeys] = useState<string[]>([""]);
    const [openAiKeys, setOpenAiKeys] = useState<string[]>([""]);
    const [openAiModel, setOpenAiModel] = useState<string>("gpt-4o");

    const [isOpen, setIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string } | null>>({});
    const [usageStats, setUsageStats] = useState<Record<string, number>>({});
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        // Load Provider
        const savedProvider = (localStorage.getItem("user_ai_provider") as "gemini" | "openai") || "gemini";
        setProvider(savedProvider);

        // Load OpenAI Model
        const savedModel = localStorage.getItem("user_openai_model") || "gpt-4o";
        setOpenAiModel(savedModel);

        // Load Gemini Keys
        const savedGemini = localStorage.getItem("user_gemini_api_keys");
        if (savedGemini) {
            try {
                const parsed: string[] = JSON.parse(savedGemini);
                if (parsed.length > 0) setGeminiKeys(parsed);
            } catch {}
        } else {
            const legacy = localStorage.getItem("user_gemini_api_key") || "";
            if (legacy) setGeminiKeys([legacy]);
        }

        // Load OpenAI Keys
        const savedOpenAi = localStorage.getItem("user_openai_api_keys");
        if (savedOpenAi) {
            try {
                const parsed: string[] = JSON.parse(savedOpenAi);
                if (parsed.length > 0) setOpenAiKeys(parsed);
            } catch {}
        } else {
            const legacyOpenAi = localStorage.getItem("user_openai_api_key") || "";
            if (legacyOpenAi) setOpenAiKeys([legacyOpenAi]);
        }

        // Load Gemini Usage stats
        const stats = localStorage.getItem("gemini_usage_stats");
        if (stats) {
            try {
                const parsed = JSON.parse(stats);
                const lastUpdated = localStorage.getItem("gemini_stats_date");
                const today = new Date().toDateString();
                if (lastUpdated !== today) {
                    setUsageStats({});
                    localStorage.setItem("gemini_stats_date", today);
                    localStorage.setItem("gemini_usage_stats", "{}");
                } else {
                    setUsageStats(parsed);
                }
            } catch {}
        }
    }, []);

    const handleSave = () => {
        // Save Provider
        localStorage.setItem("user_ai_provider", provider);
        localStorage.setItem("user_openai_model", openAiModel);

        // Save Gemini Keys
        const validGemini = geminiKeys.map(k => k.trim()).filter(k => k.length > 0);
        localStorage.setItem("user_gemini_api_keys", JSON.stringify(validGemini));
        if (validGemini.length > 0) {
            localStorage.setItem("user_gemini_api_key", validGemini[0]);
        } else {
            localStorage.removeItem("user_gemini_api_key");
        }

        // Save OpenAI Keys
        const validOpenAi = openAiKeys.map(k => k.trim()).filter(k => k.length > 0);
        localStorage.setItem("user_openai_api_keys", JSON.stringify(validOpenAi));
        if (validOpenAi.length > 0) {
            localStorage.setItem("user_openai_api_key", validOpenAi[0]);
        } else {
            localStorage.removeItem("user_openai_api_key");
        }

        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            setIsOpen(false);
        }, 1200);
    };

    const handleClearAll = () => {
        if (provider === "gemini") {
            setGeminiKeys([""]);
            localStorage.removeItem("user_gemini_api_keys");
            localStorage.removeItem("user_gemini_api_key");
        } else {
            setOpenAiKeys([""]);
            localStorage.removeItem("user_openai_api_keys");
            localStorage.removeItem("user_openai_api_key");
        }
        setTestResults({});
    };

    const handleTestKey = async (keyToTest: string, keyId: string, testProvider: "gemini" | "openai") => {
        const trimmed = keyToTest?.trim();
        if (!trimmed) {
            setTestResults(prev => ({
                ...prev,
                [keyId]: { success: false, message: "Please enter an API key first." }
            }));
            return;
        }

        setIsTesting(true);
        setTestResults(prev => ({ ...prev, [keyId]: null }));

        try {
            const response = await fetch('/api/test-api-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: trimmed, provider: testProvider }),
            });
            const result = await response.json();

            if (result.success) {
                setTestResults(prev => ({
                    ...prev,
                    [keyId]: { success: true, message: `✅ ${testProvider === "openai" ? "OpenAI" : "Gemini"} Key Valid & Working!` }
                }));
            } else {
                setTestResults(prev => ({
                    ...prev,
                    [keyId]: { success: false, message: `❌ ${result.error?.substring(0, 100) || "Invalid key"}` }
                }));
            }
        } catch (err: any) {
            setTestResults(prev => ({
                ...prev,
                [keyId]: { success: false, message: `❌ Network error: ${err.message}` }
            }));
        } finally {
            setIsTesting(false);
        }
    };

    const geminiCount = geminiKeys.filter(k => k.trim()).length;
    const openAiCount = openAiKeys.filter(k => k.trim()).length;
    const totalActiveKeys = provider === "openai" ? openAiCount : geminiCount;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 w-full gap-1.5 text-xs font-medium px-2.5 transition-all shadow-xs ${totalActiveKeys > 0
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                        : "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                    }`}
                >
                    {totalActiveKeys > 0 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>AI Settings: {provider === "openai" ? "ChatGPT" : "Gemini"}</span>
                    {totalActiveKeys > 0 && (
                        <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-800">
                            {totalActiveKeys} key{totalActiveKeys > 1 ? "s" : ""}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2 border-b">
                    <div className="flex justify-between items-center pr-6">
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <Cpu className="w-5 h-5 text-indigo-600" />
                            AI Provider & API Keys
                        </DialogTitle>
                        {provider === "gemini" && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                                onClick={() => setShowInfo(!showInfo)}
                            >
                                <BarChart3 className="w-3.5 h-3.5" />
                                {showInfo ? "Hide Stats" : "Quota Status"}
                            </Button>
                        )}
                    </div>
                    <DialogDescription className="text-xs text-slate-500">
                        Choose your AI engine and add API keys for generating research manuscripts.
                    </DialogDescription>
                </DialogHeader>

                {/* AI Provider Switcher */}
                <Tabs value={provider} onValueChange={(val) => setProvider(val as "gemini" | "openai")} className="w-full mt-2">
                    <TabsList className="grid grid-cols-2 w-full h-10 p-1 bg-slate-100 rounded-lg">
                        <TabsTrigger value="gemini" className="flex items-center gap-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Google Gemini
                            {geminiCount > 0 && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-bold">{geminiCount}</span>}
                        </TabsTrigger>
                        <TabsTrigger value="openai" className="flex items-center gap-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-xs">
                            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                            OpenAI (ChatGPT)
                            {openAiCount > 0 && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-bold">{openAiCount}</span>}
                        </TabsTrigger>
                    </TabsList>

                    {/* ═════════════════ TAB 1: GOOGLE GEMINI ═════════════════ */}
                    <TabsContent value="gemini" className="space-y-4 pt-2">
                        {showInfo && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-xs">
                                <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                                    <BarChart3 className="w-4 h-4 text-blue-600" />
                                    Gemini Quota Status
                                </div>
                                <div className="space-y-1.5">
                                    {geminiKeys.filter(k => k.trim()).map((key, i) => {
                                        const keyId = key.substring(0, 10);
                                        const used = usageStats[keyId] || 0;
                                        const limit = 20;
                                        return (
                                            <div key={i} className="flex justify-between items-center text-[11px]">
                                                <span className="font-mono text-slate-600">Key {i+1} ({keyId}...)</span>
                                                <span className="font-bold text-blue-700">{used} / {limit} requests today</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {geminiKeys.map((key, index) => {
                                const keyId = `gemini_${index}`;
                                const testRes = testResults[keyId];
                                return (
                                    <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                🔑 Gemini Key {index + 1} {index === 0 && <span className="text-[10px] text-emerald-600 font-bold">(Primary)</span>}
                                            </Label>
                                            {geminiKeys.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setGeminiKeys(prev => prev.filter((_, i) => i !== index))}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                type="password"
                                                placeholder="AIzaSy... (paste Gemini API key)"
                                                value={key}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setGeminiKeys(prev => {
                                                        const copy = [...prev];
                                                        copy[index] = val;
                                                        return copy;
                                                    });
                                                }}
                                                className="font-mono text-xs h-9 bg-white"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3 text-xs shrink-0"
                                                disabled={isTesting || !key.trim()}
                                                onClick={() => handleTestKey(key, keyId, "gemini")}
                                            >
                                                {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Test"}
                                            </Button>
                                        </div>
                                        {testRes && (
                                            <p className={`text-[11px] font-medium ${testRes.success ? "text-emerald-600" : "text-red-600"}`}>
                                                {testRes.message}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}

                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-8 text-xs border-dashed gap-1 text-slate-600 hover:text-slate-900"
                                onClick={() => setGeminiKeys(prev => [...prev, ""])}
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Another Gemini Key (Rotation)
                            </Button>

                            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg flex items-center justify-between text-xs text-amber-900">
                                <span>Get a free Gemini API key in 10 seconds:</span>
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-amber-700 hover:underline flex items-center gap-1"
                                >
                                    Google AI Studio <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ═════════════════ TAB 2: OPENAI (CHATGPT) ═════════════════ */}
                    <TabsContent value="openai" className="space-y-4 pt-2">
                        {/* Model Selector */}
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2">
                            <Label className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                                Preferred OpenAI Model:
                            </Label>
                            <select
                                value={openAiModel}
                                onChange={(e) => setOpenAiModel(e.target.value)}
                                className="w-full h-9 px-3 rounded-md bg-white border border-emerald-300 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                            >
                                <option value="gpt-4o">GPT-4o (Recommended: Superior Q1 Academic Writing)</option>
                                <option value="gpt-4o-mini">GPT-4o Mini (Fast, Budget & Cost-Effective)</option>
                                <option value="o3-mini">o3-mini (High-Reasoning Mathematical Engine)</option>
                                <option value="o1">o1 (Full In-Depth Reasoning Model)</option>
                                <option value="gpt-4-turbo">GPT-4 Turbo (Legacy High-Context)</option>
                            </select>
                        </div>

                        {/* OpenAI Keys list */}
                        <div className="space-y-3">
                            {openAiKeys.map((key, index) => {
                                const keyId = `openai_${index}`;
                                const testRes = testResults[keyId];
                                return (
                                    <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                🔑 OpenAI API Key {index + 1} {index === 0 && <span className="text-[10px] text-emerald-600 font-bold">(Active)</span>}
                                            </Label>
                                            {openAiKeys.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setOpenAiKeys(prev => prev.filter((_, i) => i !== index))}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                type="password"
                                                placeholder="sk-... or sk-proj-... (paste OpenAI key)"
                                                value={key}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setOpenAiKeys(prev => {
                                                        const copy = [...prev];
                                                        copy[index] = val;
                                                        return copy;
                                                    });
                                                }}
                                                className="font-mono text-xs h-9 bg-white"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3 text-xs shrink-0"
                                                disabled={isTesting || !key.trim()}
                                                onClick={() => handleTestKey(key, keyId, "openai")}
                                            >
                                                {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Test"}
                                            </Button>
                                        </div>
                                        {testRes && (
                                            <p className={`text-[11px] font-medium ${testRes.success ? "text-emerald-600" : "text-red-600"}`}>
                                                {testRes.message}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}

                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-8 text-xs border-dashed gap-1 text-slate-600 hover:text-slate-900"
                                onClick={() => setOpenAiKeys(prev => [...prev, ""])}
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Another OpenAI Key
                            </Button>

                            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-800">
                                <span>Get your OpenAI API key here:</span>
                                <a
                                    href="https://platform.openai.com/api-keys"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                                >
                                    OpenAI Platform <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleClearAll}
                    >
                        Clear Keys
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className={`text-xs font-semibold gap-1.5 transition-all ${
                                isSaved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"
                            } text-white`}
                            onClick={handleSave}
                        >
                            {isSaved ? (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" /> Save {provider === "openai" ? "OpenAI" : "Gemini"} Settings
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
