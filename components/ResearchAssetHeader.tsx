import React, { useState } from "react";
import { Tag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResearchAssetHeaderProps {
    assetKey: string;
    defaultLabel: string;
    title: string;
    onLabelChange?: (key: string, label: string) => void;
    onAiAnalysis?: (key: string) => void;
    included?: boolean;
    onIncludeChange?: (key: string, included: boolean) => void;
    children?: React.ReactNode;
}

export function ResearchAssetHeader({
    assetKey,
    defaultLabel,
    title,
    onLabelChange,
    onAiAnalysis,
    included = false,
    onIncludeChange,
    children
}: ResearchAssetHeaderProps) {
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [localLabel, setLocalLabel] = useState(defaultLabel);

    const handleLabelBlur = () => {
        setIsEditingLabel(false);
        if (localLabel !== defaultLabel) {
            localStorage.setItem(`asset_label_${assetKey}`, localLabel);
            if (onLabelChange) {
                onLabelChange(assetKey, localLabel);
            }
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-1 sm:py-2 mb-1 sm:mb-2 w-full">
            <div className="flex flex-row items-center gap-2 flex-wrap">
                {/* Editable Table/Figure Label */}
                <div className="inline-flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 transition-colors">
                    <Tag className="w-2.5 h-2.5 text-blue-500" />
                    {isEditingLabel ? (
                        <input
                            autoFocus
                            className="text-[7px] sm:text-[11px] w-14 sm:w-20 px-1 py-0 border-none focus:ring-0 bg-transparent outline-none font-bold text-blue-700 h-4"
                            value={localLabel}
                            onChange={(e) => setLocalLabel(e.target.value)}
                            onBlur={handleLabelBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleLabelBlur();
                                if (e.key === 'Escape') setIsEditingLabel(false);
                            }}
                        />
                    ) : (
                        <button
                            className="text-[7px] sm:text-[11px] font-bold text-blue-700 cursor-pointer hover:text-blue-800 transition-colors underline decoration-blue-200 underline-offset-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingLabel(true);
                            }}
                            title="Click to rename table number"
                        >
                            {localLabel}
                        </button>
                    )}
                </div>
                <h3 className="text-[7px] sm:text-sm font-black text-gray-900 uppercase tracking-tight">
                    {title}
                </h3>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {children}
                {/* AI Assistant Button */}
                <Button
                    onClick={() => onAiAnalysis?.(assetKey)}
                    variant="outline"
                    size="sm"
                    className="h-6 sm:h-8 px-1.5 sm:px-3 text-[7px] sm:text-xs bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200 text-violet-700 hover:from-violet-100 hover:to-purple-100 group shadow-sm transition-all whitespace-nowrap"
                >
                    <Sparkles className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 mr-1 text-violet-600 group-hover:scale-110 transition-transform" />
                    AI Assistant
                </Button>

                {/* Include in AI Checkbox */}
                <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                        type="checkbox"
                        id={`include-${assetKey}`}
                        checked={included}
                        onChange={(e) => onIncludeChange?.(assetKey, e.target.checked)}
                        className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                        htmlFor={`include-${assetKey}`}
                        className="text-[7px] font-bold text-gray-600 cursor-pointer uppercase tracking-wider select-none"
                    >
                        Mark for AI
                    </label>
                </div>
            </div>
        </div>
    );
}
