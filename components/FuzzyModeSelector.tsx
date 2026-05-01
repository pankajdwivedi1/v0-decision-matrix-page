
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, RotateCcw, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { LINGUISTIC_SCALES as DEFAULT_SCALES } from "@/constants/fuzzy";

interface FuzzyModeSelectorProps {
  isFuzzyMode: boolean;
  setIsFuzzyMode: (val: boolean) => void;
  fuzzyScaleType: 5 | 7 | 9 | 11;
  setFuzzyScaleType: (val: 5 | 7 | 9 | 11) => void;
  customFuzzyScales: any;
  setCustomFuzzyScales: (scales: any) => void;
}

export const FuzzyModeSelector: React.FC<FuzzyModeSelectorProps> = ({
  isFuzzyMode,
  setIsFuzzyMode,
  fuzzyScaleType,
  setFuzzyScaleType,
  customFuzzyScales,
  setCustomFuzzyScales,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingScales, setEditingScales] = useState(customFuzzyScales);
  const [isCrispSettingsOpen, setIsCrispSettingsOpen] = useState(false);
  const [crispSpread, setCrispSpread] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fuzzy_crisp_spread');
      return saved ? parseFloat(saved) : 10;
    }
    return 10;
  });

  const handleOpenSettings = () => {
    setEditingScales(JSON.parse(JSON.stringify(customFuzzyScales)));
    setIsSettingsOpen(true);
  };

  const handleUpdateTriplet = (scale: number, index: number, field: 'l' | 'm' | 'u', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const newScales = { ...editingScales };
    newScales[scale][index].triplet[field] = numValue;
    setEditingScales(newScales);
  };

  const handleSave = () => {
    setCustomFuzzyScales(editingScales);
    setIsSettingsOpen(false);
    // Persist to localStorage if needed (can also be handled in parent)
  };

  const handleReset = () => {
    if (confirm("Reset active scale to default values?")) {
      const newScales = { ...editingScales };
      newScales[fuzzyScaleType] = JSON.parse(JSON.stringify(DEFAULT_SCALES[fuzzyScaleType as keyof typeof DEFAULT_SCALES]));
      setEditingScales(newScales);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100/50 shadow-sm">
      <div className="flex items-center gap-1.5 border-r border-blue-200 pr-3">
        <Label htmlFor="fuzzy-mode-toggle" className="text-[10px] font-bold text-blue-700 cursor-pointer uppercase tracking-tight">Fuzzy Mode</Label>
        <Switch
          id="fuzzy-mode-toggle"
          checked={isFuzzyMode}
          onCheckedChange={setIsFuzzyMode}
          className="scale-75 data-[state=checked]:bg-blue-600"
        />
      </div>
      
      <div className="flex items-center gap-1.5 border-r border-blue-200 pr-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100 uppercase tracking-tight gap-1 shadow-none bg-transparent"
          onClick={() => setIsCrispSettingsOpen(true)}
        >
          <Sparkles className="h-3 w-3 text-blue-600 animate-pulse" />
          Fuzzy Spread ({crispSpread}%)
        </Button>
      </div>
      
      {isFuzzyMode && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
          <Label className="text-[9px] font-bold text-blue-600 uppercase">Scale:</Label>
          <Select 
            value={fuzzyScaleType.toString()} 
            onValueChange={(val) => setFuzzyScaleType(parseInt(val) as 5 | 7 | 9 | 11)}
          >
            <SelectTrigger className="h-6 w-[85px] text-[10px] bg-white border-blue-200 text-blue-800 font-bold shadow-none focus:ring-1 focus:ring-blue-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5" className="text-[10px] font-bold">5 Points</SelectItem>
              <SelectItem value="7" className="text-[10px] font-bold">7 Points</SelectItem>
              <SelectItem value="9" className="text-[10px] font-bold">9 Points</SelectItem>
              <SelectItem value="11" className="text-[10px] font-bold">11 Points</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
            onClick={handleOpenSettings}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Scale Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Linguistic Scale Configurator ({fuzzyScaleType} Points)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Customize the Triangular Fuzzy Numbers (TFN) triplets $(l, m, u)$ for your research. 
              Changes will be applied to all active calculations.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 font-bold text-gray-700">Linguistic Term</th>
                  <th className="p-3 font-bold text-center text-blue-700">Lower (l)</th>
                  <th className="p-3 font-bold text-center text-blue-700">Medium (m)</th>
                  <th className="p-3 font-bold text-center text-blue-700">Upper (u)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {editingScales[fuzzyScaleType].map((item: any, idx: number) => (
                  <tr key={item.value} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3 font-semibold text-gray-800">{item.label}</td>
                    <td className="p-3">
                      <Input 
                        type="number" 
                        step="0.01"
                        className="h-8 text-center text-xs border-gray-300"
                        value={item.triplet.l}
                        onChange={(e) => handleUpdateTriplet(fuzzyScaleType, idx, 'l', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <Input 
                        type="number" 
                        step="0.01"
                        className="h-8 text-center text-xs border-gray-300 bg-blue-50/50 font-bold"
                        value={item.triplet.m}
                        onChange={(e) => handleUpdateTriplet(fuzzyScaleType, idx, 'm', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <Input 
                        type="number" 
                        step="0.01"
                        className="h-8 text-center text-xs border-gray-300"
                        value={item.triplet.u}
                        onChange={(e) => handleUpdateTriplet(fuzzyScaleType, idx, 'u', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Tip:</strong> Ensure that $l \leq m \leq u$ for valid triangular numbers. 
              Symmetrical overlaps between levels (e.g., $u_{"n"} = m_{"n+1"}$) are recommended for better data continuity.
            </p>
          </div>

          <DialogFooter className="mt-6 flex justify-between items-center sm:justify-between">
            <Button variant="outline" size="sm" className="text-xs gap-2" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
              <Button size="sm" className="text-xs gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                <Save className="w-3.5 h-3.5" />
                Apply Scale
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Crisp-to-Fuzzy Settings Dialog */}
      <Dialog open={isCrispSettingsOpen} onOpenChange={setIsCrispSettingsOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-800">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Crisp-to-Fuzzy Conversion
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              When running Fuzzy methods with crisp numerical data, the system automatically converts your numbers into Triangular Fuzzy Numbers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-gray-700">Fuzzification Spread percentage ($\pm X\%$):</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={crispSpread}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setCrispSpread(val);
                  }}
                  className="w-24 h-9 text-center text-sm border-gray-300 font-bold text-black"
                />
                <span className="text-sm font-bold text-gray-500">%</span>
              </div>
              <p className="text-[10px] text-gray-500 italic leading-relaxed">
                Example: If your value is 100 and spread is 10%, it becomes [90, 100, 110].
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="ghost" size="sm" className="text-xs text-gray-600 hover:bg-gray-100" onClick={() => setIsCrispSettingsOpen(false)}>Cancel</Button>
            <Button 
              size="sm" 
              className="text-xs gap-2 bg-blue-600 hover:bg-blue-700 text-white" 
              onClick={() => {
                localStorage.setItem('fuzzy_crisp_spread', crispSpread.toString());
                setIsCrispSettingsOpen(false);
                toast.success(`Fuzzy spread set to ${crispSpread}%`);
              }}
            >
              <Save className="w-3.5 h-3.5" />
              Save Spread
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
