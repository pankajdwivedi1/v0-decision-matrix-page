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
import { Key, Save, AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ApiKeySettings() {
    const [apiKey, setApiKey] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem("user_gemini_api_key") || "";
        setApiKey(savedKey);
    }, []);

    const handleSave = () => {
        localStorage.setItem("user_gemini_api_key", apiKey.trim());
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            setIsOpen(false);
        }, 1500);
    };

    const handleClear = () => {
        setApiKey("");
        localStorage.removeItem("user_gemini_api_key");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full gap-1 text-[10px] border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 px-2"
                >
                    <Key className="w-3.5 h-3.5" />
                    Step 1: API Settings
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-amber-600" />
                        Your Gemini API Key
                    </DialogTitle>
                    <DialogDescription>
                        Provide your own Gemini API key to avoid shared quota limits. This key is stored only in your browser.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="apiKey" className="text-xs font-semibold">
                            Gemini API Key
                        </Label>
                        <Input
                            id="apiKey"
                            type="password"
                            placeholder="Paste your key here (starts with AIza...)"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="font-mono text-sm"
                        />
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-xs text-blue-700">
                            Don't have a key? You can get a free or paid key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold flex inline-flex items-center gap-0.5">Google AI Studio <ExternalLink className="w-3 h-3" /></a>.
                        </AlertDescription>
                    </Alert>

                    {apiKey && (
                        <p className="text-[10px] text-gray-500 italic">
                            Note: Using your own key allows for higher request limits and faster generations.
                        </p>
                    )}
                </div>
                <DialogFooter className="flex justify-between sm:justify-between w-full border-t pt-4">
                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Clear Key
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">
                            {isSaved ? "Saved!" : "Save Key"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
