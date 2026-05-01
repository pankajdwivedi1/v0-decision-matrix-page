"use client";

import React from "react";
import { Criterion, Alternative, FuzzyNumber } from "@/types/mcdm";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResearchAssetHeader } from "./ResearchAssetHeader";

export interface FuzzyVIKORResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  fpis: Record<string, FuzzyNumber>
  fnis: Record<string, FuzzyNumber>
  sValues: Record<string, number>
  rValues: Record<string, number>
  qValues: Record<string, number>
}

interface FuzzyVIKORResultsProps {
  fuzzyResult: FuzzyVIKORResult;
  criteria: Criterion[];
  alternatives: Alternative[];
  resultsDecimalPlaces: number;
  selectedAiAssets: Set<string>;
  handleIncludeChange: (key: string, included: boolean) => void;
  handleAssetLabelChange: (key: string, label: string) => void;
}

export default function FuzzyVIKORResults({
  fuzzyResult,
  criteria,
  alternatives,
  resultsDecimalPlaces,
  selectedAiAssets,
  handleIncludeChange,
  handleAssetLabelChange,
}: FuzzyVIKORResultsProps) {
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
            assetKey="fuzzy_vikor_normalized_matrix"
            defaultLabel="Table R4"
            title="FUZZY NORMALIZED DECISION MATRIX"
            included={selectedAiAssets.has("fuzzy_vikor_normalized_matrix")}
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
            assetKey="fuzzy_vikor_weighted_matrix"
            defaultLabel="Table R5"
            title="FUZZY WEIGHTED NORMALIZED MATRIX"
            included={selectedAiAssets.has("fuzzy_vikor_weighted_matrix")}
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

      {/* Table R6: Fuzzy Ideal Solutions */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fuzzy_vikor_ideals"
            defaultLabel="Table R6"
            title="FUZZY POSITIVE AND NEGATIVE IDEAL SOLUTIONS (FPIS & FNIS)"
            included={selectedAiAssets.has("fuzzy_vikor_ideals")}
            onIncludeChange={handleIncludeChange}
            onLabelChange={handleAssetLabelChange}
          />
        </div>
        <CardContent className="pt-3">
          <div className="table-responsive border border-gray-200 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-xs font-semibold text-black py-3 px-4">Ideal Solution</TableHead>
                  {criteria.map((crit) => (
                    <TableHead key={crit.id} className="text-xs font-semibold text-center py-3 px-4">
                      {crit.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-blue-50/30 border-b border-gray-200">
                  <TableCell className="py-3 px-4 text-xs font-bold text-blue-800">FPIS (A*)</TableCell>
                  {criteria.map((crit) => (
                    <TableCell key={crit.id} className="text-center py-3 px-4 text-xs font-medium text-blue-700">
                      {formatFuzzy(fuzzyResult.fpis[crit.id])}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="bg-red-50/30 border-b border-gray-200">
                  <TableCell className="py-3 px-4 text-xs font-bold text-red-800">FNIS (A-)</TableCell>
                  {criteria.map((crit) => (
                    <TableCell key={crit.id} className="text-center py-3 px-4 text-xs font-medium text-red-700">
                      {formatFuzzy(fuzzyResult.fnis[crit.id])}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table R7: VIKOR Values (S, R, Q) */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fuzzy_vikor_values"
            defaultLabel="Table R7"
            title="VIKOR VALUES (S, R, Q)"
            included={selectedAiAssets.has("fuzzy_vikor_values")}
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
                  <TableHead className="text-xs font-semibold text-center py-3 px-4">S Value</TableHead>
                  <TableHead className="text-xs font-semibold text-center py-3 px-4">R Value</TableHead>
                  <TableHead className="text-xs font-semibold text-center py-3 px-4">Q Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alternatives.map((alt) => (
                  <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="py-3 px-4 text-xs font-medium text-black">{alt.name}</TableCell>
                    <TableCell className="text-center py-3 px-4 text-xs text-black">
                      {fuzzyResult.sValues[alt.id]?.toFixed(resultsDecimalPlaces + 4)}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4 text-xs text-black">
                      {fuzzyResult.rValues[alt.id]?.toFixed(resultsDecimalPlaces + 4)}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4 text-xs font-bold text-blue-700">
                      {fuzzyResult.qValues[alt.id]?.toFixed(resultsDecimalPlaces + 4)}
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
