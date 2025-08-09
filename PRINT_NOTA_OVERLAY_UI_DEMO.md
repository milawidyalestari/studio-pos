# Print Nota Overlay UI Demo

## Layout yang Sama Persis dengan Print SPK

Print Nota Overlay sekarang menggunakan layout yang identik dengan Print SPK, termasuk modal overlay, panel kiri-kanan, dan semua elemen UI.

### Modal Overlay Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Print Nota Modal Overlay                                │
│  [Printer Icon] Print Nota                    [X Close Button]           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │        Left Panel              │  │        Right Panel             │  │
│  │         (2/3 width)           │  │         (1/3 width)            │  │
│  │                               │  │                                 │  │
│  │ ┌─────────────────────────────┐ │  │ ┌─────────────────────────────┐ │  │
│  │ │ Info Banner                 │ │  │ │ NOTA Header                │ │  │
│  │ │ "Pilih Item untuk Print"    │ │  │ │ NOTA: NOTA-2024-12-19-001  │ │  │
│  │ │ "Klik item yang ingin       │ │  │ │                             │ │  │
│  │ │  dicetak"                   │ │  │ │ [✓] Cash    [ ] Transfer   │ │  │
│  │ │ ✓ 3 item dipilih            │ │  │ │ [ ] Credit                 │ │  │
│  │ └─────────────────────────────┘ │  │ │                             │ │  │
│  │                               │  │ │ Customer: WD Florist        │ │  │
│  │ ┌─────────────────────────────┐ │  │ │ Tanggal: 19/12/2024        │ │  │
│  │ │ Items List                  │ │  │ │ Deadline: 19/12/2024       │ │  │
│  │ │                             │ │  │ │                             │ │  │
│  │ │ [✓] Spanduk Florist 2 Pass │ │  │ │ Items:                     │ │  │
│  │ │     TBC Dari Apotekku      │ │  │ │ ------                     │ │  │
│  │ │     100 x 150              │ │  │ │                             │ │  │
│  │ │     @1 Lembaran            │ │  │ │ Spanduk Florist 2 Pass     │ │  │
│  │ │     Print outdoor tahan cuaca│ │  │ │   100 x 150                │ │  │
│  │ │                             │ │  │ │   TBC Dari Apotekku        │ │  │
│  │ │ [✓] Spanduk Glossy 280 Gsm │ │  │ │   @1 Lembaran              │ │  │
│  │ │     Promosi Toko            │ │  │ │   Print outdoor tahan cuaca│ │  │
│  │ │     150 x 100              │ │  │ │                             │ │  │
│  │ │     @2 Lembaran            │ │  │ │ Spanduk Glossy 280 Gsm     │ │  │
│  │ │     Print indoor glossy    │ │  │ │   150 x 100                │ │  │
│  │ │                             │ │  │ │   Promosi Toko              │ │  │
│  │ │ [ ] Spanduk Doff 300 Gsm   │ │  │ │   @2 Lembaran              │ │  │
│  │ │     Event Marketing        │ │  │ │   Print indoor glossy      │ │  │
│  │ │     200 x 100              │ │  │ │                             │ │  │
│  │ │     @1 Lembaran            │ │  │ │ Cincin / Mata Ayam         │ │  │
│  │ │     Print outdoor doff     │ │  │ │   70 x 100                 │ │  │
│  │ │                             │ │  │ │   Aksesoris                │ │  │
│  │ │ [✓] Cincin / Mata Ayam     │ │  │ │   @5 Pcs                   │ │  │
│  │ │     Aksesoris              │ │  │ │   Material stainless       │ │  │
│  │ │     70 x 100               │ │  │ │                             │ │  │
│  │ │     @5 Pcs                 │ │  │ │ Subtotal: Rp 800.000       │ │  │
│  │ │     Material stainless     │ │  │ │ Down Payment: Rp 200.000   │ │  │
│  │ │                             │ │  │ │ Remaining: Rp 600.000      │ │  │
│  │ │ [ ] Kartu Nama 1 Sisi      │ │  │ │                             │ │  │
│  │ │     Kartu Nama Perusahaan  │ │  │ │ Kom: ???                   │ │  │
│  │ │     100 x 159              │ │  │ │ Designer: Mila             │ │  │
│  │ │     @100 Pcs               │ │  │ │ Payment: Cash              │ │  │
│  │ │     Print offset           │ │  │ │ Cashier: Cashier           │ │  │
│  │ └─────────────────────────────┘ │  │ │                             │ │  │
│  │                               │  │ └─────────────────────────────┘ │  │
│  └─────────────────────────────────┘  │                                 │  │
│                                       └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Elemen UI yang Identik dengan Print SPK

