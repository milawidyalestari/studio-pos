
export interface Order {
  id: string;
  customer: string;
  tanggal: string;
  deadline: string;
  status: string;
  total: string;
}

export interface ActiveOrdersTableProps {
  selectedDate: Date | undefined;
  selectedDeadline: string;
  onDeadlineFilterChange: (filter: string) => void;
}
