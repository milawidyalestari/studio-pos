
import { Badge } from '@/components/ui/badge';

export const formatCurrency = (amount: number) => {
  return `IDR ${amount.toLocaleString('id-ID')}`;
};

export const getStatusBadge = (status: string) => {
  return status === 'Aktif' ? 
    <Badge className="bg-green-100 text-green-800">Aktif</Badge> :
    <Badge className="bg-red-100 text-red-800">Tidak Aktif</Badge>;
};

export const getLevelBadge = (level: string) => {
  const colors: Record<string, string> = {
    'VIP': 'bg-purple-100 text-purple-800',
    'Vendor': 'bg-blue-100 text-blue-800',
    'Organisasi': 'bg-orange-100 text-orange-800',
    'Reguler': 'bg-gray-100 text-gray-800'
  };
  return <Badge className={colors[level] || colors.Reguler}>{level}</Badge>;
};
