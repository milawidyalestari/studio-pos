import React from 'react';

interface ReceiptStrukPreviewProps {
  toko?: {
    nama: string;
    alamat?: string;
    telp?: string;
    logoUrl?: string;
    website?: string;
  };
  orderData: {
    invoiceNumber: string;
    tanggal: string;
    customer: string;
    telp?: string;
    kasir?: string;
    statusLunas?: boolean;
    diskon?: number;
    piutang?: number;
    rekening?: Array<{ bank: string; norek: string; nama: string }>;
    qris?: string;
    keterangan?: string;
  };
  orderList: Array<{
    id: string;
    item: string;
    ukuran?: { panjang?: string; lebar?: string };
    quantity: number;
    subTotal: number;
    unitPrice?: number;
    bahan?: string;
    keterangan?: string;
  }>;
  total: number;
}

export const ReceiptStrukPreview: React.FC<ReceiptStrukPreviewProps> = ({
  toko = {
    nama: 'Kasir Percetakan',
    alamat: 'Banda Aceh',
    telp: '085223202023',
    logoUrl: '',
    website: 'www.kasirpercetakan.com',
  },
  orderData,
  orderList,
  total,
}) => {
  const diskon = orderData.diskon || 0;
  const piutang = orderData.piutang || 0;
  const statusLunas = orderData.statusLunas !== false;
  const kasir = orderData.kasir || 'Kasir';
  const rekening = orderData.rekening || [
    { bank: 'BRI', norek: '672453432', nama: 'Kasir Percetakan' },
    { bank: 'BCA', norek: '7556506499133', nama: 'Kasir Percetakan' },
  ];
  const qris = orderData.qris || 'Qris 0 a.n Kasir Percetakan';

  return (
    <div
      style={{
        fontFamily: 'monospace',
        maxWidth: 320,
        background: '#fff',
        border: '1px solid #eee',
        margin: '0 auto',
        fontSize: 13,
        color: '#222',
      }}
      className="rounded shadow p-2"
    >
      {/* Header */}
      <div className="text-center mb-1">
        {toko.logoUrl ? (
          <img src={toko.logoUrl} alt="logo" style={{ height: 40, margin: '0 auto' }} />
        ) : (
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>🖨️</div>
        )}
        <div style={{ fontWeight: 700, fontSize: 16 }}>{toko.nama}</div>
        {toko.alamat && <div>{toko.alamat}</div>}
        {toko.telp && <div>{toko.telp}</div>}
        {toko.website && <div style={{ fontSize: 11 }}>{toko.website}</div>}
      </div>
      <div className="text-center" style={{ letterSpacing: 2, fontSize: 18, margin: '2px 0' }}>------------------------------------</div>
      {/* Info Invoice */}
      <div className="mb-1">
        <div>Invoice # <b>{orderData.invoiceNumber}</b></div>
        <div>Tgl : {orderData.tanggal}</div>
        <div>Kepada : {orderData.customer}</div>
        {orderData.telp && <div>Tlp. : {orderData.telp}</div>}
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, margin: '4px 0 2px', textDecoration: 'underline' }}>URAIAN ORDER</div>
      {/* Order List */}
      <div className="mb-1">
        {orderList.map((item, idx) => (
          <div key={item.id || idx} style={{ marginBottom: 4 }}>
            <div style={{ fontWeight: 600 }}>{item.item}{item.bahan ? ` ${item.bahan}` : ''}</div>
            {item.ukuran?.panjang && item.ukuran?.lebar && (
              <div style={{ fontSize: 12 }}>
                {item.ukuran.panjang}x{item.ukuran.lebar}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>
                {item.quantity} PCS x {item.unitPrice ? item.unitPrice.toLocaleString('id-ID') : (item.subTotal / item.quantity).toLocaleString('id-ID')}
              </span>
              <span>{item.subTotal.toLocaleString('id-ID')}</span>
            </div>
            {item.bahan && (
              <div style={{ fontSize: 12 }}>Bhn.: {item.bahan}</div>
            )}
            {item.keterangan && (
              <div style={{ fontSize: 12 }}>Ket.: {item.keterangan}</div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center" style={{ letterSpacing: 2, fontSize: 18, margin: '2px 0' }}>------------------------------------</div>
      {/* Ringkasan */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Total Order</span>
        <span>Rp. {total.toLocaleString('id-ID')}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Diskon</span>
        <span>Rp. {diskon.toLocaleString('id-ID')}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Piutang</span>
        <span>Rp. {piutang.toLocaleString('id-ID')}</span>
      </div>
      <div className="text-center" style={{ letterSpacing: 2, fontSize: 18, margin: '2px 0' }}>------------------------------------</div>
      {/* Pelanggan & Kasir */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span>Pelanggan</span>
        <span>{kasir}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span>{orderData.customer}</span>
        <span>Kasir</span>
      </div>
      {/* Status Lunas */}
      {statusLunas && (
        <div className="text-center" style={{ margin: '8px 0' }}>
          <div style={{ border: '2px solid #222', display: 'inline-block', padding: '2px 12px', fontWeight: 700, fontSize: 15, letterSpacing: 1, background: '#eee' }}>
            SUDAH LUNAS
          </div>
          <div style={{ fontSize: 11, marginTop: 2 }}>TERIMA KASIH</div>
        </div>
      )}
      {/* Rekening */}
      <div style={{ margin: '6px 0 2px', fontWeight: 600 }}>No.Rekening</div>
      {rekening.map((rek, i) => (
        <div key={rek.norek + i} style={{ fontSize: 12 }}>
          {rek.bank} <b>{rek.norek}</b> a.n {rek.nama}
        </div>
      ))}
      {/* QRIS */}
      <div style={{ fontSize: 12, marginTop: 2 }}>{qris}</div>
      <div className="text-center" style={{ letterSpacing: 2, fontSize: 18, margin: '2px 0' }}>------------------------------------</div>
      <div className="text-center" style={{ fontSize: 11, marginTop: 2 }}>© {new Date().getFullYear()} {toko.nama}</div>
    </div>
  );
}; 