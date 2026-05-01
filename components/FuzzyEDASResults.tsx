"use client";

import React from "react";
import { Criterion, Alternative, FuzzyNumber } from "@/types/mcdm";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResearchAssetHeader } from "./ResearchAssetHeader";

export interface FuzzyEDASResult {
  scores: Record<string, number>
  fuzzyAverageSolution: Record<string, FuzzyNumber>
  fuzzyPdaMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyNdaMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzySpValues: Record<string, FuzzyNumber>
  fuzzySnValues: Record<string, FuzzyNumber>
  fuzzyNspValues: Record<string, FuzzyNumber>
  fuzzyNsnValues: Record<string, FuzzyNumber>
  fuzzyAsValues: Record<string, FuzzyNumber>
}

interface FuzzyEDASResultsProps {
  fuzzyResult: FuzzyEDASResult;
  criteria: Criterion[];
  alternatives: Alternative[];
  resultsDecimalPlaces: number;
  selectedAiAssets: Set<string>;
  handleIncludeChange: (key: string, included: boolean) => void;
  handleAssetLabelChange: (key: string, label: string) => void;
}

export default function FuzzyEDASResults({
  fuzzyResult,
  criteria,
  alternatives,
  resultsDecimalPlaces,
  selectedAiAssets,
  handleIncludeChange,
  handleAssetLabelChange,
}: FuzzyEDASResultsProps) {
  if (!fuzzyResult) return null;

  const formatFuzzy = (fn: FuzzyNumber) => {
    if (!fn) return "-";
    return `(${fn.l.toFixed(resultsDecimalPlaces)}, ${fn.m.toFixed(resultsDecimalPlaces)}, ${fn.u.toFixed(resultsDecimalPlaces)})`;
  };

  return (
    <div className="space-y-6">
      {/* Table R4: Fuzzy Average Solution */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fuzzy_edas_average_solution"
            defaultLabel="Table R4"
            title="FUZZY AVERAGE SOLUTION (AV)"
            included={selectedAiAssets.has("fuzzy_edas_average_solution")}
            onIncludeChange={handleIncludeChange}
            onLabelChange={handleAssetLabelChange}
          />
        </div>
        <CardContent className="pt-3">
          <div className="table-responsive border border-gray-200 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-xs font-semibold text-black py-3 px-4">Solution</TableHead>
                  {criteria.map((crit) => (
                    <TableHead key={crit.id} className="text-xs font-semibold text-center py-3 px-4">
                      {crit.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="py-3 px-4 text-xs font-medium text-black">Average (AV)</TableCell>
                  {criteria.map((crit) => (
                    <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                      {formatFuzzy(fuzzyResult.fuzzyAverageSolution[crit.id])}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table R5: Fuzzy PDA */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fuzzy_edas_pda"
            defaultLabel="Table R5"
            title="FUZZY POSITIVE DISTANCE FROM AVERAGE (PDA)"
            included={selectedAiAssets.has("fuzzy_edas_pda")}
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
                      {crit.name}
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
                        {formatFuzzy(fuzzyResult.fuzzyPdaMatrix[alt.id]?.[crit.id])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table R6: Fuzzy NDA */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fuzzy_edas_nda"
            defaultLabel="Table R6"
            title="FUZZY NEGATIVE DISTANCE FROM AVERAGE (NDA)"
            included={selectedAiAssets.has("fuzzy_edas_nda")}
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
                      {crit.name}
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
                        {formatFuzzy(fuzzyResult.fuzzyNdaMatrix[alt.id]?.[crit.id])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table R7: Appraisal Scores */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fuzzy_edas_appraisal"
            defaultLabel="Table R7"
            title="EDAS APPRAISAL SCORE CALCULATIONS"
            included={selectedAiAssets.has("fuzzy_edas_appraisal")}
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
                  <TableHead className="text-xs font-semibold text-center py-3 px-4">Fuzzy SP</TableHead>
                  <TableHead className="text-xs font-semibold text-center py-3 px-4">Fuzzy SN</TableHead>
                  <TableHead className="text-xs font-semibold text-center py-3 px-4">Appraisal (AS)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alternatives.map((alt) => (
                  <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="py-3 px-4 text-xs font-medium text-black">{alt.name}</TableCell>
                    <TableCell className="text-center py-3 px-4 text-xs text-black">
                      {formatFuzzy(fuzzyResult.fuzzySpValues[alt.id])}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4 text-xs text-black">
                      {formatFuzzy(fuzzyResult.fuzzySnValues[alt.id])}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4 text-xs font-bold text-blue-700 bg-blue-50/10">
                      {formatFuzzy(fuzzyResult.fuzzyAsValues[alt.id])}
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
