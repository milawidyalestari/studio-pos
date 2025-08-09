# NotaPreview UI Demo

## Layout yang Sama Persis dengan SPKPreview

NotaPreview sekarang menggunakan layout yang identik dengan SPKPreview, termasuk semua elemen visual, spacing, dan struktur yang sama.

### Layout Struktur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NOTA PREVIEW                                    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    NOTA                                            │   │
│  │                 NOTA-2024-12-19-001                               │   │
│  │                                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ Payment Method Checkboxes                                  │   │   │
│  │  │ [✓] Cash    [ ] Transfer    [ ] Credit                    │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                   │   │
│  │  Customer: WD Florist                                            │   │
│  │  Tanggal: 19/12/2024                                            │   │
│  │  Deadline: 19/12/2024 14:30                                     │   │
│  │                                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ Items List                                                 │   │   │
│  │  │                                                             │   │   │
│  │  │ ┌─────────────────────────────────────────────────────────┐ │   │   │
│  │  │ │ Spanduk Florist 2 Pass                                │ │   │   │
│  │  │ │ TBC Dari Apotekku                                     │ │   │   │
│  │  │ │ 100 x 150 @1 Lembaran                                 │ │   │   │
│  │  │ │ Price: Rp 150.000                                     │ │   │   │
│  │  │ │ Subtotal: Rp 150.000                                  │ │   │   │
│  │  │ └─────────────────────────────────────────────────────────┘ │   │   │
│  │  │                                                             │   │   │
│  │  │ ┌─────────────────────────────────────────────────────────┐ │   │   │
│  │  │ │ Spanduk Glossy 280 Gsm                                │ │   │   │
│  │  │ │ Promosi Toko                                           │ │   │   │
│  │  │ │ 150 x 100 @2 Lembaran                                 │ │   │   │
│  │  │ │ Price: Rp 200.000                                     │ │   │   │
│  │  │ │ Subtotal: Rp 400.000                                  │ │   │   │
│  │  │ └─────────────────────────────────────────────────────────┘ │   │   │
│  │  │                                                             │   │   │
│  │  │ ┌─────────────────────────────────────────────────────────┐ │   │   │
│  │  │ │ Cincin / Mata Ayam                                    │ │   │   │
│  │  │ │ Aksesoris                                             │ │   │   │
│  │  │ │ 70 x 100 @5 Pcs                                      │ │   │   │
│  │  │ │ Price: Rp 50.000                                      │ │   │   │
│  │  │ │ Subtotal: Rp 250.000                                  │ │   │   │
│  │  │ └─────────────────────────────────────────────────────────┘ │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                   │   │
│  │  Subtotal: Rp 800.000                                            │   │
│  │  Down Payment: Rp 200.000                                        │   │
│  │  Remaining: Rp 600.000                                            │   │
│  │                                                                   │   │
│  │  Kom: 1                                                          │   │
│  │  Designer: Mila - Orderan Selesai                               │   │
│  │  Payment: Cash                                                   │   │
│  │  Cashier: Cashier                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Elemen UI yang Identik dengan SPKPreview

### 1. **Header Section**
- **Layout**: `text-center space-y-2`
- **Title**: "NOTA" dengan `text-xl font-bold`
- **Order Number**: `text-lg font-semibold`
- **Separator**: `my-4` spacing

### 2. **Payment Method Checkboxes**
- **Layout**: `space-y-2 mb-4`
- **Container**: `flex gap-4 text-sm`
- **Checkboxes**: Custom styling dengan border hitam
- **Options**: Cash (default checked), Transfer, Credit
- **Styling**: Identik dengan SPK checkboxes

### 3. **Order Details**
- **Layout**: `space-y-2 mb-4`
- **Container**: `grid grid-cols-1 gap-2 text-sm`
- **Fields**: Customer, Tanggal, Deadline
- **Styling**: `font-medium` untuk labels, `ml-2` untuk spacing

### 4. **Items List**
- **Layout**: `space-y-3`
- **Item Container**: `border border-gray-200 rounded p-3`
- **Item Structure**:
  - **Name**: `font-medium text-sm mb-1`
  - **Description**: `text-xs text-gray-600 mb-1`
  - **Dimensions & Quantity**: `text-xs text-gray-700`
  - **Price**: `text-xs text-gray-600 mt-1`
  - **Subtotal**: `text-xs font-medium text-right`

### 5. **Payment Summary**
- **Layout**: `space-y-2`
- **Fields**: Subtotal, Down Payment, Remaining
- **Styling**: `font-medium` untuk labels, `font-bold` untuk remaining

### 6. **Additional Information**
- **Layout**: `space-y-2`
- **Fields**: Kom, Designer, Payment, Cashier
- **Styling**: `flex justify-between text-sm` dengan `font-medium` untuk labels

## Sample Data yang Digunakan

### Sample Items
1. **Spanduk Florist 2 Pass**
   - Description: TBC Dari Apotekku
   - Dimensions: 100 x 150
   - Quantity: @1 Lembaran
   - Price: Rp 150.000
   - Subtotal: Rp 150.000

2. **Spanduk Glossy 280 Gsm**
   - Description: Promosi Toko
   - Dimensions: 150 x 100
   - Quantity: @2 Lembaran
   - Price: Rp 200.000
   - Subtotal: Rp 400.000

3. **Cincin / Mata Ayam**
   - Description: Aksesoris
   - Dimensions: 70 x 100
   - Quantity: @5 Pcs
   - Price: Rp 50.000
   - Subtotal: Rp 250.000

