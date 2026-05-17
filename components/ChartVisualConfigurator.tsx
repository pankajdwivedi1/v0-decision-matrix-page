import React from 'react';
import {
  Settings,
  Palette,
  Square,
  Layout,
  AlignJustify,
  Grid3X3,
  Type,
  Maximize2,
  Eye,
  EyeOff,
  MousePointer2,
  Brush,
  Pencil,
  BarChart2,
  Hash,
  Box,
  Monitor,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from './ui/input';
import { Switch } from '@/components/ui/switch';

export interface ChartSettings {
  // Styles
  colorPalette: 'default' | 'academic' | 'grayscale' | 'vibrant' | 'fluorescent' | 'viridis' | 'magma' | 'inferno' | 'custom';
  backgroundTheme: 'white' | 'slate' | 'dark' | 'glass';
  borderWidth: number;
  barGap: number;
  barOpacity: number;
  gridColor: string;
  gridOpacity: number;
  gridStyle: 'normal' | 'hairline';

  // Scientific Framing
  frameStyle: 'L-Frame' | 'Box';
  tickDirection: 'inner' | 'outer';

  // Elements
  showMirrorTicks: boolean;
  showGridLines: boolean;
  gridLinesMode: 'horizontal' | 'vertical' | 'both';
  showDataLabels: boolean;
  showAxisTitles: boolean;
  legendPosition: 'top' | 'bottom' | 'middle' | 'left' | 'right';
  legendLayout: 'horizontal' | 'vertical';

  // Typography & Markers
  fontSize: number;
  markerSize: number;
  markerType: 'circle' | 'square' | 'triangle' | 'diamond';
  lineStyle: 'uniform' | 'alternating' | 'sequential' | 'dashed' | 'dotted';
  resultsDecimalPlaces: number;

  // Enhancements
  barSaturation: number;
  barBrightness: number;
  barWidthPercent: number;
  fillPattern: 'none' | 'striped' | 'dotted' | 'grid' | 'weave' | 'hatch-right' | 'crosshatch' | 'dots-dense' | 'horizontal' | 'checkerboard' | 'carbon' | 'mixed';
  separatorColor: string;
  showSeparator: boolean;
  aspectRatio: 'auto' | '1:1' | '4:3' | '16:9' | '3:2' | 'golden' | 'journal-single' | 'journal-double';
  zeroBaseline: boolean;
  directLabeling: boolean;

  // Custom Labels
  xAxisTitle: string;
  yAxisTitle: string;

  // Margins
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;

  // Axis Placement
  xAxisOffset: number;
  yAxisOffset: number;

  // Legend Fine-tuning
  legendOffsetX: number;
  legendOffsetY: number;

  // Axis Widths
  yAxisWidth?: number;
  yAxisWidthRight?: number;
}

interface ChartVisualConfiguratorProps {
  settings: ChartSettings;
  onSettingsChange: (settings: ChartSettings) => void;
}

export const ChartVisualConfigurator: React.FC<ChartVisualConfiguratorProps> = ({
  settings,
  onSettingsChange,
}) => {
  const updateSetting = <K extends keyof ChartSettings>(key: K, value: ChartSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  const paletteColors = {
    academic: ['#1f77b4', '#d62728', '#2ca02c', '#ff7f0e', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
    vibrant: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#a855f7', '#64748b'],
    fluorescent: ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#8A2BE2', '#FF4500', '#7FFF00', '#1E90FF', '#FF1493'],
    viridis: ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#addc30', '#fde725'],
    magma: ['#000004', '#140e36', '#3b0f70', '#631184', '#8c2981', '#b73779', '#de4968', '#f56d5d', '#fe9444', '#ffbd35'],
    inferno: ['#000004', '#1b0c41', '#4a0c6b', '#781c6d', '#a52c60', '#cf4446', '#ed6925', '#fb9b06', '#f7d13d', '#fcffa4'],
    grayscale: ['#333', '#666', '#999', '#aaa', '#ccc', '#777', '#555', '#444', '#888', '#999'],
    default: ['#8884d8', '#82ca9d', '#ffc658', '#0088fe', '#00c49f', '#ff8042', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1']
  };

  const intervalRef = React.useRef<any>(null);

  const startNudging = (dx: number, dy: number) => {
    if (intervalRef.current) return;

    // 1. Move immediately by 15px (0.5cm) for responsiveness
    onSettingsChange({
      ...settings,
      legendOffsetX: settings.legendOffsetX + (dx > 0 ? 15 : dx < 0 ? -15 : 0),
      legendOffsetY: settings.legendOffsetY + (dy > 0 ? 15 : dy < 0 ? -15 : 0)
    });

    // 2. Start the continuous glide if they keep holding (slight delay like a keyboard repeat)
    const performCrawl = () => {
      onSettingsChange({
        ...settings,
        legendOffsetX: settings.legendOffsetX + (dx > 0 ? 2 : dx < 0 ? -2 : 0),
        legendOffsetY: settings.legendOffsetY + (dy > 0 ? 2 : dy < 0 ? -2 : 0)
      });
    };

    // Wait 250ms before repeating (prevents accidentally gliding on a quick tap)
    intervalRef.current = setTimeout(() => {
      intervalRef.current = setInterval(performCrawl, 30);
    }, 250);
  };

  const stopNudging = () => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-w-0">

      <style dangerouslySetInnerHTML={{ __html: `
        [data-slot="select-trigger"].h-5 { font-size: 7px !important; height: 20px !important; }
        [data-slot="select-trigger"].h-5 span { font-size: 7px !important; }
        [data-slot="select-value"] { font-size: 7px !important; }
        [data-slot="select-value"] span { font-size: 7px !important; }
      ` }} />
      <Tabs defaultValue="elements" className="w-full">
        <div className="bg-slate-50/50 border-b border-slate-100 px-3 sm:px-4 pt-2 sm:pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <TabsList className="grid grid-cols-3 w-full sm:w-[350px] h-8 sm:h-10 bg-slate-100/50 p-1 rounded-lg">
            <TabsTrigger value="elements" className="text-[7px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-widest gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Box className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" /> Elements
            </TabsTrigger>
            <TabsTrigger value="style" className="text-[7px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-widest gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Brush className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" /> Style
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-[7px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-widest gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Layout className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" /> Layout
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 pr-2 mb-2 sm:mb-0">
            <div className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 shadow-sm">
              <Settings className="w-2.5 sm:w-3 h-2.5 sm:h-3 animate-spin-slow" />
              <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-wider">Editor Active</span>
            </div>
          </div>
        </div>

        
          {/* ELEMENTS TAB */}
          <TabsContent value="elements" className="mt-0 space-y-3 h-full p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.8fr_1fr] gap-3 md:gap-6 items-start">
              {/* VISIBILITY SECTION */}
              <div className="space-y-2 min-w-0">
                <Label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Visibility</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="col-span-2 sm:col-span-1 space-y-1.5 p-1.5 sm:p-2.5 bg-white border border-slate-200 rounded-lg group hover:border-blue-300 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Grid3X3 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[7px] sm:text-xs font-bold text-slate-700">Grid Lines</span>
                      </div>
                      <Switch className="scale-75 sm:scale-100 origin-right" checked={settings.showGridLines} onCheckedChange={(val: boolean) => updateSetting('showGridLines', val)} />
                    </div>
                    {settings.showGridLines && (
                      <div className="flex gap-0.5 sm:gap-1 pt-0.5">
                        <Button
                          variant={settings.gridLinesMode === 'horizontal' ? 'default' : 'outline'}
                          size="sm"
                          className="h-3.5 sm:h-5 text-[6px] sm:text-[9px] px-1 sm:px-2 flex-1"
                          onClick={() => updateSetting('gridLinesMode', 'horizontal')}
                        >HORZ</Button>
                        <Button
                          variant={settings.gridLinesMode === 'vertical' ? 'default' : 'outline'}
                          size="sm"
                          className="h-3.5 sm:h-5 text-[6px] sm:text-[9px] px-1 sm:px-2 flex-1"
                          onClick={() => updateSetting('gridLinesMode', 'vertical')}
                        >VERT</Button>
                        <Button
                          variant={settings.gridLinesMode === 'both' ? 'default' : 'outline'}
                          size="sm"
                          className="h-3.5 sm:h-5 text-[6px] sm:text-[9px] px-1 sm:px-2 flex-1"
                          onClick={() => updateSetting('gridLinesMode', 'both')}
                        >BOTH</Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                      <span className="text-[7px] sm:text-xs font-bold text-slate-700">Data Labels</span>
                    </div>
                    <Switch className="scale-75 sm:scale-100 origin-right" checked={settings.showDataLabels} onCheckedChange={(val: boolean) => updateSetting('showDataLabels', val)} />
                  </div>
                  <div className="flex items-center justify-between p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <Maximize2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                      <span className="text-[7px] sm:text-xs font-bold text-slate-700">Mirror Ticks</span>
                    </div>
                    <Switch className="scale-75 sm:scale-100 origin-right" checked={settings.showMirrorTicks} onCheckedChange={(val: boolean) => updateSetting('showMirrorTicks', val)} />
                  </div>
                </div>
              </div>

              {/* TITLES & LEGEND SECTION */}
              <div className="space-y-2 min-w-0">
                <Label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Titles & Legend</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg group hover:border-blue-400 transition-all duration-300">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <Monitor className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[7px] sm:text-[10px] font-black text-slate-700 uppercase tracking-tighter">Legend Pos</span>
                      </div>
                      <div className="text-[6px] font-bold text-slate-400 uppercase tracking-tight">
                        {settings.legendPosition} (X:{settings.legendOffsetX} Y:{settings.legendOffsetY})
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-0.5 bg-slate-50 p-0.5 rounded border border-slate-100 shadow-inner scale-90 sm:scale-100 origin-right">
                      <div />
                      <Button
                        variant="ghost" size="icon" className="h-4 sm:h-5 w-4 sm:w-5 rounded-sm p-0"
                        onMouseDown={() => startNudging(0, -1)} onMouseUp={stopNudging} onMouseLeave={stopNudging}
                      ><ChevronUp className="w-2.5 sm:w-3 h-2.5 sm:h-3" /></Button>
                      <div />

                      <Button
                        variant="ghost" size="icon" className="h-4 sm:h-5 w-4 sm:w-5 rounded-sm p-0"
                        onMouseDown={() => startNudging(-1, 0)} onMouseUp={stopNudging} onMouseLeave={stopNudging}
                      ><ChevronLeft className="w-2.5 sm:w-3 h-2.5 sm:h-3" /></Button>
                      <Button
                        variant={settings.legendPosition === 'middle' && settings.legendOffsetX === 0 && settings.legendOffsetY === 0 ? 'default' : 'ghost'}
                        size="icon" className={`h-4 sm:h-5 w-4 sm:w-5 rounded-sm p-0 ${settings.legendPosition === 'middle' && settings.legendOffsetX === 0 && settings.legendOffsetY === 0 ? 'bg-blue-600 text-white' : ''}`}
                        onClick={() => onSettingsChange({ ...settings, legendPosition: 'middle', legendOffsetX: 0, legendOffsetY: 0 })}
                      ><Circle className="w-1.5 h-1.5 fill-current" /></Button>
                      <Button
                        variant="ghost" size="icon" className="h-4 sm:h-5 w-4 sm:w-5 rounded-sm p-0"
                        onMouseDown={() => startNudging(1, 0)} onMouseUp={stopNudging} onMouseLeave={stopNudging}
                      ><ChevronRight className="w-2.5 sm:w-3 h-2.5 sm:h-3" /></Button>

                      <div />
                      <Button
                        variant="ghost" size="icon" className="h-4 sm:h-5 w-4 sm:w-5 rounded-sm p-0"
                        onMouseDown={() => startNudging(0, 1)} onMouseUp={stopNudging} onMouseLeave={stopNudging}
                      ><ChevronDown className="w-2.5 sm:w-3 h-2.5 sm:h-3" /></Button>
                      <div />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <Type className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                        <span className="text-[7px] sm:text-xs font-bold text-slate-700">Axis Titles</span>
                      </div>
                      <Switch className="scale-75 sm:scale-100 origin-right" checked={settings.showAxisTitles} onCheckedChange={(val: boolean) => updateSetting('showAxisTitles', val)} />
                    </div>

                    <div className="flex flex-col gap-1 p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[6px] sm:text-[10px] font-black text-slate-700 uppercase tracking-tighter">Legend Style</span>
                      <div className="flex gap-0.5">
                        <Button
                          variant={settings.legendLayout === 'horizontal' ? 'secondary' : 'ghost'}
                          size="sm" className="h-3.5 sm:h-5 text-[6px] sm:text-[9px] px-1 sm:px-2 font-bold flex-1"
                          onClick={() => updateSetting('legendLayout', 'horizontal')}
                        >HORIZ</Button>
                        <Button
                          variant={settings.legendLayout === 'vertical' ? 'secondary' : 'ghost'}
                          size="sm" className="h-3.5 sm:h-5 text-[6px] sm:text-[9px] px-1 sm:px-2 font-bold flex-1"
                          onClick={() => updateSetting('legendLayout', 'vertical')}
                        >VERT</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AXIS LABELS SECTION */}
              <div className="space-y-2 col-span-1 min-w-0">
                <Label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Axis Labels</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1 p-1 sm:p-2 bg-white border border-slate-200 rounded-lg">
                    <span className="text-[7px] sm:text-[10px] font-black text-blue-500 w-3">X</span>
                    <Input
                      value={settings.xAxisTitle || ''}
                      onChange={(e) => updateSetting('xAxisTitle', e.target.value)}
                      disabled={!settings.showAxisTitles}
                      placeholder="X Title"
                      className="h-5 sm:h-7 text-[9px] sm:text-[11px] font-bold border-none shadow-none focus-visible:ring-0 p-0"
                    />
                  </div>
                  <div className="flex items-center gap-1 p-1 sm:p-2 bg-white border border-slate-200 rounded-lg">
                    <span className="text-[7px] sm:text-[10px] font-black text-green-500 w-3">Y</span>
                    <Input
                      value={settings.yAxisTitle || ''}
                      onChange={(e) => updateSetting('yAxisTitle', e.target.value)}
                      disabled={!settings.showAxisTitles}
                      placeholder="Y Title"
                      className="h-5 sm:h-7 text-[9px] sm:text-[11px] font-bold border-none shadow-none focus-visible:ring-0 p-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* STYLE TAB */}
          
          <TabsContent value="style" className="mt-0 space-y-3 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {/* MASTER PALETTE */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between underline decoration-slate-200 underline-offset-4">
                  <Label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Master Palette</Label>
                  <Palette className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-500" />
                </div>
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  {(['academic', 'grayscale', 'vibrant', 'fluorescent', 'viridis', 'magma', 'inferno', 'default'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateSetting('colorPalette', p)}
                      className={`p-1 sm:p-2 rounded-lg sm:rounded-xl border text-left transition-all ${settings.colorPalette === p ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className="text-[6px] sm:text-[9px] font-black uppercase mb-0.5 sm:mb-1.5 text-slate-400 tracking-tighter truncate">{p}</div>
                      <div className="flex gap-0.5">
                        {paletteColors[p].slice(0, 4).map((c, i) => (
                          <div key={i} className="w-full h-1 sm:h-1.5 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* VISUAL THEME & SLIDERS */}
              <div className="space-y-3 md:border-l md:border-slate-100 md:pl-8">
                <div className="flex items-center justify-between underline decoration-slate-200 underline-offset-4">
                  <Label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Visual Theme</Label>
                  <Brush className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-500" />
                </div>
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  {(['white', 'slate', 'dark', 'glass'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSetting('backgroundTheme', t)}
                      className={`p-1 sm:p-2 rounded-lg sm:rounded-xl border text-left transition-all ${settings.backgroundTheme === t ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className="text-[6px] sm:text-[9px] font-black uppercase mb-0.5 sm:mb-1.5 text-slate-400 tracking-tighter truncate">{t}</div>
                      <div className="w-full h-2 sm:h-3 rounded border border-slate-100" style={{
                        backgroundColor: t === 'white' ? '#fff' : t === 'slate' ? '#f8fafc' : t === 'dark' ? '#0f172a' : 'rgba(255,255,255,0.7)'
                      }} />
                    </button>
                  ))}
                </div>

                <div className="pt-2 sm:pt-4 grid grid-cols-4 gap-1 sm:gap-3 border-t border-slate-50">
                  {[
                    { key: 'barOpacity', label: 'OPAC', max: 1, step: 0.1, min: 0.1 },
                    { key: 'barSaturation', label: 'SATUR', max: 2, step: 0.1, min: 0 },
                    { key: 'barBrightness', label: 'BRIGHT', max: 2, step: 0.1, min: 0 },
                    { key: 'barWidthPercent', label: 'BREADTH', max: 100, step: 5, min: 10 }
                  ].map((m) => (
                    <div key={m.key} className="space-y-1 min-w-0">
                      <div className="flex justify-between font-bold text-slate-400 uppercase tracking-tighter" style={{ fontSize: "7px" }}>
                        <span style={{ fontSize: "7px" }}>{m.label}</span>
                        <span style={{ fontSize: "7px" }}>{m.key === 'barWidthPercent' ? `${settings[m.key as keyof ChartSettings]}%` : `${Math.round((settings[m.key as keyof ChartSettings] as number) * 100)}%`}</span>
                      </div>
                      <input
                        type="range" min={m.min} max={m.max} step={m.step}
                        value={settings[m.key as keyof ChartSettings] as number}
                        onChange={(e) => updateSetting(m.key as any, parseFloat(e.target.value))}
                        className="w-full h-0.5 sm:h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* LINE & BORDER */}
              <div className="space-y-3 md:border-l md:border-slate-100 md:pl-8">
                <Label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Line & Border</Label>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-1.5 sm:p-2 bg-white border border-slate-100 rounded-lg">
                    <span className="font-bold text-slate-600" style={{ fontSize: "7px" }}>Stroke Weight</span>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5">
                      <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => updateSetting('borderWidth', Math.max(0.5, settings.borderWidth - 0.5))}>-</Button>
                      <span className="font-black min-w-[15px] text-center" style={{ fontSize: "7px" }}>{settings.borderWidth}</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => updateSetting('borderWidth', Math.min(4, settings.borderWidth + 0.5))}>+</Button>
                    </div>
                  </div>

                  {/* Bar Gap control */}
                  <div className="flex items-center justify-between p-1.5 sm:p-2 bg-white border border-slate-100 rounded-lg">
                    <span className="font-bold text-slate-600" style={{ fontSize: "7px" }}>Bar Gap</span>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5">
                      <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => updateSetting('barGap', Math.max(0, (settings.barGap ?? 4) - 1))}>-</Button>
                      <span className="font-black min-w-[15px] text-center" style={{ fontSize: "7px" }}>{settings.barGap ?? 4}px</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => updateSetting('barGap', Math.min(30, (settings.barGap ?? 4) + 1))}>+</Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'Line Style', key: 'lineStyle', options: [
                          { val: 'uniform', lab: 'Uniform' },
                          { val: 'alternating', lab: 'Alt' },
                          { val: 'sequential', lab: 'Seq' },
                          { val: 'dashed', lab: 'Dash' },
                          { val: 'dotted', lab: 'Dot' }
                        ]},
                        { label: 'Precision', key: 'resultsDecimalPlaces', options: [
                          { val: '1', lab: '.1' },
                          { val: '2', lab: '.01' },
                          { val: '3', lab: '.001' },
                          { val: '4', lab: '.0001' }
                        ]}
                      ].map((item) => (
                        <div key={item.key} className="flex flex-col gap-0.5 p-1 bg-slate-50/50 border border-slate-100 rounded-md">
                          <span className="font-bold text-slate-400 uppercase tracking-tighter" style={{ fontSize: "7px" }}>{item.label}</span>
                          <Select 
                            value={item.key === 'resultsDecimalPlaces' ? (settings.resultsDecimalPlaces ?? 3).toString() : (settings[item.key as keyof ChartSettings] as string)} 
                            onValueChange={(val: any) => updateSetting(item.key as any, item.key === 'resultsDecimalPlaces' ? parseInt(val) : val)}
                          >
                            <SelectTrigger className="h-5 font-bold bg-white [&_*]:!text-[7px] !text-[7px] border-none shadow-none p-0.5 w-full" style={{ fontSize: "7px" }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {item.options.map(opt => <SelectItem key={opt.val} value={opt.val}>{opt.lab}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: 'Fill', key: 'fillPattern', options: [
                          { val: 'none', lab: 'Solid' },
                          { val: 'striped', lab: 'Striped' },
                          { val: 'dotted', lab: 'Dotted' },
                          { val: 'grid', lab: 'Grid' },
                          { val: 'weave', lab: 'Weave' },
                          { val: 'hatch-right', lab: 'Hatch R' },
                          { val: 'crosshatch', lab: 'Crosshatch' },
                          { val: 'dots-dense', lab: 'Dots Dense' },
                          { val: 'horizontal', lab: 'Horizontal' },
                          { val: 'checkerboard', lab: 'Checkerboard' },
                          { val: 'carbon', lab: 'Carbon Fiber' },
                          { val: 'mixed', lab: 'Mixed (Different)' }
                        ]},
                        { label: 'Grid', key: 'gridStyle', options: [
                          { val: 'normal', lab: 'Normal' },
                          { val: 'hairline', lab: 'Hairline' }
                        ]},
                        { label: 'Frame', key: 'frameStyle', options: [
                          { val: 'L-Frame', lab: 'L-Frame' },
                          { val: 'Box', lab: 'Box' }
                        ]}
                      ].map((item) => (
                        <div key={item.key} className="flex flex-col gap-0.5 p-1 bg-slate-50/50 border border-slate-100 rounded-md">
                          <span className="font-bold text-slate-400 uppercase tracking-tighter" style={{ fontSize: "7px" }}>{item.label}</span>
                          <Select 
                            value={(settings[item.key as keyof ChartSettings] as string)} 
                            onValueChange={(val: any) => updateSetting(item.key as any, val)}
                          >
                            <SelectTrigger className="h-5 font-bold bg-white [&_*]:!text-[7px] !text-[7px] border-none shadow-none p-0.5 w-full" style={{ fontSize: "7px" }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {item.options.map(opt => <SelectItem key={opt.val} value={opt.val}>{opt.lab}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5 border-t border-slate-50 pt-1.5 px-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-400 uppercase" style={{ fontSize: "7px" }}>Ticks</span>
                          <Select value={settings.tickDirection || 'outer'} onValueChange={(val: any) => updateSetting('tickDirection', val)}>
                            <SelectTrigger className="h-5 font-bold bg-white [&_*]:!text-[7px] !text-[7px] border-none shadow-none p-0.5 w-16" style={{ fontSize: "7px" }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="outer">Outer</SelectItem>
                              <SelectItem value="inner">Inward</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-400 uppercase" style={{ fontSize: "7px" }}>Sep</span>
                          <div className="flex items-center gap-1">
                            <Switch className="scale-75 origin-right" checked={settings.showSeparator} onCheckedChange={(val) => updateSetting('showSeparator', val)} />
                            <input 
                              type="color" 
                              value={settings.separatorColor || '#e2e8f0'} 
                              onChange={(e) => updateSetting('separatorColor', e.target.value)}
                              className="w-3 h-3 p-0 border border-slate-200 rounded-sm cursor-pointer overflow-hidden bg-transparent"
                              title="Separator Color"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-400 uppercase" style={{ fontSize: "7px" }}>Zero Baseline</span>
                          <Switch className="scale-75 origin-right" checked={settings.zeroBaseline} onCheckedChange={(val) => updateSetting('zeroBaseline', val)} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-400 uppercase" style={{ fontSize: "7px" }}>Direct Labels</span>
                          <Switch className="scale-75 origin-right" checked={settings.directLabeling} onCheckedChange={(val) => updateSetting('directLabeling', val)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>


          {/* LAYOUT TAB */}
          <TabsContent value="layout" className="mt-0 space-y-3 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-8 items-start">
              {/* TYPOGRAPHY & MARKERS SECTION */}
              <div className="space-y-2 col-span-1 md:col-span-1">
                <Label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Typography & Markers</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Base Font */}
                  <div className="flex flex-col gap-0.5 p-1 sm:p-2 bg-white border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-400 uppercase" style={{ fontSize: "7px" }}>Base Font</span>
                    <div className="flex items-center justify-between bg-slate-50/50 rounded-md p-0.5">
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => updateSetting('fontSize', Math.max(8, settings.fontSize - 1))}>-</Button>
                      <span className="font-black text-slate-700" style={{ fontSize: "7px" }}>{settings.fontSize}</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => updateSetting('fontSize', Math.min(20, settings.fontSize + 1))}>+</Button>
                    </div>
                  </div>
                  {/* Marker Type */}
                  <div className="flex flex-col gap-0.5 p-1 sm:p-2 bg-white border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-400 uppercase" style={{ fontSize: "7px" }}>Type</span>
                    <Select value={settings.markerType || 'circle'} onValueChange={(val: any) => updateSetting('markerType', val)}>
                      <SelectTrigger className="h-5 sm:h-8 font-bold w-full bg-white border-none shadow-none p-0 [&_*]:!text-[7px] !text-[7px]" style={{ fontSize: "7px" }}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="triangle">Triangle</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Marker Size */}
                  <div className="flex flex-col gap-0.5 p-1 sm:p-2 bg-white border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-400 uppercase" style={{ fontSize: "7px" }}>Size</span>
                    <div className="flex items-center justify-between bg-slate-50/50 rounded-md p-0.5">
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => updateSetting('markerSize', Math.max(1, settings.markerSize - 1))}>-</Button>
                      <span className="font-black text-slate-700" style={{ fontSize: "7px" }}>{settings.markerSize}px</span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => updateSetting('markerSize', Math.min(10, settings.markerSize + 1))}>+</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PLACEMENT OFFSETS */}
              <div className="space-y-2 min-w-0 overflow-hidden">
                <Label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Placement Ofts</Label>
                <div className="grid grid-cols-2 gap-2 min-w-0">
                  <div className="space-y-1 p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg min-w-0 overflow-hidden">
                    <div className="flex justify-between font-black text-slate-400 uppercase tracking-tighter" style={{ fontSize: "7px" }}>
                      <span style={{ fontSize: "7px" }}>Y-AXIS</span><span style={{ fontSize: "7px" }}>{settings.yAxisOffset}px</span>
                    </div>
                    <input
                      type="range" min="-50" max="50" step="1"
                      value={settings.yAxisOffset ?? 0}
                      onChange={(e) => updateSetting('yAxisOffset', parseInt(e.target.value))}
                      className="w-full h-0.5 sm:h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="space-y-1 p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg min-w-0 overflow-hidden">
                    <div className="flex justify-between font-black text-slate-400 uppercase tracking-tighter" style={{ fontSize: "7px" }}>
                      <span style={{ fontSize: "7px" }}>X-AXIS</span><span style={{ fontSize: "7px" }}>{settings.xAxisOffset}px</span>
                    </div>
                    <input
                      type="range" min="-50" max="50" step="1"
                      value={settings.xAxisOffset ?? 0}
                      onChange={(e) => updateSetting('xAxisOffset', parseInt(e.target.value))}
                      className="w-full h-0.5 sm:h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* SCIENTIFIC LAYOUT */}
              <div className="space-y-2 md:col-span-2 min-w-0 overflow-hidden">
                <Label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Scientific Layout & Presets</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                  <div className="grid grid-cols-2 gap-1 sm:gap-1.5 p-1 sm:p-3 bg-slate-50/50 border border-slate-100 rounded-lg col-span-2 sm:col-span-1 min-w-0 overflow-hidden">
                    {[
                      { key: 'marginTop', label: 'TOP' },
                      { key: 'marginBottom', label: 'BOTTOM' },
                      { key: 'marginLeft', label: 'LEFT' },
                      { key: 'marginRight', label: 'RIGHT' }
                    ].map((m) => (
                      <div key={m.key} className="space-y-0.5 sm:space-y-1">
                        <div className="flex justify-between font-black text-slate-400 uppercase tracking-tighter" style={{ fontSize: "7px" }}>
                          <span style={{ fontSize: "7px" }}>{m.label}</span><span style={{ fontSize: "7px" }}>{settings[m.key as keyof ChartSettings]}px</span>
                        </div>
                        <input
                          type="range" min="0" max="150" step="5"
                          value={settings[m.key as keyof ChartSettings] as number}
                          onChange={(e) => updateSetting(m.key as any, parseInt(e.target.value))}
                          className="w-full h-0.5 sm:h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col justify-between gap-1.5 p-1.5 sm:p-3 bg-white border border-slate-200 rounded-lg col-span-2 sm:col-span-1">
                    <span className="font-black text-slate-400 uppercase tracking-widest" style={{ fontSize: "7px" }}>Aspect Ratio Preset</span>
                    <Select value={settings.aspectRatio || 'auto'} onValueChange={(val: any) => updateSetting('aspectRatio', val)}>
                      <SelectTrigger className="h-5 sm:h-8 font-bold w-full bg-slate-50 border-none [&_*]:!text-[7px] !text-[7px]" style={{ fontSize: "7px" }}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="1:1">1:1 Square</SelectItem>
                        <SelectItem value="4:3">4:3 Std</SelectItem>
                        <SelectItem value="3:2">3:2 Classic</SelectItem>
                        <SelectItem value="16:9">16:9 Wide</SelectItem>
                        <SelectItem value="golden">Golden</SelectItem>
                        <SelectItem value="journal-single">Single Col</SelectItem>
                        <SelectItem value="journal-double">Double Col</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        
      </Tabs>

      <div className="px-3 sm:px-4 py-1 sm:py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <MousePointer2 className="w-2 sm:w-3 h-2 sm:h-3 text-slate-400" />
          <span className="font-black text-slate-400 uppercase tracking-widest italic" style={{ fontSize: "6px" }}>Live Preview Sync Enabled</span>
        </div>
        <div className="font-medium text-slate-400 uppercase tracking-tighter" style={{ fontSize: "6px" }}>
          Palette: <span className="text-[7px] text-blue-600 font-black" style={{ fontSize: "6.5px" }}>{settings.colorPalette}</span>
        </div>
      </div>
    </div>
  );
};