### 1. **Modal Overlay**
- **Background**: `bg-black/50` dengan opacity 50%
- **Container**: `bg-background rounded-lg shadow-2xl`
- **Size**: `w-full max-w-6xl max-h-[90vh]`
- **Animation**: `animate-in fade-in duration-300` dan `zoom-in-95 duration-300`

### 2. **Header**
- **Layout**: `flex items-center justify-between p-4 border-b border-border`
- **Title**: Icon Printer + "Print Nota" (dinamis berdasarkan printType)
- **Close Button**: Ghost button dengan icon X
- **Animation**: Fade out animation saat close

### 3. **Left Panel (2/3 width)**
- **Container**: `w-2/3 border-r border-border flex flex-col`
- **Info Banner**: 
  - Background: `bg-blue-50 border border-blue-200 rounded-lg`
  - Icon: Info icon dengan warna biru
  - Text: "Pilih Item untuk Print" dan "Klik item yang ingin dicetak"
  - Counter: "✓ 3 item dipilih" (hijau)

### 4. **Item List**
- **Container**: `flex-1 p-4 space-y-1 overflow-y-auto`
- **Item Card**:
  - Background: `bg-gray-50 hover:bg-gray-100`
  - Border: `border border-border rounded-lg`
  - Selected State: `ring-2 ring-blue-500 bg-blue-50`
  - Cursor: `cursor-pointer transition-colors`

### 5. **Item Content**
- **Layout**: `flex justify-between items-start`
- **Left Side**: Item name dan description
- **Right Side**: Dimensions, quantity, location
- **Typography**: 
  - Name: `font-semibold text-gray-900 text-sm`
  - Description: `text-xs text-gray-700`
  - Dimensions: `font-semibold text-gray-900`
  - Quantity/Location: `text-gray-600`

### 6. **Right Panel (1/3 width)**
- **Container**: `w-1/3 bg-white flex flex-col`
- **Content Area**: `flex-1 overflow-y-auto p-4 rounded-lg m-2 border border-border`

### 7. **Nota Header**
- **Layout**: `text-center mb-4`
- **Title**: "NOTA" dengan `text-lg font-bold text-gray-900`
- **Number**: Nota number dengan `text-sm text-gray-600`

### 8. **Payment Method Checkboxes**
- **Layout**: `space-y-2 mb-4`
- **Container**: `flex gap-4 text-xs`
- **Options**: Cash (default checked), Transfer, Credit
- **Styling**: Identik dengan SPK checkboxes

### 9. **Order Details**
- **Layout**: `space-y-3 text-sm mb-4`
- **Row**: `flex justify-between`
- **Labels**: "Customer:" (bukan "Nama:")
- **Values**: `font-medium` untuk customer name

### 10. **Items Section**
- **Header**: "Items:" dengan `text-sm font-medium mb-3 border-t`
- **Item List**: `space-y-3 text-xs`
- **Item Row**: `border-b border-gray-200 pb-3 last:border-b-0`
- **Empty State**: "Pilih item di panel kiri" dengan `text-gray-500 text-center py-4`

### 11. **Payment Summary (Nota Only)**
- **Layout**: `mt-4 space-y-2 text-sm border-t pt-3`
- **Fields**: Subtotal, Down Payment, Remaining
- **Styling**: `font-medium` untuk labels, `font-bold` untuk remaining

### 12. **Additional Information**
- **Layout**: `mt-4 space-y-2 text-sm`
- **Row**: `flex justify-between`
- **Fields**: Kom, Designer, Payment, Cashier (Nota only)
- **Labels**: Regular text
- **Values**: Regular text

### 13. **Fixed Footer**
- **Container**: `border-t border-border p-4`
- **Buttons**: `flex gap-3 pt-3`
- **Cancel Button**: `variant="outline" className="flex-1"`
- **Print Button**: `className="flex-1 gap-2 bg-blue-700 hover:bg-blue-800"`

## Perbedaan Konten dengan Print SPK

### **Header Title**
- **SPK**: "Print RO"
- **Nota**: "Print Nota"

### **Content Header**
- **SPK**: "REQUEST ORDER"
- **Nota**: "NOTA"

### **Checkboxes**
- **SPK**: Outdoor/Indoor, Laser Printing, Mug/Nota/Stamp
- **Nota**: Cash (default checked), Transfer, Credit