### Nota Information
- **Nota Number**: NOTA-2024-12-19-001
- **Customer**: WD Florist
- **Date**: 19/12/2024
- **Deadline**: 19/12/2024 14:30
- **Subtotal**: Rp 800.000
- **Down Payment**: Rp 200.000
- **Remaining**: Rp 600.000
- **Computer**: 1
- **Designer**: Mila - Orderan Selesai
- **Payment**: Cash
- **Cashier**: Cashier

## Perbedaan dengan SPKPreview

### **Header**
- **SPK**: "REQUEST ORDER"
- **Nota**: "NOTA"

### **Checkboxes**
- **SPK**: Outdoor/Indoor, Laser Printing, Mug/Nota/Stemple
- **Nota**: Cash, Transfer, Credit

### **Payment Information**
- **SPK**: Tidak ada payment summary
- **Nota**: Subtotal, Down Payment, Remaining

### **Additional Fields**
- **SPK**: Kom, Designer
- **Nota**: Kom, Designer, Payment, Cashier

## Styling yang Identik

### **Card Container**
```css
border-2 border-gray-300
```

### **Header**
```css
text-center space-y-2
text-xl font-bold (title)
text-lg font-semibold (order number)
```

### **Checkboxes**
```css
rounded border-2 border-black bg-white checked:bg-black checked:border-black
width: 12px, height: 12px
appearance: none
```

### **Order Details**
```css
grid grid-cols-1 gap-2 text-sm
font-medium (labels)
ml-2 (spacing)
```

### **Items**
```css
border border-gray-200 rounded p-3
font-medium text-sm mb-1 (name)
text-xs text-gray-600 mb-1 (description)
text-xs text-gray-700 (dimensions)
text-xs text-gray-600 mt-1 (price)
text-xs font-medium text-right (subtotal)
```

### **Separators**
```css
my-4
```

### **Additional Info**
```css
flex justify-between text-sm
font-medium (labels)
```

## Responsive Behavior

### **Desktop**
- Full width card dengan proper spacing
- Grid layout untuk order details
- Proper text sizing

### **Tablet**
- Slightly compressed spacing
- Maintained readability

### **Mobile**
- Scrollable content
- Maintained structure

## Color Scheme

### **Primary Colors**
- **Black**: `border-black`, `checked:bg-black` (checkboxes)
- **Gray**: `border-gray-200`, `text-gray-600`, `text-gray-700`
- **White**: `bg-white` (checkbox background)

### **Text Colors**
- **Primary**: `text-gray-900` (item names)
- **Secondary**: `text-gray-600` (descriptions, prices)
- **Muted**: `text-gray-700` (dimensions)

### **Background Colors**
- **Card**: White background
- **Items**: `border-gray-200` border
- **Checkboxes**: White background, black when checked

## Typography

### **Font Sizes**
- **Large**: `text-xl` (header title)
- **Medium**: `text-lg` (order number)
- **Small**: `text-sm` (details, labels)
- **Extra Small**: `text-xs` (descriptions, prices, subtotals)

### **Font Weights**
- **Bold**: `font-bold` (header title)
- **Semibold**: `font-semibold` (order number)
- **Medium**: `font-medium` (item names, labels)
- **Regular**: Default (descriptions, values)

## Spacing

### **Padding**
- **Card**: `p-4` (16px)
- **Items**: `p-3` (12px)

### **Margins**
- **Sections**: `mb-4` (16px between sections)
- **Items**: `space-y-3` (12px between items)
- **Details**: `gap-2` (8px between detail rows)

### **Borders**
- **Card**: `border-2 border-gray-300` (2px gray border)
- **Items**: `border border-gray-200` (1px light gray border)
- **Checkboxes**: `border-2 border-black` (2px black border)

## Interactive Elements

### **Checkboxes**
- **Default State**: White background, black border
- **Checked State**: Black background, black border
- **Hover**: No hover effect (read-only)
- **Focus**: No focus effect (read-only)

### **Items**
- **Border**: Light gray border
- **Background**: White background
- **Text**: Proper hierarchy dengan different sizes dan weights

## Accessibility Features

### **Semantic Structure**
- Proper heading hierarchy
- Logical content flow
- Clear visual separation

### **Color Contrast**
- High contrast text
- Clear distinction between elements
- Readable font sizes

### **Screen Reader**
- Proper text content
- Logical tab order
- Descriptive labels

## Performance Optimizations

### **Rendering**
- Efficient component structure
- Minimal re-renders
- Optimized styling

### **Memory Usage**
- No unnecessary state
- Efficient data processing
- Clean component lifecycle

## Browser Compatibility

### **CSS Features**
- **Grid**: Used for layout
- **Flexbox**: Used for alignment
- **Custom Properties**: Used for theming
- **Appearance**: Custom checkbox styling

### **Modern Browsers**
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Testing Scenarios

### **Visual Testing**
1. **Layout Consistency**: Verify layout matches SPKPreview
2. **Typography**: Test all font sizes and weights
3. **Spacing**: Verify proper spacing between elements
4. **Colors**: Test color contrast and readability

### **Content Testing**
1. **Data Display**: Test with various data scenarios
2. **Empty States**: Test with empty or missing data
3. **Long Content**: Test with long item names or descriptions
4. **Currency Formatting**: Test currency display

### **Responsive Testing**
1. **Desktop**: Test on large screens
2. **Tablet**: Test on medium screens
3. **Mobile**: Test on small screens
4. **Print Preview**: Test print layout

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

NotaPreview sekarang memiliki layout yang **sama persis** dengan SPKPreview, dengan hanya perbedaan konten yang relevan untuk nota (payment methods, payment summary, dll) tetapi struktur visual, spacing, typography, dan styling yang identik. 