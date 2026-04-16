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
  Monitor
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

  return (
    <div className="w-full bg-[#f8fafc] border-x border-b border-gray-200 animate-in fade-in slide-in-from-top-2 duration-500 shadow-sm overflow-hidden rounded-b-xl">
      <Tabs defaultValue="style" className="w-full">
        <div className="flex items-center justify-between px-4 bg-white border-b border-gray-100">
          <TabsList className="bg-transparent h-12 gap-6">
            <TabsTrigger value="elements" className="data-[state=active]:bg-blue-100/50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none data-[state=active]:border-b-[3px] data-[state=active]:border-blue-600 rounded-none h-12 text-[11px] font-black tracking-tight gap-2 transition-all">
              <Box className="w-4 h-4" /> CHART ELEMENTS
            </TabsTrigger>
            <TabsTrigger value="style" className="data-[state=active]:bg-blue-100/50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none data-[state=active]:border-b-[3px] data-[state=active]:border-blue-600 rounded-none h-12 text-[11px] font-black tracking-tight gap-2 transition-all">
              <Brush className="w-4 h-4" /> STYLE & COLOR
            </TabsTrigger>
            <TabsTrigger value="layout" className="data-[state=active]:bg-blue-100/50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none data-[state=active]:border-b-[3px] data-[state=active]:border-blue-600 rounded-none h-12 text-[11px] font-black tracking-tight gap-2 transition-all">
              <Layout className="w-4 h-4" /> AXIS & LAYOUT
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              <Settings className="w-3 h-3 animate-spin-slow" />
              <span className="text-[10px] font-black uppercase tracking-wider">Editor Active</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {/* ELEMENTS TAB */}
          <TabsContent value="elements" className="mt-0 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility</Label>
                <div className="grid gap-2">
                  <div className="flex flex-col gap-2 p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">Grid Lines</span>
                      </div>
                      <Switch checked={settings.showGridLines} onCheckedChange={(val: boolean) => updateSetting('showGridLines', val)} />
                    </div>
                    {settings.showGridLines && (
                      <div className="pt-2 border-t border-slate-50 flex gap-1">
                        <Button
                          variant={settings.gridLinesMode === 'horizontal' ? 'default' : 'outline'}
                          size="sm"
                          className="h-6 text-[9px] flex-1 px-1"
                          onClick={() => updateSetting('gridLinesMode', 'horizontal')}
                        >HORZ</Button>
                        <Button
                          variant={settings.gridLinesMode === 'vertical' ? 'default' : 'outline'}
                          size="sm"
                          className="h-6 text-[9px] flex-1 px-1"
                          onClick={() => updateSetting('gridLinesMode', 'vertical')}
                        >VERT</Button>
                        <Button
                          variant={settings.gridLinesMode === 'both' ? 'default' : 'outline'}
                          size="sm"
                          className="h-6 text-[9px] flex-1 px-1"
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

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Titles & Legend</Label>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <Type className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">Axis Titles</span>
                    </div>
                    <Switch checked={settings.showAxisTitles} onCheckedChange={(val: boolean) => updateSetting('showAxisTitles', val)} />
                  </div>
                  <Select value={settings.legendPosition} onValueChange={(val: any) => updateSetting('legendPosition', val)}>
                    <SelectTrigger className="h-9 text-xs font-bold bg-white">
                      <div className="flex items-center gap-2 text-slate-700 uppercase">
                        <Monitor className="w-3.5 h-3.5" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top Header</SelectItem>
                      <SelectItem value="middle">Overlay UI</SelectItem>
                      <SelectItem value="bottom">Bottom Footer</SelectItem>
                      <SelectItem value="left">Left Sidebar</SelectItem>
                      <SelectItem value="right">Right Sidebar</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Legend Style</span>
                    <div className="flex gap-1">
                      <Button
                        variant={settings.legendLayout === 'horizontal' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-6 text-[9px]"
                        onClick={() => updateSetting('legendLayout', 'horizontal')}
                      >HORIZ</Button>
                      <Button
                        variant={settings.legendLayout === 'vertical' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-6 text-[9px]"
                        onClick={() => updateSetting('legendLayout', 'vertical')}
                      >VERT</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 col-span-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Axis Label Editor</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 uppercase">X</span>
                    <Input
                      value={settings.xAxisTitle}
                      onChange={(e) => updateSetting('xAxisTitle', e.target.value)}
                      disabled={!settings.showAxisTitles}
                      placeholder="X-Axis Title"
                      className="pl-7 h-9 text-xs font-bold"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-green-500 uppercase">Y</span>
                    <Input
                      value={settings.yAxisTitle}
                      onChange={(e) => updateSetting('yAxisTitle', e.target.value)}
                      disabled={!settings.showAxisTitles}
                      placeholder="Y-Axis Title"
                      className="pl-7 h-9 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* STYLE TAB */}
          <TabsContent value="style" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
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
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Theme</Label>
                  <Brush className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">Background</span>
                    <Select value={settings.backgroundTheme} onValueChange={(val: any) => updateSetting('backgroundTheme', val)}>
                      <SelectTrigger className="h-8 text-xs font-bold w-32 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white">Pristine White</SelectItem>
                        <SelectItem value="slate">Light Slate</SelectItem>
                        <SelectItem value="dark">Journal Dark</SelectItem>
                        <SelectItem value="glass">Soft Glass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">Grid Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.gridColor}
                        onChange={(e) => updateSetting('gridColor', e.target.value)}
                        className="w-6 h-6 rounded-md cursor-pointer border-none p-0"
                      />
                      <span className="text-[10px] font-mono text-slate-400">{settings.gridColor.toUpperCase()}</span>
                    </div>
                  </div>
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
          <TabsContent value="layout" className="mt-0 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-4">
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

              <div className="space-y-4 border-l border-slate-100 pl-8">
                <div className="space-y-4 pb-4">
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

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Label Placement</Label>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-400">
                        <span>X-AXIS (Y)</span>
                        <span>{settings.xAxisOffset}px</span>
                      </div>
                      <input
                        type="range"
                        min="-100" max="0" step="1"
                        value={settings.xAxisOffset}
                        onChange={(e) => updateSetting('xAxisOffset', parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-400">
                        <span>Y-AXIS (X)</span>
                        <span>{settings.yAxisOffset}px</span>
                      </div>
                      <input
                        type="range"
                        min="-100" max="100" step="1"
                        value={settings.yAxisOffset}
                        onChange={(e) => updateSetting('yAxisOffset', parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-l border-slate-100 pl-8 col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scientific Layout</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[9px] text-blue-600 font-black"
                    onClick={() => {
                      onSettingsChange({
                        ...settings,
                        marginTop: 40,
                        marginRight: 30,
                        marginBottom: 38,
                        marginLeft: 30,
                        showMirrorTicks: true,
                        xAxisOffset: -25,
                        yAxisOffset: 0
                      });
                    }}
                  >RESET TO 30/40/38</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-400">
                        <span className="flex items-center gap-1.5">TOP <Maximize2 className="w-2.5 h-2.5 rotate-90" /></span>
                        <span>{settings.marginTop}px</span>
                      </div>
                      <input
                        type="range"
                        min="0" max="100" step="1"
                        value={settings.marginTop}
                        onChange={(e) => updateSetting('marginTop', parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-400">
                        <span className="flex items-center gap-1.5">BOTTOM <Maximize2 className="w-2.5 h-2.5 rotate-90" /></span>
                        <span>{settings.marginBottom}px</span>
                      </div>
                      <input
                        type="range"
                        min="0" max="100" step="1"
                        value={settings.marginBottom}
                        onChange={(e) => updateSetting('marginBottom', parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-400">
                        <span className="flex items-center gap-1.5">LEFT <Maximize2 className="w-2.5 h-2.5" /></span>
                        <span>{settings.marginLeft}px</span>
                      </div>
                      <input
                        type="range"
                        min="0" max="100" step="1"
                        value={settings.marginLeft}
                        onChange={(e) => updateSetting('marginLeft', parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-400">
                        <span className="flex items-center gap-1.5">RIGHT <Maximize2 className="w-2.5 h-2.5" /></span>
                        <span>{settings.marginRight}px</span>
                      </div>
                      <input
                        type="range"
                        min="0" max="100" step="1"
                        value={settings.marginRight}
                        onChange={(e) => updateSetting('marginRight', parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => updateSetting('showMirrorTicks', !settings.showMirrorTicks)}
                className={`h-10 flex-1 flex items-center justify-center gap-2 border-2 transition-all ${settings.showMirrorTicks ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
              >
                <AlignJustify className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Mirrored Ticks</span>
              </Button>
              <Button
                variant="outline"
                className="h-10 flex-1 flex items-center justify-center gap-2 border-2 border-slate-100 text-slate-400"
                onClick={() => {
                  onSettingsChange({
                    ...settings,
                    colorPalette: 'academic',
                    borderWidth: 1.5,
                    fontSize: 10,
                    showGridLines: false,
                    showMirrorTicks: true,
                    markerType: 'circle',
                    markerSize: 4,
                    backgroundTheme: 'white',
                    marginTop: 40,
                    marginRight: 30,
                    marginBottom: 38,
                    marginLeft: 30,
                    xAxisOffset: -25,
                    yAxisOffset: 0
                  });
                }}
              >
                <BarChart2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Auto Journal Std</span>
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MousePointer2 className="w-3 h-3 text-slate-400" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Live Preview Sync Enabled</span>
        </div>
        <div className="text-[9px] font-medium text-slate-400 uppercase">
          Active Palette: <span className="text-blue-600 font-bold">{settings.colorPalette}</span>
        </div>
      </div>
    </div>
  );
};