### **Order Details Label**
- **SPK**: "Nama :"
- **Nota**: "Customer :"

### **Payment Summary**
- **SPK**: Tidak ada
- **Nota**: Subtotal, Down Payment, Remaining

### **Additional Fields**
- **SPK**: Kom, Designer
- **Nota**: Kom, Designer, Payment, Cashier

## Sample Data yang Digunakan

### Sample Items
1. **Spanduk Florist 2 Pass**
   - Description: TBC Dari Apotekku
   - Dimensions: 100 x 150
   - Quantity: @1 Lembaran
   - Location: Print outdoor tahan cuaca

2. **Spanduk Glossy 280 Gsm**
   - Description: Promosi Toko
   - Dimensions: 150 x 100
   - Quantity: @2 Lembaran
   - Location: Print indoor glossy

3. **Spanduk Doff 300 Gsm**
   - Description: Event Marketing
   - Dimensions: 200 x 100
   - Quantity: @1 Lembaran
   - Location: Print outdoor doff

4. **Cincin / Mata Ayam**
   - Description: Aksesoris
   - Dimensions: 70 x 100
   - Quantity: @5 Pcs
   - Location: Material stainless

5. **Kartu Nama 1 Sisi**
   - Description: Kartu Nama Perusahaan
   - Dimensions: 100 x 159
   - Quantity: @100 Pcs
   - Location: Print offset

### Nota Information
- **Nota Number**: NOTA-2024-12-19-001
- **Customer**: WD Florist
- **Date**: 19/12/2024
- **Deadline**: 19/12/2024
- **Subtotal**: Rp 800.000
- **Down Payment**: Rp 200.000
- **Remaining**: Rp 600.000
- **Computer**: ???
- **Designer**: Mila
- **Payment**: Cash
- **Cashier**: Cashier

## Print Content Generation

### **Nota Print Format**
```
NOTA
=====
19/12/2024
Nota: NOTA-2024-12-19-001

Customer: WD Florist
Deadline: 19/12/2024

Items:
------
Spanduk Florist 2 Pass
  TBC Dari Apotekku
  100 x 150
  1 Lembaran x Rp 150.000
  Subtotal: Rp 150.000

Spanduk Glossy 280 Gsm
  Promosi Toko
  150 x 100
  2 Lembaran x Rp 200.000
  Subtotal: Rp 400.000

Cincin / Mata Ayam
  Aksesoris
  70 x 100
  5 Pcs x Rp 50.000
  Subtotal: Rp 250.000

==================
Subtotal: Rp 800.000
Down Payment: Rp 200.000
Remaining: Rp 600.000
TOTAL: Rp 800.000

Designer: Mila
Computer: ???
Payment: Cash
Cashier: Cashier

Terimakasih sudah cetak di Indah Grafika
```

## Responsive Behavior

### **Desktop (lg+)**
- Modal overlay dengan max-width 6xl
- Panel kiri 2/3 width, kanan 1/3 width
- Full height dengan max-height 90vh

### **Tablet (md)**
- Modal overlay dengan max-width 6xl
- Panel kiri 2/3 width, kanan 1/3 width
- Slightly compressed spacing

### **Mobile (sm)**
- Modal overlay dengan max-width 6xl
- Panel kiri 2/3 width, kanan 1/3 width
- Scrollable content areas

## Animation Details

### **Modal Entry**
- **Background**: `animate-in fade-in duration-300`
- **Modal**: `animate-in zoom-in-95 duration-300`

### **Modal Exit**
- **Background**: `animate-out fade-out duration-400`
- **Modal**: `animate-out zoom-out-95 duration-400`

### **Item Selection**
- **Hover**: `hover:bg-gray-100`
- **Selected**: `ring-2 ring-blue-500 bg-blue-50`
- **Transition**: `transition-colors`

## Color Scheme

### **Primary Colors**
- **Blue**: `bg-blue-700 hover:bg-blue-800` (Print button)
- **Blue Light**: `bg-blue-50 border-blue-200` (Info banner)
- **Blue Ring**: `ring-blue-500` (Selected items)

### **Text Colors**
- **Primary**: `text-gray-900` (Item names, headers)
- **Secondary**: `text-gray-700` (Descriptions)
- **Muted**: `text-gray-600` (Dimensions, quantities)
- **Success**: `text-green-700` (Selection counter)

