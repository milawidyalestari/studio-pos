
import { Badge } from '@/components/ui/badge';

export const formatCurrency = (amount: number) => {
  return `IDR ${amount.toLocaleString('id-ID')}`;
};

export const getStatusBadge = (status: string) => {
  return status === 'Active' ? 
    <Badge className="bg-green-100 text-green-800">Active</Badge> :
    <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
};

export const getLevelBadge = (level: string) => {
  const colors: Record<string, string> = {
    'VIP': 'bg-purple-100 text-purple-800',
    'Premium': 'bg-blue-100 text-blue-800',
    'Regular': 'bg-gray-100 text-gray-800'
  };
  return <Badge className={colors[level] || colors.Regular}>{level}</Badge>;
};
