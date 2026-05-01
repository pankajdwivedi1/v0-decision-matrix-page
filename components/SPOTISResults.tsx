"use client";

import React from "react";
import { SPOTISResult, Criterion, Alternative } from "@/types/mcdm";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResearchAssetHeader } from "./ResearchAssetHeader";

interface SPOTISResultsProps {
  spotisResult: SPOTISResult;
  criteria: Criterion[];
  alternatives: Alternative[];
  resultsDecimalPlaces: number;
  selectedAiAssets: Set<string>;
  handleIncludeChange: (key: string, included: boolean) => void;
  handleAssetLabelChange: (key: string, label: string) => void;
  boundsLabel: string;
  distanceLabel: string;
}

export default function SPOTISResults({
  spotisResult,
  criteria,
  alternatives,
  resultsDecimalPlaces,
  selectedAiAssets,
  handleIncludeChange,
  handleAssetLabelChange,
  boundsLabel,
  distanceLabel,
}: SPOTISResultsProps) {
  if (!spotisResult) return null;

  return (
    <div className="space-y-6">
      {/* Table 1: Bounds and Ideal Solution */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="spotis_bounds"
            defaultLabel={boundsLabel}
            title="CRITERIA BOUNDS AND IDEAL SOLUTION"
            included={selectedAiAssets.has("spotis_bounds")}
            onIncludeChange={handleIncludeChange}
            onLabelChange={handleAssetLabelChange}
          />
        </div>
        <CardContent className="pt-3">
          <div className="table-responsive border border-gray-200 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-xs font-semibold text-black py-3 px-4">Metric</TableHead>
                  {criteria.map((crit) => (
                    <TableHead key={crit.id} className="text-xs font-semibold text-center py-3 px-4">
                      {crit.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="py-3 px-4 text-xs font-bold text-black">Min (S_min)</TableCell>
                  {criteria.map((crit) => (
                    <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black">
                      {spotisResult.bounds[crit.id]?.min.toFixed(resultsDecimalPlaces)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="py-3 px-4 text-xs font-bold text-black">Max (S_max)</TableCell>
                  {criteria.map((crit) => (
                    <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black">
                      {spotisResult.bounds[crit.id]?.max.toFixed(resultsDecimalPlaces)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="bg-blue-50/30 border-b border-gray-200 hover:bg-blue-50/50">
                  <TableCell className="py-3 px-4 text-xs font-bold text-blue-800">Ideal (S_best)</TableCell>
                  {criteria.map((crit) => (
                    <TableCell key={crit.id} className="text-center py-3 px-4 text-xs font-bold text-blue-700">
                      {spotisResult.bounds[crit.id]?.best.toFixed(resultsDecimalPlaces)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table 2: Normalized Distance Matrix */}
      <Card className="border-gray-200 bg-white shadow-none">
        <div className="px-6 pt-4">
          <ResearchAssetHeader
            assetKey="spotis_distance_matrix"
            defaultLabel={distanceLabel}
            title="NORMALIZED DISTANCE MATRIX (DIJ)"
            included={selectedAiAssets.has("spotis_distance_matrix")}
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
                        {spotisResult.distanceMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces)}
                      </TableCell>
                    ))}
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
