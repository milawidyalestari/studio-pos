
import { useState, useEffect } from 'react';
import { useProducts } from './useProducts';

export const useProductCodeGenerator = () => {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: products = [] } = useProducts();

  const generateProductCode = async () => {
    setIsGenerating(true);
    
    try {
      // Find the highest existing product code number
      let maxNumber = 0;
      
      products.forEach(product => {
        const match = product.kode.match(/^PRD(\d+)$/);
        if (match) {
          const number = parseInt(match[1]);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });
      
      // Generate next code
      const nextNumber = maxNumber + 1;
      const newCode = `PRD${nextNumber.toString().padStart(4, '0')}`;
      
      setGeneratedCode(newCode);
      console.log('Generated product code:', newCode);
      
    } catch (error) {
      console.error('Error generating product code:', error);
      // Fallback to timestamp-based code
      const timestamp = Date.now().toString().slice(-4);
      setGeneratedCode(`PRD${timestamp}`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (products.length >= 0) { // Generate even if no products exist
      generateProductCode();
    }
  }, [products]);

  return {
    generatedCode,
    isGenerating,
    regenerateCode: generateProductCode
  };
};
