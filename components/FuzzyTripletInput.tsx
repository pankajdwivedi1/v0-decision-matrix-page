import React from "react";
import { Input } from "@/components/ui/input";
import { FuzzyNumber } from "@/types/mcdm";

interface FuzzyTripletInputProps {
  value: FuzzyNumber;
  onChange: (value: FuzzyNumber) => void;
  resultsDecimalPlaces?: number;
}

export const FuzzyTripletInput: React.FC<FuzzyTripletInputProps> = ({
  value,
  onChange,
  resultsDecimalPlaces = 3,
}) => {
  const handleChange = (field: keyof FuzzyNumber, val: string) => {
    const numValue = parseFloat(val);
    if (!isNaN(numValue)) {
      onChange({ ...value, [field]: numValue });
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full max-w-[120px]">
      <div className="flex items-center gap-0.5 bg-blue-50/50 p-1 rounded border border-blue-200">
        <div className="flex flex-col flex-1">
          <span className="text-[7px] font-bold text-blue-600 uppercase text-center">L</span>
          <Input
            type="number"
            value={value.l}
            onChange={(e) => handleChange("l", e.target.value)}
            className="h-5 px-1 text-[9px] text-center border-none bg-transparent shadow-none font-medium text-blue-800"
          />
        </div>
        <div className="w-[1px] h-4 bg-blue-200 mt-2" />
        <div className="flex flex-col flex-1">
          <span className="text-[7px] font-bold text-blue-600 uppercase text-center">M</span>
          <Input
            type="number"
            value={value.m}
            onChange={(e) => handleChange("m", e.target.value)}
            className="h-5 px-1 text-[9px] text-center border-none bg-transparent shadow-none font-bold text-blue-900"
          />
        </div>
        <div className="w-[1px] h-4 bg-blue-200 mt-2" />
        <div className="flex flex-col flex-1">
          <span className="text-[7px] font-bold text-blue-600 uppercase text-center">U</span>
          <Input
            type="number"
            value={value.u}
            onChange={(e) => handleChange("u", e.target.value)}
            className="h-5 px-1 text-[9px] text-center border-none bg-transparent shadow-none font-medium text-blue-800"
          />
        </div>
      </div>
    </div>
  );
};
