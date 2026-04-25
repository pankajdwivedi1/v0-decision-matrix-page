"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { Activity, BarChart2 } from 'lucide-react';

interface Alternative {
  id: string;
  name: string;
  scores: Record<string, number | "">;
}

interface Criterion {
  id: string;
  name: string;
}

interface DataProfilingDashboardProps {
  alternatives: Alternative[];
  criteria: Criterion[];
}

// Helper to generate histogram bins
const generateHistogramData = (data: number[], bins: number = 10) => {
  if (!data.length) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const binSize = range === 0 ? 1 : range / bins;
  
  const binCounts = new Array(bins).fill(0);
  data.forEach(val => {
    let binIndex = Math.floor((val - min) / binSize);
    if (binIndex >= bins) binIndex = bins - 1; // handle max value
    binCounts[binIndex]++;
  });

  return binCounts.map((count, i) => ({
    binStart: min + i * binSize,
    binEnd: min + (i + 1) * binSize,
    rangeLabel: `${(min + i * binSize).toFixed(1)} - ${(min + (i + 1) * binSize).toFixed(1)}`,
    count
  }));
};

export function DataProfilingDashboard({ alternatives, criteria }: DataProfilingDashboardProps) {
  if (!alternatives || !criteria || alternatives.length === 0 || criteria.length === 0) {
    return null;
  }

  // Focus on top 3 criteria for the pair plot to avoid overcrowding
  const criteriaToPlot = criteria.slice(0, 3);

  return (
    <Card className="border-gray-200 bg-white shadow-sm w-full mb-6">
      <CardHeader className="pb-3 border-b border-gray-100 bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <Activity className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <CardTitle className="text-sm text-black font-semibold">Exploratory Data Analysis (EDA) Profiling</CardTitle>
            <CardDescription className="text-xs text-gray-600 mt-0.5">
              Input data distributions and correlations across top criteria (Histograms & Pair Plots)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 bg-white">
        <div 
          className="grid gap-2" 
          style={{ 
            gridTemplateColumns: `repeat(${criteriaToPlot.length}, minmax(0, 1fr))` 
          }}
        >
          {criteriaToPlot.map((rowCrit, rowIndex) => (
            criteriaToPlot.map((colCrit, colIndex) => {
              const isDiagonal = rowIndex === colIndex;
              const key = `${rowCrit.id}-${colCrit.id}`;

              if (isDiagonal) {
                // Histogram Data
                const validScores = alternatives
                  .map(a => Number(a.scores[rowCrit.id]))
                  .filter(v => !isNaN(v));
                const histData = generateHistogramData(validScores, 8);

                return (
                  <div key={key} className="border border-gray-200 rounded-md p-2 flex flex-col h-48 bg-slate-50 shadow-sm transition-all hover:border-blue-300">
                    <div className="text-[10px] font-semibold text-center mb-1 text-slate-700 truncate">
                      {rowCrit.name} Distribution
                    </div>
                    <div className="flex-1 w-full h-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="rangeLabel" hide />
                          <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ fontSize: '10px', borderRadius: '6px', padding: '4px 8px' }}
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                          />
                          <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              } else {
                // Scatter Plot Data
                const scatterData = alternatives
                  .map(a => ({
                    x: Number(a.scores[colCrit.id]),
                    y: Number(a.scores[rowCrit.id]),
                    name: a.name
                  }))
                  .filter(d => !isNaN(d.x) && !isNaN(d.y));

                return (
                  <div key={key} className="border border-gray-100 rounded-md p-2 flex flex-col h-48 bg-white transition-all hover:shadow-md hover:border-blue-200">
                    <div className="text-[9px] font-medium text-center mb-1 text-slate-500 truncate">
                      {rowCrit.name} vs {colCrit.name}
                    </div>
                    <div className="flex-1 w-full h-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis type="number" dataKey="x" name={colCrit.name} tick={{ fontSize: 8 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                          <YAxis type="number" dataKey="y" name={rowCrit.name} tick={{ fontSize: 8 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                          <ZAxis type="category" dataKey="name" name="Alternative" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontSize: '10px', borderRadius: '6px' }} />
                          <Scatter data={scatterData} fill="#64748b" shape="circle" line={false}>
                            {scatterData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill="#8b5cf6" fillOpacity={0.7} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              }
            })
          ))}
        </div>
        <div className="mt-3 text-[10px] text-gray-500 flex items-center justify-center gap-2 bg-blue-50/50 py-1.5 rounded-md">
          <BarChart2 className="w-3 h-3 text-blue-500" />
          <span>Use this EDA grid to check for data skewness and criterion correlations before objective weighting (e.g., CRITIC, Entropy).</span>
        </div>
      </CardContent>
    </Card>
  );
}
