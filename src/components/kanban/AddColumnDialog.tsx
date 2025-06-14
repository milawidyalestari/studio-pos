
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AddColumnDialogProps {
  open: boolean;
  newColumnTitle: string;
  onOpenChange: (open: boolean) => void;
  onTitleChange: (title: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}

const AddColumnDialog = ({
  open,
  newColumnTitle,
  onOpenChange,
  onTitleChange,
  onAdd,
  onCancel
}: AddColumnDialogProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAdd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter status name..."
            value={newColumnTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onAdd} disabled={!newColumnTitle.trim()}>
              Add Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddColumnDialog;
