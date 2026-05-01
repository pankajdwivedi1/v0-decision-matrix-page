"use client";

import React from "react";
import { Criterion, Alternative, FuzzyNumber } from "@/types/mcdm";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResearchAssetHeader } from "./ResearchAssetHeader";

export interface FuzzyWASPASResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  wsmScores: Record<string, FuzzyNumber>
  wpmScores: Record<string, FuzzyNumber>
  combinedScores: Record<string, FuzzyNumber>
}

interface FuzzyWASPASResultsProps {
  fuzzyResult: FuzzyWASPASResult;
  criteria: Criterion[];
  alternatives: Alternative[];
  resultsDecimalPlaces: number;
  selectedAiAssets: Set<string>;
  handleIncludeChange: (key: string, included: boolean) => void;
  handleAssetLabelChange: (key: string, label: string) => void;
}

export default function FuzzyWASPASResults({
  fuzzyResult,
  criteria,
  alternatives,
  resultsDecimalPlaces,
  selectedAiAssets,
  handleIncludeChange,
  handleAssetLabelChange,
}: FuzzyWASPASResultsProps) {
  if (!fuzzyResult) return null;

  const formatFuzzy = (fn: FuzzyNumber) => {
    if (!fn) return "-";
    return `(${fn.l.toFixed(resultsDecimalPlaces)}, ${fn.m.toFixed(resultsDecimalPlaces)}, ${fn.u.toFixed(resultsDecimalPlaces)})`;
  };

  return (
    <div className="space-y-6">
      {/* Table R4: Fuzzy Normalized Decision Matrix */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fuzzy_waspas_normalized_matrix"
            defaultLabel="Table R4"
            title="FUZZY NORMALIZED DECISION MATRIX"
            included={selectedAiAssets.has("fuzzy_waspas_normalized_matrix")}
            onIncludeChange={handleIncludeChange}
            onLabelChange={handleAssetLabelChange}
          />
        </div>
        <CardContent className="pt-3">
          <div className="table-responsive border border-gray-200 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                  {criteria.map((crit) => (
                    <TableHead key={crit.id} className="text-xs font-semibold text-center py-3 px-4">
                      <span className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"}>
                        {crit.name} {crit.type === "beneficial" ? "↑" : "↓"}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {alternatives.map((alt) => (
                  <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="py-3 px-4 text-xs font-medium text-black">{alt.name}</TableCell>
                    {criteria.map((crit) => (
                      <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black">
                        {formatFuzzy(fuzzyResult.fuzzyNormalizedMatrix[alt.id]?.[crit.id])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table R5: Fuzzy Weighted Normalized Decision Matrix */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fuzzy_waspas_weighted_matrix"
            defaultLabel="Table R5"
            title="FUZZY WEIGHTED NORMALIZED MATRIX"
            included={selectedAiAssets.has("fuzzy_waspas_weighted_matrix")}
            onIncludeChange={handleIncludeChange}
            onLabelChange={handleAssetLabelChange}
          />
        </div>
        <CardContent className="pt-3">
          <div className="table-responsive border border-gray-200 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                  {criteria.map((crit) => (
                    <TableHead key={crit.id} className="text-xs font-semibold text-center py-3 px-4">
                      <span className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"}>
                        {crit.name} {crit.type === "beneficial" ? "↑" : "↓"}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {alternatives.map((alt) => (
                  <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="py-3 px-4 text-xs font-medium text-black">{alt.name}</TableCell>
                    {criteria.map((crit) => (
                      <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black">
                        {formatFuzzy(fuzzyResult.fuzzyWeightedMatrix[alt.id]?.[crit.id])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table R6: WASPAS Sum/Product Aggregations */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fuzzy_waspas_metrics"
            defaultLabel="Table R6"
            title="WASPAS PERFORMANCE SCORES (WSM, WPM, COMBINED)"
            included={selectedAiAssets.has("fuzzy_waspas_metrics")}
            onIncludeChange={handleIncludeChange}
            onLabelChange={handleAssetLabelChange}
          />
        </div>
        <CardContent className="pt-3">
          <div className="table-responsive border border-gray-200 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                  <TableHead className="text-xs font-semibold text-center py-3 px-4">WSM Score</TableHead>
                  <TableHead className="text-xs font-semibold text-center py-3 px-4">WPM Score</TableHead>
                  <TableHead className="text-xs font-semibold text-center py-3 px-4">Utility (Q)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alternatives.map((alt) => (
                  <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="py-3 px-4 text-xs font-medium text-black">{alt.name}</TableCell>
                    <TableCell className="text-center py-3 px-4 text-xs text-black">
                      {formatFuzzy(fuzzyResult.wsmScores[alt.id])}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4 text-xs text-black">
                      {formatFuzzy(fuzzyResult.wpmScores[alt.id])}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4 text-xs font-bold text-blue-700 bg-blue-50/10">
                      {formatFuzzy(fuzzyResult.combinedScores[alt.id])}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
