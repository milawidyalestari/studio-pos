
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddColumnButtonProps {
  onClick: () => void;
}

const AddColumnButton = ({ onClick }: AddColumnButtonProps) => {
  return (
    <div className="flex-shrink-0 w-80">
      <Button
        variant="outline"
        className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
        onClick={onClick}
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Status
      </Button>
    </div>
  );
};

export default AddColumnButton;
