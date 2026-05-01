"use client";

import React from "react";
import { Criterion, Alternative, FuzzyNumber } from "@/types/mcdm";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResearchAssetHeader } from "./ResearchAssetHeader";

export interface FuzzyMARCOSResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  utilityDegrees: Record<string, number>
}

interface FuzzyMARCOSResultsProps {
  fuzzyResult: FuzzyMARCOSResult;
  criteria: Criterion[];
  alternatives: Alternative[];
  resultsDecimalPlaces: number;
  selectedAiAssets: Set<string>;
  handleIncludeChange: (key: string, included: boolean) => void;
  handleAssetLabelChange: (key: string, label: string) => void;
}

export default function FuzzyMARCOSResults({
  fuzzyResult,
  criteria,
  alternatives,
  resultsDecimalPlaces,
  selectedAiAssets,
  handleIncludeChange,
  handleAssetLabelChange,
}: FuzzyMARCOSResultsProps) {
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
            assetKey="fuzzy_marcos_normalized_matrix"
            defaultLabel="Table R4"
            title="FUZZY NORMALIZED DECISION MATRIX"
            included={selectedAiAssets.has("fuzzy_marcos_normalized_matrix")}
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

      {/* Table R5: Utility parameters */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fuzzy_marcos_utility"
            defaultLabel="Table R5"
            title="MARCOS UTILITY DEGREES LOGS"
            included={selectedAiAssets.has("fuzzy_marcos_utility")}
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
                  <TableHead className="text-xs font-semibold text-center py-3 px-4 text-black bg-blue-50/10">Utility Function f(K)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alternatives.map((alt) => (
                  <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="py-3 px-4 text-xs font-medium text-black">{alt.name}</TableCell>
                    <TableCell className="text-center py-3 px-4 text-xs font-bold text-blue-700 bg-blue-50/20">
                      {fuzzyResult.utilityDegrees[alt.id]?.toFixed(resultsDecimalPlaces + 4)}
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
