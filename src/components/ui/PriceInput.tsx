import { Input } from "@/components/ui/input";
import React from "react";

interface PriceInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  readOnly?: boolean;
}

const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  readOnly,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/[^\d]/g, "");
    onChange(numeric === "" ? null : Number(numeric));
  };

  return (
    <div className="flex items-center">
      <span className="mr-1 text-gray-600">Rp</span>
      <Input
        readOnly={readOnly}
        type="text"
        value={
          value === null || value === 0 ? "" : value.toLocaleString("id-ID")
        }
        className={readOnly ? "bg-muted" : ""}
        onChange={handleChange}
        placeholder="0"
      />
    </div>
  );
};

export default PriceInput;
