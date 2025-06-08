
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export const ProgramSettings = () => {
  const { toast } = useToast();
  
  // Business Info state
  const [businessName, setBusinessName] = useState('Smart Digital');
  const [businessType, setBusinessType] = useState('Retail');
  const [owner, setOwner] = useState('');
  const [address, setAddress] = useState('Jl. Panglima Sudirman No.312');
  const [city, setCity] = useState('Tangerang');
  const [province, setProvince] = useState('Banten');
  const [postalCode, setPostalCode] = useState('65100');
  const [phone, setPhone] = useState('0341 234567');
  const [fax, setFax] = useState('0341 234567');
  const [email, setEmail] = useState('info@smartminimarket.com');
  const [website, setWebsite] = useState('www.smartminimarket.com');
  const [background, setBackground] = useState('C:\\Program Files (x86)\\Software Percetakan\\_image\\background.jpg');
  const [logo, setLogo] = useState('C:\\Program Files (x86)\\Software Percetakan\\_image\\logo.jpg');

  // Devices state
  const [headerFaktur1, setHeaderFaktur1] = useState('Smart Shoping for Smart Buyer');
  const [headerFaktur2, setHeaderFaktur2] = useState('');
  const [footerFaktur1, setFooterFaktur1] = useState('Barang yang sudah dibeli tidak dapat dikembalikan tanpa ada perjanjian sebelumnya');
  const [footerFaktur2, setFooterFaktur2] = useState('Terima Kasih Banyak Atas Kepercayaannya, Kami Tunggu Pesanan Berikutnya');
  const [paperSize, setPaperSize] = useState('A5');
  const [printerType, setPrinterType] = useState('Direct');
  const [portType, setPortType] = useState('USB');
  const [port, setPort] = useState('USB1');
  const [useCashDrawer, setUseCashDrawer] = useState(true);
  const [drawerCode, setDrawerCode] = useState('27.112.0.64.240');

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Program settings have been successfully saved.",
    });
  };

  const handleCancel = () => {
    toast({
      title: "Changes Cancelled",
      description: "All changes have been reverted.",
    });
  };

  const handleTestDrawer = () => {
    toast({
      title: "Testing Cash Drawer",
      description: "Attempting to open cash drawer...",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="business-info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business-info">Info Usaha</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
          <TabsTrigger value="devices">Peralatan</TabsTrigger>
        </TabsList>

        <TabsContent value="business-info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Nama Usaha</Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="bg-yellow-100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business-type">Bidang Usaha</Label>
              <Input
                id="business-type"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Pemilik</Label>
              <Input
                id="owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-yellow-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Kota</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal-code">Kode Pos</Label>
              <Input
                id="postal-code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Provinsi</Label>
              <Input
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">No. Telp</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                value={fax}
                onChange={(e) => setFax(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">Background</Label>
              <div className="flex gap-2">
                <Input
                  id="background"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">...</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex gap-2">
                <Input
                  id="logo"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">...</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="text-center text-muted-foreground py-8">
            <p>Transaction configuration options will be implemented here.</p>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="header-faktur-1">Header Faktur #1</Label>
                <Input
                  id="header-faktur-1"
                  value={headerFaktur1}
                  onChange={(e) => setHeaderFaktur1(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="header-faktur-2">Header Faktur #2</Label>
                <Input
                  id="header-faktur-2"
                  value={headerFaktur2}
                  onChange={(e) => setHeaderFaktur2(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-faktur-1">Footer Faktur #1</Label>
                <Input
                  id="footer-faktur-1"
                  value={footerFaktur1}
                  onChange={(e) => setFooterFaktur1(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-faktur-2">Footer Faktur #2</Label>
                <Input
                  id="footer-faktur-2"
                  value={footerFaktur2}
                  onChange={(e) => setFooterFaktur2(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paper-size">Ukuran Kertas</Label>
                <Select value={paperSize} onValueChange={setPaperSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="A5">A5</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="printer-type">Jenis Printer</Label>
                <Select value={printerType} onValueChange={setPrinterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direct">Direct</SelectItem>
                    <SelectItem value="Network">Network</SelectItem>
                    <SelectItem value="Shared">Shared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="port-type">Jenis Port</Label>
                <Select value={portType} onValueChange={setPortType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USB">USB</SelectItem>
                    <SelectItem value="COM">COM</SelectItem>
                    <SelectItem value="LPT">LPT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Select value={port} onValueChange={setPort}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USB1">USB1</SelectItem>
                    <SelectItem value="USB2">USB2</SelectItem>
                    <SelectItem value="USB3">USB3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cash-drawer"
                  checked={useCashDrawer}
                  onCheckedChange={setUseCashDrawer}
                />
                <Label htmlFor="cash-drawer">Pakai Cash Drawer</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drawer-code">Code</Label>
                <Input
                  id="drawer-code"
                  value={drawerCode}
                  onChange={(e) => setDrawerCode(e.target.value)}
                />
              </div>

              <Button onClick={handleTestDrawer} variant="outline" className="w-full">
                Test Open
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-6 border-t">
        <div className="flex gap-2">
          <Button onClick={handleSave}>Simpan</Button>
          <Button onClick={handleCancel} variant="outline">Batal</Button>
        </div>
        <Button variant="outline">Keluar</Button>
      </div>
    </div>
  );
};
