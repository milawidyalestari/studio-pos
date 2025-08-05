import React from 'react';
import { Button } from '@/components/ui/button';

interface OrderActionButtonsProps {
  onNew: () => void;
  onSave: () => void;
  onConfirm?: () => void;
  onSubmit: () => void;
  onPrintSPK?: () => void;
  onPrintReceipt?: () => void;
  onPrintNota?: () => void;
  onPrintPelunasan?: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  children?: React.ReactNode;
  disabledPrintSPK?: boolean;
  disabledSaveOrder?: boolean;
  isEditingItem?: boolean;
  isEditMode?: boolean;
  hasEditChanges?: boolean;
  isConfirmed?: boolean;
  hasPostConfirmationChanges?: boolean;
}

const OrderActionButtons = ({ 
  onNew, 
  onSave, 
  onConfirm,
  onSubmit, 
  onPrintSPK,
  onPrintReceipt,
  onPrintNota,
  onPrintPelunasan,
  isSaving, 
  hasUnsavedChanges, 
  children, 
  disabledPrintSPK, 
  disabledSaveOrder, 
  isEditingItem, 
  isEditMode, 
  hasEditChanges,
  isConfirmed,
  hasPostConfirmationChanges
}: OrderActionButtonsProps) => {
  return (
    <div className="border-t px-6 py-4 bg-white flex-shrink-0">
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onNew}>New</Button>
          <Button 
            type="button" 
            onClick={onSave}
            disabled={isSaving || disabledSaveOrder || isEditingItem || (isEditMode && !hasEditChanges) || (isConfirmed && !hasPostConfirmationChanges)}
            className={
              isSaving || disabledSaveOrder || isEditingItem || (isEditMode && !hasEditChanges) || (isConfirmed && !hasPostConfirmationChanges)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : hasUnsavedChanges || (isConfirmed && hasPostConfirmationChanges)
                ? "bg-[#0050C8] hover:bg-[#003a9b] text-white"
                : ""
            }
            variant={(hasUnsavedChanges || (isConfirmed && hasPostConfirmationChanges)) && !disabledSaveOrder && !isEditingItem && !(isEditMode && !hasEditChanges) && !(isConfirmed && !hasPostConfirmationChanges) ? "default" : "outline"}
          >
            {isSaving ? "Save Order" : "Save Order"}
          </Button>
          {onConfirm && isEditMode && (
            <Button 
              type="button" 
              onClick={onConfirm}
              disabled={isSaving || disabledSaveOrder || isEditingItem || (isEditMode && !hasEditChanges) || (isConfirmed && !hasPostConfirmationChanges)}
              className={
                isSaving || disabledSaveOrder || isEditingItem || (isEditMode && !hasEditChanges) || (isConfirmed && !hasPostConfirmationChanges)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : hasUnsavedChanges || (isConfirmed && hasPostConfirmationChanges)
                  ? "bg-[#0050C8] hover:bg-[#003a9b] text-white"
                  : ""
              }
              variant={(hasUnsavedChanges || (isConfirmed && hasPostConfirmationChanges)) && !disabledSaveOrder && !isEditingItem && !(isEditMode && !hasEditChanges) && !(isConfirmed && !hasPostConfirmationChanges) ? "default" : "outline"}
            >
              Konfirmasi
            </Button>
          )}
          <Button
            type="button"
            className={
              disabledPrintSPK
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#0050C8] hover:bg-[#003a9b] text-white"
            }
            disabled={disabledPrintSPK}
            onClick={onPrintSPK}
          >
            Print SPK
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {children}
          <div className="flex space-x-2">
            {onPrintNota && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onPrintNota}
                className="text-sm"
              >
                Print Nota
              </Button>
            )}
            {onPrintPelunasan && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onPrintPelunasan}
                className="text-sm"
              >
                Print Pelunasan
              </Button>
            )}
            <Button 
              type="submit" 
              className="bg-[#0050C8] hover:bg-[#003a9b]" 
              onClick={onPrintReceipt || onSubmit}
            >
              Print Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderActionButtons;
