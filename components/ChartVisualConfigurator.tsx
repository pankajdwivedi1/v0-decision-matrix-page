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
  colorPalette: 'default' | 'academic' | 'grayscale' | 'vibrant' | 'custom';
  backgroundTheme: 'white' | 'slate' | 'dark' | 'glass';
  borderWidth: number;
  barOpacity: number;
  gridColor: string;
  gridOpacity: number;

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
  resultsDecimalPlaces: number;

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
    academic: ['#1f77b4', '#d62728', '#2ca02c', '#ff7f0e', '#9467bd'],
    vibrant: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    grayscale: ['#333', '#666', '#999', '#aaa', '#ccc'],
    default: ['#8884d8', '#82ca9d', '#ffc658', '#0088fe', '#00c49f']
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
    <div className="w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
      <Tabs defaultValue="elements" className="w-full">
        <div className="bg-slate-50/50 border-b border-slate-100 px-4 pt-4 flex items-center justify-between">
          <TabsList className="grid grid-cols-3 w-[350px] h-10 bg-slate-100/50 p-1 rounded-lg">
            <TabsTrigger value="elements" className="text-[10px] font-black uppercase tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Box className="w-3.5 h-3.5" /> Elements
            </TabsTrigger>
            <TabsTrigger value="style" className="text-[10px] font-black uppercase tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Brush className="w-3.5 h-3.5" /> Style
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-[10px] font-black uppercase tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Layout className="w-3.5 h-3.5" /> Layout
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 pr-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 shadow-sm">
              <Settings className="w-3 h-3 animate-spin-slow" />
              <span className="text-[10px] font-black uppercase tracking-wider">Editor Active</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-4 min-h-0">
          {/* ELEMENTS TAB */}
          <TabsContent value="elements" className="mt-0 space-y-4 h-full">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-6 items-stretch">
              <div className="flex flex-col justify-between h-full space-y-3">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility</Label>
                <div className="grid gap-2">
                  <div className="space-y-2 p-2.5 bg-white border border-slate-200 rounded-lg group hover:border-blue-300 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-xs font-bold text-slate-700">Grid Lines</span>
                      </div>
                      <Switch checked={settings.showGridLines} onCheckedChange={(val: boolean) => updateSetting('showGridLines', val)} />
                    </div>
                    {settings.showGridLines && (
                      <div className="flex gap-1 pt-1">
                        <Button
                          variant={settings.gridLinesMode === 'horizontal' ? 'default' : 'outline'}
                          size="sm"
                          className="h-5 text-[9px] px-2"
                          onClick={() => updateSetting('gridLinesMode', 'horizontal')}
                        >HORZ</Button>
                        <Button
                          variant={settings.gridLinesMode === 'vertical' ? 'default' : 'outline'}
                          size="sm"
                          className="h-5 text-[9px] px-2"
                          onClick={() => updateSetting('gridLinesMode', 'vertical')}
                        >VERT</Button>
                        <Button
                          variant={settings.gridLinesMode === 'both' ? 'default' : 'outline'}
                          size="sm"
                          className="h-5 text-[9px] px-2"
                          onClick={() => updateSetting('gridLinesMode', 'both')}
                        >BOTH</Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">Data Labels</span>
                    </div>
                    <Switch checked={settings.showDataLabels} onCheckedChange={(val: boolean) => updateSetting('showDataLabels', val)} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between h-full space-y-3">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Titles & Legend</Label>
                <div className="flex flex-col md:flex-row items-stretch justify-between w-full gap-4">
                  <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg group hover:border-blue-400 transition-all duration-300 flex-1">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Legend Pos</span>
                      </div>
                      <div className="flex flex-col text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                        <span>{settings.legendPosition}</span>
                        <div className="flex gap-2">
                          <span>X: {settings.legendOffsetX}</span>
                          <span>Y: {settings.legendOffsetY}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 shadow-inner">
                      <div />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-sm transition-all hover:bg-white text-slate-400 active:scale-90 active:bg-blue-50"
                        onMouseDown={() => startNudging(0, -1)}
                        onMouseUp={stopNudging}
                        onMouseLeave={stopNudging}
                        title="Move Up (Tap: 0.5cm / Hold: Smooth)"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </Button>
                      <div />

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-sm transition-all hover:bg-white text-slate-400 active:scale-90 active:bg-blue-50"
                        onMouseDown={() => startNudging(-1, 0)}
                        onMouseUp={stopNudging}
                        onMouseLeave={stopNudging}
                        title="Move Left (Tap: 0.5cm / Hold: Smooth)"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant={settings.legendPosition === 'middle' && settings.legendOffsetX === 0 && settings.legendOffsetY === 0 ? 'default' : 'ghost'}
                        size="icon"
                        className={`h-6 w-6 rounded-sm transition-all ${settings.legendPosition === 'middle' && settings.legendOffsetX === 0 && settings.legendOffsetY === 0 ? 'bg-blue-600 text-white' : 'hover:bg-white text-slate-400 active:scale-90'}`}
                        onClick={() => {
                          onSettingsChange({ ...settings, legendPosition: 'middle', legendOffsetX: 0, legendOffsetY: 0 });
                        }}
                        title="Reset to Center"
                      >
                        <Circle className="w-2 h-2 fill-current opacity-70" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-sm transition-all hover:bg-white text-slate-400 active:scale-90 active:bg-blue-50"
                        onMouseDown={() => startNudging(1, 0)}
                        onMouseUp={stopNudging}
                        onMouseLeave={stopNudging}
                        title="Move Right (Tap: 0.5cm / Hold: Smooth)"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>

                      <div />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-sm transition-all hover:bg-white text-slate-400 active:scale-90 active:bg-blue-50"
                        onMouseDown={() => startNudging(0, 1)}
                        onMouseUp={stopNudging}
                        onMouseLeave={stopNudging}
                        title="Move Down (Tap: 0.5cm / Hold: Smooth)"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                      <div />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors w-full">
                      <div className="flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">Axis Titles</span>
                      </div>
                      <Switch checked={settings.showAxisTitles} onCheckedChange={(val: boolean) => updateSetting('showAxisTitles', val)} />
                    </div>

                    <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg w-full">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Legend Style</span>
                      <div className="flex gap-1">
                        <Button
                          variant={settings.legendLayout === 'horizontal' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-5 text-[9px] px-2 font-bold"
                          onClick={() => updateSetting('legendLayout', 'horizontal')}
                        >HORIZ</Button>
                        <Button
                          variant={settings.legendLayout === 'vertical' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-5 text-[9px] px-2 font-bold"
                          onClick={() => updateSetting('legendLayout', 'vertical')}
                        >VERT</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between h-full space-y-3 col-span-2 md:col-span-1">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Axis Labels</Label>
                <div className="grid gap-2">
                   <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] font-black text-blue-500 w-4">X</span>
                      <Input
                        value={settings.xAxisTitle}
                        onChange={(e) => updateSetting('xAxisTitle', e.target.value)}
                        disabled={!settings.showAxisTitles}
                        placeholder="X-Axis Title"
                        className="h-7 text-[11px] font-bold border-none shadow-none focus-visible:ring-0 p-0"
                      />
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] font-black text-green-500 w-4">Y</span>
                      <Input
                        value={settings.yAxisTitle}
                        onChange={(e) => updateSetting('yAxisTitle', e.target.value)}
                        disabled={!settings.showAxisTitles}
                        placeholder="Y-Axis Title"
                        className="h-7 text-[11px] font-bold border-none shadow-none focus-visible:ring-0 p-0"
                      />
                   </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* STYLE TAB */}
          <TabsContent value="style" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between underline decoration-slate-200 underline-offset-4">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Palette</Label>
                  <Palette className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['academic', 'grayscale', 'vibrant', 'default'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateSetting('colorPalette', p)}
                      className={`p-2 rounded-xl border text-left transition-all ${settings.colorPalette === p ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className="text-[9px] font-black uppercase mb-1.5 text-slate-400 tracking-tighter">{p}</div>
                      <div className="flex gap-0.5">
                        {paletteColors[p].slice(0, 4).map((c, i) => (
                          <div key={i} className="w-full h-1.5 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-l border-slate-100 pl-8">
                <div className="flex items-center justify-between underline decoration-slate-200 underline-offset-4">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Theme</Label>
                  <Brush className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['white', 'slate', 'dark', 'glass'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSetting('backgroundTheme', t)}
                      className={`p-2 rounded-xl border text-left transition-all ${settings.backgroundTheme === t ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className="text-[9px] font-black uppercase mb-1.5 text-slate-400 tracking-tighter">{t}</div>
                      <div className="w-full h-3 rounded border border-slate-100" style={{
                        backgroundColor: t === 'white' ? '#fff' : t === 'slate' ? '#f8fafc' : t === 'dark' ? '#0f172a' : 'rgba(255,255,255,0.7)'
                      }} />
                    </button>
                  ))}
                </div>
                <div className="pt-4 space-y-4 border-t border-slate-50">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>FILL OPACITY</span>
                      <span>{Math.round(settings.barOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1" max="1" step="0.1"
                      value={settings.barOpacity}
                      onChange={(e) => updateSetting('barOpacity', parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-l border-slate-100 pl-8">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Line & Border</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">Stroke Weight</span>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md p-1">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => updateSetting('borderWidth', Math.max(0.5, settings.borderWidth - 0.5))}>-</Button>
                      <span className="text-xs font-black min-w-[20px] text-center">{settings.borderWidth}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => updateSetting('borderWidth', Math.min(4, settings.borderWidth + 0.5))}>+</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">Precision</span>
                    <Select value={settings.resultsDecimalPlaces.toString()} onValueChange={(val) => updateSetting('resultsDecimalPlaces', parseInt(val))}>
                      <SelectTrigger className="h-8 text-xs font-bold w-20 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">.1</SelectItem>
                        <SelectItem value="2">.01</SelectItem>
                        <SelectItem value="3">.001</SelectItem>
                        <SelectItem value="4">.0001</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* LAYOUT TAB */}
          <TabsContent value="layout" className="mt-0 space-y-4">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-[20%] space-y-4">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Typography</Label>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">Base Font</span>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md p-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => updateSetting('fontSize', Math.max(8, settings.fontSize - 1))}>-</Button>
                    <span className="text-xs font-black min-w-[20px] text-center">{settings.fontSize}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => updateSetting('fontSize', Math.min(20, settings.fontSize + 1))}>+</Button>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[20%] space-y-4 border-l border-slate-100 pl-8">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Markers</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">Type</span>
                    <Select value={settings.markerType} onValueChange={(val: any) => updateSetting('markerType', val)}>
                      <SelectTrigger className="h-8 text-xs font-bold w-24 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="triangle">Triangle</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">Size</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateSetting('markerSize', Math.max(1, settings.markerSize - 1))}>-</Button>
                      <span className="text-[10px] font-black text-slate-700">{settings.markerSize}px</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateSetting('markerSize', Math.min(10, settings.markerSize + 1))}>+</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[20%] space-y-4 border-l border-slate-100 pl-8">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Placement Ofts</Label>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>X-AXIS</span>
                      <span>{settings.xAxisOffset}px</span>
                    </div>
                    <input
                      type="range"
                      min="-50" max="50" step="1"
                      value={settings.xAxisOffset}
                      onChange={(e) => updateSetting('xAxisOffset', parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>Y-AXIS</span>
                      <span>{settings.yAxisOffset}px</span>
                    </div>
                    <input
                      type="range"
                      min="-50" max="50" step="1"
                      value={settings.yAxisOffset}
                      onChange={(e) => updateSetting('yAxisOffset', parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[40%] space-y-4 border-l border-slate-100 pl-8">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scientific Layout</Label>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>TOP</span>
                      <span>{settings.marginTop}px</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="150" step="5"
                      value={settings.marginTop}
                      onChange={(e) => updateSetting('marginTop', parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>BOTTOM</span>
                      <span>{settings.marginBottom}px</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="150" step="5"
                      value={settings.marginBottom}
                      onChange={(e) => updateSetting('marginBottom', parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>LEFT</span>
                      <span>{settings.marginLeft}px</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="150" step="5"
                      value={settings.marginLeft}
                      onChange={(e) => updateSetting('marginLeft', parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>RIGHT</span>
                      <span>{settings.marginRight}px</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="150" step="5"
                      value={settings.marginRight}
                      onChange={(e) => updateSetting('marginRight', parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MousePointer2 className="w-3 h-3 text-slate-400" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic tracking-tighter">Live Preview Sync Enabled</span>
        </div>
        <div className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
          Palette: <span className="text-blue-600 font-black">{settings.colorPalette}</span>
        </div>
      </div>
    </div>
  );
};
