import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Criterion, Alternative } from "@/types/mcdm";
import { FuzzyTripletInput } from "./FuzzyTripletInput";

interface SharedDecisionMatrixProps {
  alternatives: Alternative[];
  criteria: Criterion[];
  isFuzzyMode: boolean;
  fuzzyScaleType: number;
  customFuzzyScales: any;
  updateAlternativeScore: (altId: string, critId: string, value: string) => void;
  handleKeyDown?: (e: React.KeyboardEvent) => void;
}

export const SharedDecisionMatrix: React.FC<SharedDecisionMatrixProps> = ({
  alternatives,
  criteria,
  isFuzzyMode,
  fuzzyScaleType,
  customFuzzyScales,
  updateAlternativeScore,
  handleKeyDown,
}) => {
  return (
    <div className="table-responsive border border-gray-300 rounded-lg overflow-x-auto">
      <Table className="border-collapse w-full" style={{ width: `${80 + (criteria.length * 90)}px`, minWidth: '100%' }}>
        <TableHeader>
          <TableRow className="bg-[#FFD966] hover:bg-[#FFD966] border-b border-gray-300">
            <TableHead className="bg-white text-black font-bold text-[9px] border-r border-gray-300 p-0 h-8" style={{ width: '80px', minWidth: '80px' }}>
              <div className="flex flex-col items-center justify-center h-full leading-tight">
                <div className="text-[10px] font-bold py-0.5 border-b border-gray-300 w-full text-center flex items-center justify-center gap-1">
                  Criteria <ArrowRight className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div className="text-[10px] font-bold py-0.5 w-full text-center flex items-center justify-center gap-1">
                  Alternatives <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>
            </TableHead>
            {criteria.map((crit) => (
              <TableHead key={crit.id} className="text-black font-bold text-center text-[10px] border-r border-gray-300 px-1 py-0.5" style={{ width: '90px', minWidth: '90px' }}>
                <div className="flex flex-col items-center py-0.5">
                  <div className="flex items-center gap-0.5">
                    <div className={crit.type === "beneficial" ? "text-green-700" : "text-red-700"}>{crit.name}</div>
                    <span className={crit.type === "beneficial" ? "text-green-700" : "text-red-700"} aria-hidden>
                      {crit.type === "beneficial" ? "▲" : "▼"}
                    </span>
                  </div>
                  <div className="text-gray-600 font-semibold text-[9px]">
                    {crit.type === "beneficial" ? "Max" : "Min"}
                  </div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {alternatives.map((alt) => (
            <TableRow key={alt.id} className="border-b border-gray-300 hover:bg-gray-50/50 transition-colors">
              <TableCell className="bg-[#F4B084] text-black font-bold text-[9px] border-r border-gray-300 py-1 px-1.5 text-center">
                {alt.name}
              </TableCell>
              {criteria.map((crit) => (
                <TableCell key={crit.id} className="p-0.5 border-r border-gray-300 text-center">
                  {isFuzzyMode ? (
                    <div className="flex flex-col gap-1 w-full p-1 justify-center items-center">
                      <Select
                        value={typeof alt.scores[crit.id] === 'string' ? alt.scores[crit.id] as string : ""}
                        onValueChange={(value) => updateAlternativeScore(alt.id, crit.id, value)}
                      >
                        <SelectTrigger className="text-[9px] h-5 border-gray-300 bg-white text-black shadow-none w-full font-bold justify-center">
                          <SelectValue placeholder="Scale" />
                        </SelectTrigger>
                        <SelectContent>
                          {customFuzzyScales[fuzzyScaleType]?.map((item: any) => (
                            <SelectItem key={item.value} value={item.value} className="text-[10px]">
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FuzzyTripletInput 
                        value={(() => {
                          const score = alt.scores[crit.id];
                          if (typeof score === 'object' && score !== null && 'l' in score) return score as any;
                          const item = customFuzzyScales[fuzzyScaleType]?.find((s: any) => s.value === score);
                          if (item) return item.triplet;
                          const numValue = typeof score === 'number' ? score : parseFloat(score as string);
                          if (!isNaN(numValue)) {
                            const spread = 10; // Default or get from storage
                            const spreadDecimal = spread / 100;
                            return { l: numValue * (1 - spreadDecimal), m: numValue, u: numValue * (1 + spreadDecimal) };
                          }
                          return { l: 0, m: 0, u: 0 };
                        })()}
                        onChange={(newTriplet) => updateAlternativeScore(alt.id, crit.id, newTriplet)}
                      />
                    </div>
                  ) : (
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={alt.scores[crit.id] ?? ""}
                      onChange={(e) => updateAlternativeScore(alt.id, crit.id, e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="text-center text-[10px] h-7 border-gray-100 text-black w-full shadow-none bg-white rounded-md p-1 focus:ring-1 focus:ring-blue-400"
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
