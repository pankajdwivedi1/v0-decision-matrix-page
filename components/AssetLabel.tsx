import React, { useState, useEffect } from "react";
import { Tag } from "lucide-react";

interface AssetLabelProps {
    assetKey: string;
    defaultLabel: string;
    onLabelChange?: (key: string, label: string) => void;
}

export function AssetLabel({ assetKey, defaultLabel, onLabelChange }: AssetLabelProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(defaultLabel);

    // Sync state with prop when not editing
    useEffect(() => {
        if (!isEditing) {
            setLocalValue(defaultLabel);
        }
    }, [defaultLabel, isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (localValue !== defaultLabel) {
            localStorage.setItem(`asset_label_${assetKey}`, localValue);
            if (onLabelChange) {
                onLabelChange(assetKey, localValue);
            }
        }
    };

    return (
        <div className="inline-flex items-center gap-1.5 bg-blue-50/50 hover:bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 transition-colors ml-2">
            <Tag className="w-2.5 h-2.5 text-blue-500" />
            <span className="text-[9px] text-blue-400 font-medium uppercase tracking-wider">Asset ID:</span>
            {isEditing ? (
                <input
                    autoFocus
                    className="text-[10px] w-24 px-1 py-0 border-none focus:ring-0 bg-transparent outline-none font-bold text-blue-700 h-4"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleBlur();
                        if (e.key === 'Escape') setIsEditing(false);
                    }}
                />
            ) : (
                <button
                    className="text-[10px] font-bold text-blue-700 cursor-pointer hover:text-blue-800 transition-colors underline decoration-blue-200 underline-offset-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                    }}
                    title="Click to rename for research paper"
                >
                    {localValue}
                </button>
            )}
        </div>
    );
}
