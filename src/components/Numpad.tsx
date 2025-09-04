import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NumpadProps {
  onNumberInput?: (num: string) => void;
  onClear?: () => void;
  onComplete?: () => void;
}

const Numpad: React.FC<NumpadProps> = ({
  onNumberInput,
  onClear,
  onComplete
}) => {
  const handleNumberClick = (num: string) => {
    if (onNumberInput) {
      onNumberInput(num);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="pt-4">
        <div className="grid grid-cols-3 gap-2 h-full">
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('7')}
          >
            7
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('8')}
          >
            8
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('9')}
          >
            9
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('4')}
          >
            4
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('5')}
          >
            5
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('6')}
          >
            6
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('1')}
          >
            1
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('2')}
          >
            2
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('3')}
          >
            3
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('0')}
          >
            0
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('.')}
          >
            .
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-base font-mono"
            onClick={() => handleNumberClick('00')}
          >
            00
          </Button>
        </div>
        <div className="mt-2">
          <Button 
            onClick={handleClear}
            variant="outline" 
            className="w-full h-8 bg-gray-100 hover:bg-gray-200 text-xs"
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Numpad;
