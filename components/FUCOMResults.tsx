"use client";

import React from "react";
import { FUCOMResult, Criterion } from "@/types/mcdm";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResearchAssetHeader } from "./ResearchAssetHeader";

interface FUCOMResultsProps {
  fucomResult: FUCOMResult;
  criteria: Criterion[];
  weightsDecimalPlaces: number;
  selectedAiAssets: Set<string>;
  handleIncludeChange: (key: string, included: boolean) => void;
  handleAssetLabelChange: (key: string, label: string) => void;
  getWeightTableLabel: () => string;
}

export default function FUCOMResults({
  fucomResult,
  criteria,
  weightsDecimalPlaces,
  selectedAiAssets,
  handleIncludeChange,
  handleAssetLabelChange,
  getWeightTableLabel,
}: FUCOMResultsProps) {
  if (!fucomResult) return null;

  return (
    <div className="space-y-6">
      {/* Table 1: Ranked Criteria */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fucom_ranked_criteria"
            defaultLabel={getWeightTableLabel()}
            title="RANKING OF CRITERIA (STEP 1)"
            included={selectedAiAssets.has("fucom_ranked_criteria")}
            onIncludeChange={handleIncludeChange}
            onLabelChange={handleAssetLabelChange}
          />
        </div>
        <CardContent className="pt-3">
          <div className="table-responsive border border-gray-200 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-xs font-semibold text-black py-3 px-4">Rank</TableHead>
                  <TableHead className="text-xs font-semibold text-black py-3 px-4">Criterion Name</TableHead>
                  <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fucomResult.rankedCriteria.map((id, index) => {
                  const crit = criteria.find(c => c.id === id);
                  return (
                    <TableRow key={id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell className="py-3 px-4 text-xs font-medium text-blue-600">{index + 1}</TableCell>
                      <TableCell className="py-3 px-4 text-xs font-medium text-black">{crit?.name || id}</TableCell>
                      <TableCell className="py-3 px-4 text-xs text-center text-gray-500">{id}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table 2: Comparative Priorities */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fucom_comparative_priorities"
            defaultLabel={getWeightTableLabel()}
            title="COMPARATIVE PRIORITY (PHI K/K+1)"
            included={selectedAiAssets.has("fucom_comparative_priorities")}
            onIncludeChange={handleIncludeChange}
            onLabelChange={handleAssetLabelChange}
          />
        </div>
        <CardContent className="pt-3">
          <div className="table-responsive border border-gray-200 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-xs font-semibold text-black py-3 px-4">Comparison</TableHead>
                  <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Value (φ)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(fucomResult.comparativePriorities).map(([pair, value]) => (
                  <TableRow key={pair} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="py-3 px-4 text-xs font-medium text-black">{pair}</TableCell>
                    <TableCell className="py-3 px-4 text-xs text-center font-bold text-indigo-600">
                      {value.toFixed(weightsDecimalPlaces)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table 3: Final Weights */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="fucom_final_weights"
            defaultLabel={getWeightTableLabel()}
            title="FINAL CRITERIA WEIGHTS (WJ)"
            included={selectedAiAssets.has("fucom_final_weights")}
            onIncludeChange={handleIncludeChange}
            onLabelChange={handleAssetLabelChange}
          />
        </div>
        <CardContent className="pt-3">
          <div className="table-responsive border border-gray-200 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-xs font-semibold text-black py-3 px-4">Criterion</TableHead>
                  <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteria.map((crit) => (
                  <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="py-3 px-4 text-xs font-medium text-black">{crit.name}</TableCell>
                    <TableCell className="py-3 px-4 text-xs text-center font-bold text-green-600">
                      {(fucomResult.weights[crit.id] || 0).toFixed(weightsDecimalPlaces)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50/50 border-t-2 border-gray-200">
                  <TableCell className="py-3 px-4 text-xs font-bold text-black">Total</TableCell>
                  <TableCell className="py-3 px-4 text-xs text-center font-bold text-black">
                    {Object.values(fucomResult.weights).reduce((a, b) => a + b, 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
