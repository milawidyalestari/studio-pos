import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActionButtonsProps {
  onRefund?: () => void;
  onSub?: () => void;
  onButton1?: () => void;
  onButton2?: () => void;
  onButton3?: () => void;
  onButton4?: () => void;
  onButton5?: () => void;
  onButton6?: () => void;
  onButton7?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRefund,
  onSub,
  onButton1,
  onButton2,
  onButton3,
  onButton4,
  onButton5,
  onButton6,
  onButton7
}) => {
  return (
    <Card className="h-full">
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-2 h-full">
          <Button
            onClick={onRefund}
            variant="outline"
            className="h-12 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 text-xs"
          >
            Refund
          </Button>
          <Button
            onClick={onSub}
            variant="outline"
            className="h-12 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 text-xs"
          >
            Sub
          </Button>
          <Button
            onClick={onButton3}
            variant="outline"
            className="h-12 text-xs"
          >
            Button 3
          </Button>
          <Button
            onClick={onButton2}
            variant="outline"
            className="h-12 text-xs"
          >
            Button 2
          </Button>
          <Button
            onClick={onButton4}
            variant="outline"
            className="h-12 text-xs"
          >
            Button 4
          </Button>
          <Button
            onClick={onButton5}
            variant="outline"
            className="h-12 text-xs"
          >
            Button 5
          </Button>
          <Button
            onClick={onButton7}
            variant="outline"
            className="h-12 text-xs"
          >
            Button 7
          </Button>
          <Button
            onClick={onButton6}
            variant="outline"
            className="h-12 text-xs"
          >
            Button 6
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtons;
