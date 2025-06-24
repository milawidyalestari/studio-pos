import React from 'react';
import { Button } from '@/components/ui/button';

interface OrderActionButtonsProps {
  onNew: () => void;
  onSave: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  children?: React.ReactNode;
}

const OrderActionButtons = ({ onNew, onSave, onSubmit, isSaving, hasUnsavedChanges, children }: OrderActionButtonsProps) => {
  return (
    <div className="border-t px-6 py-4 bg-white flex-shrink-0">
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onNew}>New</Button>
          <Button 
            type="button" 
            onClick={onSave}
            disabled={isSaving}
            className={hasUnsavedChanges ? "bg-[#0050C8] hover:bg-[#003a9b] text-white" : ""}
            variant={hasUnsavedChanges ? "default" : "outline"}
          >
            {isSaving ? "Saving..." : "Save Order"}
          </Button>
          <Button type="button" className="bg-[#0050C8] hover:bg-[#003a9b]">Print SPK</Button>
        </div>
        <div className="flex items-center gap-2">
          {children}
          <Button type="submit" className="bg-[#0050C8] hover:bg-[#003a9b]" onClick={onSubmit}>Print Receipt</Button>
        </div>
      </div>
    </div>
  );
};

export default OrderActionButtons;