### **Background Colors**
- **Modal**: `bg-background` (White)
- **Items**: `bg-gray-50` (Light gray)
- **Selected**: `bg-blue-50` (Light blue)
- **Hover**: `hover:bg-gray-100` (Lighter gray)

## Typography

### **Font Sizes**
- **Large**: `text-lg` (Modal title)
- **Medium**: `text-sm` (Item names, descriptions)
- **Small**: `text-xs` (Details, quantities)

### **Font Weights**
- **Bold**: `font-bold` (Headers)
- **Semibold**: `font-semibold` (Item names)
- **Medium**: `font-medium` (Values)
- **Regular**: Default (Labels, descriptions)

## Spacing

### **Padding**
- **Modal**: `p-4` (16px)
- **Header**: `p-4` (16px)
- **Content**: `p-4` (16px)
- **Footer**: `p-4` (16px)

### **Margins**
- **Items**: `space-y-1` (4px between items)
- **Sections**: `mb-4` (16px between sections)
- **Buttons**: `gap-3` (12px between buttons)

### **Borders**
- **Modal**: `border-border` (1px)
- **Items**: `border border-border` (1px)
- **Selected**: `ring-2 ring-blue-500` (2px blue ring)

## Interactive States

### **Hover States**
- **Items**: `hover:bg-gray-100`
- **Buttons**: `hover:bg-blue-800` (Print), `hover:bg-gray-100` (Cancel)

### **Selected States**
- **Items**: `ring-2 ring-blue-500 bg-blue-50`
- **Checkboxes**: `data-[state=checked]:bg-black`

### **Disabled States**
- **Print Button**: `disabled={isPrinting}` dengan loading spinner
- **Checkboxes**: `disabled={true}` untuk read-only

## Loading States

### **Print Button**
- **Normal**: Icon Printer + "Print"
- **Loading**: `Loader2` spinner + "Printing..."
- **Disabled**: `disabled={isPrinting}`

### **Animation**
- **Spinner**: `animate-spin`
- **Duration**: `duration-300` untuk modal animations

## Accessibility Features

### **Keyboard Navigation**
- **Tab Order**: Logical tab order through interactive elements
- **Focus**: Visible focus indicators
- **Escape**: Close modal with Escape key

### **Screen Reader**
- **ARIA Labels**: Proper labels for buttons and interactive elements
- **Semantic HTML**: Proper heading structure
- **Alt Text**: Descriptive text for icons

### **Color Contrast**
- **WCAG Compliant**: All text meets contrast requirements
- **High Contrast**: Clear distinction between states

## Performance Optimizations

### **Rendering**
- **Memoization**: Components memoized where appropriate
- **Virtual Scrolling**: Large item lists use scroll areas
- **Lazy Loading**: Content loaded as needed

### **Animations**
- **Hardware Acceleration**: CSS transforms for smooth animations
- **Reduced Motion**: Respects user preferences
- **Efficient Transitions**: Minimal repaints during animations

## Browser Compatibility

### **Modern Browsers**
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### **CSS Features**
- **Grid**: Used for layout
- **Flexbox**: Used for alignment
- **CSS Variables**: Used for theming
- **Animations**: CSS transitions and keyframes

## Testing Scenarios

### **Visual Testing**
1. **Modal Display**: Verify modal appears correctly
2. **Item Selection**: Test item selection visual feedback
3. **Responsive Layout**: Test on different screen sizes
4. **Animation Smoothness**: Verify animations are smooth

### **Interaction Testing**
1. **Item Click**: Test item selection/deselection
2. **Print Button**: Test print functionality
3. **Cancel Button**: Test modal closing
4. **Keyboard Navigation**: Test tab order and keyboard shortcuts

### **State Testing**
1. **Loading States**: Test print button loading state
2. **Empty States**: Test when no items are selected
3. **Error States**: Test error handling
4. **Success States**: Test successful operations

## Integration Points

### **PrintOverlay Integration**
- Used in `PrintOverlay.tsx` for nota print type
- Receives `orderData` and `orderList` props
- Displays in preview panel

### **Data Flow**
- Receives data from parent component
- Processes and displays order information
- Formats currency and dates
- Handles missing or invalid data

### **Styling Integration**
- Uses shared UI components
- Consistent with design system
- Follows established patterns

Print Nota Overlay sekarang memiliki layout yang **sama persis** dengan Print SPK, dengan hanya perbedaan konten yang relevan untuk nota (payment methods, payment summary, dll) tetapi struktur visual, spacing, typography, dan styling yang identik. 