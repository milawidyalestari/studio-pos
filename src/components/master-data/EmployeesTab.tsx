import React, { useState, useEffect } from 'react';
import type { Employee } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { TableHeader } from './TableHeader';
import { ActionButtons } from './ActionButtons';
import { getStatusBadge } from '@/utils/masterDataHelpers';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SearchInput } from '@/components/common/SearchInput';
import { SearchAndFilter } from './SearchAndFilter';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';

interface EmployeesTabProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAction: (action: string, item?: unknown) => void;
}

interface Position { id: string; name: string; }

const initialForm = { kode: '', nama: '', posisi: '', status: 'Active' };

// Helper untuk generate ID karyawan otomatis
function generateEmployeeId(existing: string[]): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yy = String(today.getFullYear()).slice(-2);
  const prefix = `EMP-${dd}${mm}${yy}`;
  // Ambil semua nomor urut yang sudah ada
  const takenNumbers = existing
    .filter(kode => kode.startsWith(prefix))
    .map(kode => parseInt(kode.slice(prefix.length), 10))
    .filter(num => !isNaN(num))
    .sort((a, b) => a - b);
  // Cari nomor urut terkecil yang belum terpakai
  let next = 1;
  for (let i = 0; i < takenNumbers.length; i++) {
    if (takenNumbers[i] !== i + 1) {
      next = i + 1;
      break;
    }
    next = takenNumbers.length + 1;
  }
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export const EmployeesTab: React.FC<EmployeesTabProps> = ({
  searchTerm,
  onSearchChange,
  onAction
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [posisiFilter, setPosisiFilter] = useState<string>('all');
  const [viewedEmployee, setViewedEmployee] = useState<Employee | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('employees').select('*').order('kode');
    if (!error) setEmployees(data || []);
    setLoading(false);
  };

  const fetchPositions = async () => {
    const { data, error } = await supabase.from('positions').select('*').order('name');
    if (!error && data) setPositions(data as Position[]);
  };

  useEffect(() => { fetchEmployees(); fetchPositions(); }, []);

  const handleAdd = () => {
    // Generate kode otomatis
    const allKode = employees.map((e: Employee) => e.kode);
    const kodeBaru = generateEmployeeId(allKode);
    setForm({ ...initialForm, kode: kodeBaru, id: undefined });
    setShowModal(true);
    setError('');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.kode || !form.nama || !form.posisi) {
      setError('Semua field wajib diisi');
      return;
    }
    const status: 'Active' | 'Inactive' = form.status === 'Inactive' ? 'Inactive' : 'Active';
    if (form.id) {
      // Edit
      const { error } = await supabase.from('employees').update({
        nama: form.nama,
        posisi: form.posisi,
        status,
        updated_at: new Date().toISOString(),
      }).eq('id', form.id);
      if (error) {
        setError('Gagal mengupdate data');
        return;
      }
    } else {
      // Tambah
      const { error } = await supabase.from('employees').insert([{
        kode: form.kode,
        nama: form.nama,
        posisi: form.posisi,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);
      if (error) {
        setError('Gagal menambah data');
        return;
      }
    }
    setShowModal(false);
    fetchEmployees();
  };

  // Handle action buttons
  const handleAction = async (action: string, item?: unknown) => {
    const employee = item as Employee;
    if (action === 'view') {
      setViewedEmployee(employee);
    } else if (action === 'edit') {
      setForm({
        id: employee.id,
        kode: employee.kode,
        nama: employee.nama,
        posisi: employee.posisi,
        status: employee.status,
      });
      setShowModal(true);
      setError('');
    } else if (action === 'delete') {
      if (window.confirm(`Yakin ingin menghapus karyawan ${employee.nama}?`)) {
        await supabase.from('employees').delete().eq('kode', employee.kode);
        fetchEmployees();
      }
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setImportedData(results.data as any[]);
        },
        error: (err) => setImportError(err.message),
      });
    } else if (ext === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        setImportedData(json as any[]);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setImportError('File type not supported. Please upload CSV or XLSX.');
    }
  };

  const handleImportData = async () => {
    try {
      for (const row of importedData) {
        // Ganti dengan createEmployee jika ada, atau insert ke supabase
        await supabase.from('employees').insert([row]);
      }
      setIsImportOpen(false);
      setImportedData([]);
      setImportError(null);
    } catch (err: any) {
      setImportError(err.message || 'Import failed');
    }
  };

  // Export Handlers
  const handleExportCSV = () => {
    const csv = Papa.unparse(employees);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'employees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(employees);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employees.xlsx');
  };

  return (
    <Card>
      <CardHeader className="sticky top-0 z-20 bg-white">
        <TableHeader 
          title="Data Karyawan" 
          icon={Users}
          onAdd={handleAdd}
          onImport={() => setIsImportOpen(true)}
          onExportCSV={handleExportCSV}
          onExportXLSX={handleExportXLSX}
        />
        <SearchAndFilter 
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          posisiFilter={posisiFilter}
          onPosisiFilterChange={setPosisiFilter}
          posisiOptions={positions.map(pos => pos.name)}
          hideFilterButton
        />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posisi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-6">Loading...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6">Tidak ada data</td></tr>
              ) : employees
                .filter((employee) => {
                  // Filter by status
                  if (statusFilter === 'all') return true;
                  if (statusFilter === 'active') return employee.status === 'Active';
                  if (statusFilter === 'inactive') return employee.status === 'Inactive';
                  return true;
                })
                .filter((employee) => {
                  // Filter by posisi
                  if (posisiFilter === 'all') return true;
                  return employee.posisi === posisiFilter;
                })
                .filter((employee) => {
                  // Filter by search term (kode or nama)
                  if (!searchTerm) return true;
                  const term = searchTerm.toLowerCase();
                  return (
                    employee.kode.toLowerCase().includes(term) ||
                    employee.nama.toLowerCase().includes(term)
                  );
                })
                .map((employee) => (
                  <tr key={employee.kode} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{employee.kode}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{employee.nama}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{employee.posisi}</td>
                    <td className="px-4 py-4">{getStatusBadge(employee.status)}</td>
                    <td className="px-4 py-4">
                      <ActionButtons item={employee} onAction={handleAction} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{form.id ? 'Edit Karyawan' : 'Tambah Karyawan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID Karyawan</label>
                <input name="kode" value={form.kode} readOnly className="border rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input name="nama" value={form.nama} onChange={handleFormChange} className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Posisi</label>
                <select name="posisi" value={form.posisi} onChange={handleFormChange} className="border rounded px-3 py-2 w-full">
                  <option value="">Pilih Posisi</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.name}>{pos.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleFormChange} className="border rounded px-3 py-2 w-full">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-gray-200">Batal</button>
                <button type="submit" className="px-4 py-2 rounded bg-[#0050C8] text-white">Simpan</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* View Modal */}
        {viewedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Detail Karyawan</h2>
              <div className="space-y-2">
                <div><b>ID Karyawan:</b> {viewedEmployee.kode}</div>
                <div><b>Nama:</b> {viewedEmployee.nama}</div>
                <div><b>Posisi:</b> {viewedEmployee.posisi}</div>
                <div><b>Status:</b> {viewedEmployee.status}</div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setViewedEmployee(null)} className="px-4 py-2 rounded bg-gray-200">Tutup</button>
              </div>
            </div>
          </div>
        )}
      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Karyawan (CSV/XLSX)</DialogTitle>
          </DialogHeader>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleImportFile}
            className="mb-4"
          />
          {importError && <div className="text-red-600 text-sm mb-2">{importError}</div>}
          {importedData.length > 0 && (
            <div className="max-h-48 overflow-auto border rounded mb-2">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    {Object.keys(importedData[0]).map((key) => (
                      <th key={key} className="px-2 py-1 border-b bg-gray-50">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {importedData.map((row, i) => (
                    <tr key={i}>
                      {Object.keys(importedData[0]).map((key) => (
                        <td key={key} className="px-2 py-1 border-b">{row[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImportData} disabled={importedData.length === 0}>Import</Button>
          </div>
        </DialogContent>
      </Dialog>
      </CardContent>
    </Card>
  );
};
