"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Save, AlertCircle, ExternalLink, CheckCircle2, Loader2, Plus, Trash2, BarChart3, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ApiKeySettings() {
    const [apiKeys, setApiKeys] = useState<string[]>([""]);
    const [isOpen, setIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResults, setTestResults] = useState<Array<{ success: boolean; message: string } | null>>([]);
    const [savedCount, setSavedCount] = useState(0);
    const [usageStats, setUsageStats] = useState<Record<string, number>>({});
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("user_gemini_api_keys");
        const stats = localStorage.getItem("gemini_usage_stats");
        
        if (stats) {
            try {
                const parsed = JSON.parse(stats);
                // Reset if it's a new day (simple check)
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

        if (saved) {
            try {
                const parsed: string[] = JSON.parse(saved);
                if (parsed.length > 0) {
                    setApiKeys(parsed);
                    setSavedCount(parsed.filter(k => k.trim()).length);
                    return;
                }
            } catch {}
        }
        // Fallback: legacy single key
        const legacy = localStorage.getItem("user_gemini_api_key") || "";
        if (legacy) {
            setApiKeys([legacy]);
            setSavedCount(1);
        }
    }, []);

    const trackUsage = (key: string) => {
        const keyId = key.substring(0, 10);
        setUsageStats(prev => {
            const updated = { ...prev, [keyId]: (prev[keyId] || 0) + 1 };
            localStorage.setItem("gemini_usage_stats", JSON.stringify(updated));
            localStorage.setItem("gemini_stats_date", new Date().toDateString());
            return updated;
        });
    };

    const handleSave = () => {
        const validKeys = apiKeys.map(k => k.trim()).filter(k => k.length > 0);
        localStorage.setItem("user_gemini_api_keys", JSON.stringify(validKeys));
        if (validKeys.length > 0) {
            localStorage.setItem("user_gemini_api_key", validKeys[0]);
        } else {
            localStorage.removeItem("user_gemini_api_key");
        }
        setSavedCount(validKeys.length);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            setIsOpen(false);
        }, 1500);
    };

    const handleClear = () => {
        setApiKeys([""]);
        setSavedCount(0);
        setTestResults([]);
        setUsageStats({});
        localStorage.removeItem("user_gemini_api_keys");
        localStorage.removeItem("user_gemini_api_key");
        localStorage.removeItem("gemini_usage_stats");
    };

    const handleTestKey = async (index: number) => {
        const keyToTest = apiKeys[index]?.trim();
        if (!keyToTest) {
            const updated = [...testResults];
            updated[index] = { success: false, message: "Please enter an API key first." };
            setTestResults(updated);
            return;
        }

        setIsTesting(true);
        const updated = [...testResults];
        updated[index] = null;
        setTestResults(updated);

        try {
            const response = await fetch('/api/test-api-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: keyToTest }),
            });
            const result = await response.json();
            const newResults = [...testResults];

            if (result.success) {
                newResults[index] = { success: true, message: "✅ Working! Quota available." };
                trackUsage(keyToTest);
            } else {
                const err = result.error || "";
                if (err.includes('429') || err.includes('quota') || err.includes('Too Many')) {
                    newResults[index] = { success: false, message: "⚠️ Quota exhausted today. Try again tomorrow or add another key." };
                } else if (err.includes('400') || err.includes('API_KEY_INVALID') || err.includes('invalid')) {
                    newResults[index] = { success: false, message: "❌ Invalid key. Re-copy from AI Studio." };
                } else if (err.includes('404') || err.includes('not found')) {
                    newResults[index] = { success: false, message: "❌ Model not available for this key. Key may be restricted." };
                } else {
                    newResults[index] = { success: false, message: `❌ ${err.substring(0, 120)}` };
                }
            }
            setTestResults(newResults);
        } catch (err: any) {
            const newResults = [...testResults];
            newResults[index] = { success: false, message: `❌ Network error: ${err.message}` };
            setTestResults(newResults);
        } finally {
            setIsTesting(false);
        }
    };

    const addKeySlot = () => {
        setApiKeys(prev => [...prev, ""]);
    };

    const removeKey = (index: number) => {
        setApiKeys(prev => prev.filter((_, i) => i !== index));
        setTestResults(prev => prev.filter((_, i) => i !== index));
    };

    const updateKey = (index: number, value: string) => {
        setApiKeys(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
        setTestResults(prev => {
            const updated = [...prev];
            updated[index] = null;
            return updated;
        });
    };

    const hasKeys = savedCount > 0;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 w-full gap-1 text-[10px] px-2 ${hasKeys
                        ? "bg-green-50 border-green-200 text-black"
                        : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                >
                    {hasKeys
                        ? <CheckCircle2 className="w-3.5 h-3.5" />
                        : <Key className="w-3.5 h-3.5" />}
                    Step 1: API Settings {hasKeys ? `(${savedCount} key${savedCount > 1 ? 's' : ''} ✓)` : ""}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-center pr-6">
                        <DialogTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5 text-amber-600" />
                            Gemini API Keys
                        </DialogTitle>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-[10px]"
                            onClick={() => setShowInfo(!showInfo)}
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            {showInfo ? "Hide Stats" : "Check Quota Status"}
                        </Button>
                    </div>
                    <DialogDescription>
                        Add <strong>multiple keys</strong> to rotate when one hits its daily quota limit.
                    </DialogDescription>
                </DialogHeader>

                {showInfo && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-blue-800 font-semibold text-xs border-b border-blue-200 pb-2">
                                <BarChart3 className="w-4 h-4" />
                                Daily Usage Summary (Today)
                            </div>
                            <div className="space-y-2">
                                {apiKeys.filter(k => k.trim()).map((key, i) => {
                                    const keyId = key.substring(0, 10);
                                    const used = usageStats[keyId] || 0;
                                    const limit = 20; // Experimental Gemini 2.x Flash Free Tier
                                    const percentage = Math.round((used / limit) * 100);
                                    
                                    return (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="font-mono text-gray-600">Key {i+1} ({keyId}...)</span>
                                                <span className="font-bold text-blue-700">{used} / {limit} requests</span>
                                            </div>
                                            <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    className="bg-blue-600 h-full transition-all duration-500" 
                                                    style={{ width: `${Math.max(used > 0 ? 5 : 0, Math.min(100, (used/limit)*100))}%` }} 
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {savedCount === 0 && <p className="text-[10px] text-blue-600 italic">No keys added yet to track usage.</p>}
                            </div>
                            <div className="pt-2 flex items-start gap-2 text-[10px] text-blue-700 bg-white/50 p-2 rounded">
                                <Info className="w-3.5 h-3.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-amber-700">Experimental 2.x Limits:</p>
                                    <ul className="list-disc list-inside space-y-0.5 opacity-80">
                                        <li>~20 Requests per day</li>
                                        <li>~2 Requests per minute</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 py-2">
                    {apiKeys.map((key, index) => (
                        <div key={index} className="space-y-2 p-3 border rounded-lg bg-gray-50 border-gray-200">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-gray-700">
                                    🔑 Key {index + 1} {index === 0 && <span className="text-green-600">(Primary)</span>}
                                </Label>
                                {apiKeys.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeKey(index)}
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="password"
                                    placeholder="AIza... (paste your Gemini API key)"
                                    value={key}
                                    onChange={(e) => updateKey(index, e.target.value)}
                                    className="font-mono text-xs"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTestKey(index)}
                                    disabled={isTesting || !key.trim()}
                                    className="shrink-0 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs px-3"
                                >
                                    {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Test"}
                                </Button>
                            </div>
                            {testResults[index] && (
                                <div className={`p-2 rounded text-[11px] border ${testResults[index]!.success
                                    ? "bg-green-50 border-green-200 text-green-800"
                                    : "bg-red-50 border-red-200 text-red-800"
                                    }`}>
                                    {testResults[index]!.message}
                                </div>
                            )}
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={addKeySlot}
                        className="w-full border-dashed text-xs text-gray-600 hover:text-gray-800"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Another Key (different Google account)
                    </Button>

                    <Alert className="bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                        <AlertDescription className="text-[10px] text-amber-700">
                            <strong>Quota Tip:</strong> If you see "429 Too Many Requests", your key has hit its limit. 
                            Wait 1 minute for rate-limit reset, or use a second key.
                            Get free keys at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold inline-flex items-center gap-0.5">Google AI Studio <ExternalLink className="w-3 h-3" /></a>.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between w-full border-t pt-4">
                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Clear All
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">
                            <Save className="w-3.5 h-3.5 mr-1" />
                            {isSaved ? "Saved! ✓" : `Save ${apiKeys.filter(k => k.trim()).length} Key${apiKeys.filter(k => k.trim()).length !== 1 ? 's' : ''}`}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
