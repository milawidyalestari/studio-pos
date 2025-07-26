import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  posisiFilter: string;
  onPosisiFilterChange: (value: string) => void;
  posisiOptions: string[];
  hideFilterButton?: boolean;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ 
  searchTerm, 
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  posisiFilter,
  onPosisiFilterChange,
  posisiOptions = [],
  hideFilterButton = false
}) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input 
        placeholder="Cari karyawan..." 
        className="pl-10"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    {!hideFilterButton && (
      <Button variant="outline" className="gap-2">
        <Filter className="h-4 w-4" />
        Filter
      </Button>
    )}
    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Status</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
    <Select value={posisiFilter} onValueChange={onPosisiFilterChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Posisi" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Posisi</SelectItem>
        {posisiOptions.map((pos) => (
          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
