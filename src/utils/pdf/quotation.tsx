import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts if needed
// Font.register({ family: 'Inter', src: '/fonts/Inter.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: '20mm',
    paddingTop: '35mm',
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  letterhead: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30mm',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '20mm',
    paddingTop: '8mm',
    borderBottom: '2pt solid #0ea5e9',
    backgroundColor: '#f8fafc',
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 9,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0ea5e9',
  },
  companyDetails: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0f172a',
  },
  quotationNumber: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 10,
    color: '#1e293b',
  },
  table: {
    marginTop: 16,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
    borderBottom: '2pt solid #cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #e2e8f0',
    padding: 8,
    fontSize: 9,
  },
  col1: { width: '40%', paddingRight: 8 },
  col2: { width: '12%', textAlign: 'right' },
  col3: { width: '16%', textAlign: 'right' },
  col4: { width: '16%', textAlign: 'right' },
  col5: { width: '16%', textAlign: 'right' },
  totalsSection: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  totalsBox: {
    width: '50%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 10,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '2pt solid #0ea5e9',
    fontSize: 12,
    fontWeight: 'bold',
  },
  amountInWords: {
    marginTop: 12,
    fontSize: 9,
    fontStyle: 'italic',
    color: '#64748b',
  },
  termsSection: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#92400e',
  },
  termsText: {
    fontSize: 8,
    lineHeight: 1.4,
    color: '#78350f',
  },
  signatureSection: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureLine: {
    borderTop: '1pt solid #94a3b8',
    marginTop: 40,
    paddingTop: 6,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  signatureTitle: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: '15mm',
    left: '20mm',
    right: '20mm',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#94a3b8',
  },
  pageNumber: {
    position: 'absolute',
    bottom: '10mm',
    right: '20mm',
    fontSize: 8,
    color: '#94a3b8',
  },
});

interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

interface QuotationContent {
  company: {
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  client: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  quotationNumber: string;
  date: string;
  validUntil?: string;
  items: QuotationItem[];
  taxes: {
    subtotal: number;
    vatRate?: number;
    vatAmount?: number;
    total: number;
  };
  terms?: string;
  notes?: string;
  signature?: {
    name: string;
    title: string;
  };
}

const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
  if (num < 1000000) {
    return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
  }
  return num.toString();
};

const formatAmountInWords = (amount: number): string => {
  const wholePart = Math.floor(amount);
  const decimalPart = Math.round((amount - wholePart) * 100);
  let words = numberToWords(wholePart) + ' Rials';
  if (decimalPart > 0) {
    words += ' and ' + numberToWords(decimalPart) + ' Baisa';
  }
  return words + ' Only';
};

export const QuotationPDF = ({ content }: { content: QuotationContent }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Fixed Letterhead - appears on every page */}
      <View fixed style={styles.letterhead}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {content.company.logo && (
            <Image src={content.company.logo} style={styles.logo} />
          )}
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{content.company.name}</Text>
          {content.company.address && (
            <Text style={styles.companyDetails}>{content.company.address}</Text>
          )}
          {content.company.phone && (
            <Text style={styles.companyDetails}>Tel: {content.company.phone}</Text>
          )}
          {content.company.email && (
            <Text style={styles.companyDetails}>Email: {content.company.email}</Text>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View>
        <Text style={styles.title}>QUOTATION</Text>
        <Text style={styles.quotationNumber}>Quotation No: {content.quotationNumber}</Text>

        {/* Client and Date Info */}
        <View style={styles.row}>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bill To</Text>
              <Text style={styles.value}>{content.client.name}</Text>
              {content.client.address && (
                <Text style={[styles.value, { fontSize: 9, marginTop: 4 }]}>{content.client.address}</Text>
              )}
              {content.client.phone && (
                <Text style={[styles.value, { fontSize: 9, marginTop: 2 }]}>Tel: {content.client.phone}</Text>
              )}
              {content.client.email && (
                <Text style={[styles.value, { fontSize: 9, marginTop: 2 }]}>Email: {content.client.email}</Text>
              )}
            </View>
          </View>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date</Text>
              <Text style={styles.value}>{content.date}</Text>
            </View>
            {content.validUntil && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Valid Until</Text>
                <Text style={styles.value}>{content.validUntil}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table} wrap>
          {/* Table Header - fixed for continuation */}
          <View style={styles.tableHeader} fixed>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>Unit Price</Text>
            <Text style={styles.col4}>Discount</Text>
            <Text style={styles.col5}>Total</Text>
          </View>

          {/* Table Rows */}
          {content.items.map((item, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>{item.unitPrice.toFixed(3)}</Text>
              <Text style={styles.col4}>{item.discount ? `${item.discount}%` : '-'}</Text>
              <Text style={styles.col5}>{item.total.toFixed(3)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Subtotal:</Text>
              <Text>{content.taxes.subtotal.toFixed(3)} OMR</Text>
            </View>
            {content.taxes.vatRate && (
              <View style={styles.totalRow}>
                <Text>VAT ({(content.taxes.vatRate * 100).toFixed(0)}%):</Text>
                <Text>{(content.taxes.vatAmount || 0).toFixed(3)} OMR</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text>Grand Total:</Text>
              <Text>{content.taxes.total.toFixed(3)} OMR</Text>
            </View>
            <View style={styles.amountInWords}>
              <Text>{formatAmountInWords(content.taxes.total)}</Text>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        {content.terms && (
          <View style={styles.termsSection}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>{content.terms}</Text>
          </View>
        )}

        {/* Notes */}
        {content.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={[styles.value, { fontSize: 9 }]}>{content.notes}</Text>
          </View>
        )}

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.label}>Customer Signature</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>{content.client.name}</Text>
            </View>
          </View>
          {content.signature && (
            <View style={styles.signatureBox}>
              <Text style={styles.label}>Authorized Signature</Text>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureName}>{content.signature.name}</Text>
                <Text style={styles.signatureTitle}>{content.signature.title}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Footer with page numbers */}
      <Text 
        fixed 
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </Page>
  </Document>
);
