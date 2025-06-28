
import { useState } from 'react';

export const useMasterDataState = () => {
  const [sampleGroups, setSampleGroups] = useState([
    { id: '1', kode: 'GRP001', nama: 'Printing Materials' },
    { id: '2', kode: 'GRP002', nama: 'Finishing Tools' },
    { id: '3', kode: 'GRP003', nama: 'Design Services' },
  ]);

  const [sampleCategories, setSampleCategories] = useState([
    { id: '1', kode: 'CAT001', kelompok: 'Printing Materials', kategori: 'Vinyl' },
    { id: '2', kode: 'CAT002', kelompok: 'Printing Materials', kategori: 'Banner' },
    { id: '3', kode: 'CAT003', kelompok: 'Finishing Tools', kategori: 'Laminating' },
  ]);

  const [sampleUnits, setSampleUnits] = useState([
    { id: '1', kode: 'UNIT001', satuan: 'Roll' },
    { id: '2', kode: 'UNIT002', satuan: 'Pack' },
    { id: '3', kode: 'UNIT003', satuan: 'Meter' },
  ]);

  const [samplePaymentTypes, setSamplePaymentTypes] = useState([
    { id: '1', kode: 'PAY001', tipe: 'Digital', jenisPembayaran: 'QRIS' },
    { id: '2', kode: 'PAY002', tipe: 'Digital', jenisPembayaran: 'E-wallet' },
    { id: '3', kode: 'PAY003', tipe: 'Card', jenisPembayaran: 'Debit Card' },
  ]);

  return {
    sampleGroups,
    setSampleGroups,
    sampleCategories,
    setSampleCategories,
    sampleUnits,
    setSampleUnits,
    samplePaymentTypes,
    setSamplePaymentTypes,
  };
};
