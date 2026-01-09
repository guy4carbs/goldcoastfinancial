import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Download, 
  Calendar, 
  DollarSign, 
  User, 
  Users, 
  FileText, 
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface PolicyDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: {
    id: string;
    type: string;
    status: string;
    coverage: string;
    premium: string;
    nextPayment: string;
  } | null;
  onRequestChanges?: (policyId: string, policyType: string) => void;
}

const generateDocumentContent = (docName: string, policyNumber: string, policyType: string) => {
  const date = new Date().toLocaleDateString();
  return `
================================================================================
                          GOLD COAST FINANCIAL GROUP
                         Life Insurance Documentation
================================================================================

Document: ${docName}
Policy Number: ${policyNumber}
Policy Type: ${policyType}
Generated: ${date}

--------------------------------------------------------------------------------

This document is a placeholder representing your ${docName.toLowerCase()}.

For the official policy document, please contact your advisor:
  Jack Cook, Principal Agent
  Phone: (630) 555-0123
  Email: jack.cook@goldcoastfnl.com

Gold Coast Financial Group
123 Main Street
Naperville, IL 60540

================================================================================
                    Thank you for choosing Gold Coast Financial
================================================================================
`;
};

const downloadDocument = (docName: string, policyNumber: string, policyType: string) => {
  const content = generateDocumentContent(docName, policyNumber, policyType);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${docName.replace(/\s+/g, '_')}_${policyNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const downloadAllDocuments = (documents: { name: string; date: string }[], policyNumber: string, policyType: string) => {
  let combinedContent = `
================================================================================
                          GOLD COAST FINANCIAL GROUP
                      Complete Policy Documentation Package
================================================================================

Policy Number: ${policyNumber}
Policy Type: ${policyType}
Generated: ${new Date().toLocaleDateString()}

This package contains the following documents:
${documents.map((doc, i) => `  ${i + 1}. ${doc.name} (${doc.date})`).join('\n')}

================================================================================

`;

  documents.forEach((doc, index) => {
    combinedContent += `
--------------------------------------------------------------------------------
DOCUMENT ${index + 1}: ${doc.name}
Date: ${doc.date}
--------------------------------------------------------------------------------

This section represents your ${doc.name.toLowerCase()}.

[Document content would appear here in the official version]

`;
  });

  combinedContent += `
================================================================================
                         END OF DOCUMENT PACKAGE
================================================================================

For official copies of these documents, please contact:
  Gold Coast Financial Group
  Jack Cook, Principal Agent
  Phone: (630) 555-0123
  Email: jack.cook@goldcoastfnl.com

================================================================================
`;

  const blob = new Blob([combinedContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Policy_Documents_${policyNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export function PolicyDetailsDrawer({ open, onOpenChange, policy, onRequestChanges }: PolicyDetailsDrawerProps) {
  if (!open) return null;
  if (!policy) return null;

  const policyDetails = {
    policyNumber: policy.id,
    effectiveDate: "January 15, 2024",
    expirationDate: policy.type.includes("Term") ? "January 15, 2044" : "Lifetime Coverage",
    underwriter: "Mutual of Omaha",
    cashValue: policy.type.includes("Whole") ? "$12,450.00" : "N/A",
    deathBenefit: policy.coverage,
    riders: policy.type.includes("Whole") 
      ? ["Waiver of Premium", "Accelerated Death Benefit", "Child Term Rider"]
      : ["Accelerated Death Benefit", "Terminal Illness Benefit"],
    beneficiaries: [
      { name: "Sarah Johnson", relationship: "Spouse", percentage: "60%", type: "Primary" },
      { name: "Michael Johnson", relationship: "Son", percentage: "20%", type: "Primary" },
      { name: "Emily Johnson", relationship: "Daughter", percentage: "20%", type: "Primary" },
      { name: "Robert Johnson", relationship: "Brother", percentage: "100%", type: "Contingent" }
    ],
    paymentHistory: [
      { date: "Jan 1, 2025", amount: policy.premium.replace("/month", ""), status: "Paid" },
      { date: "Dec 1, 2024", amount: policy.premium.replace("/month", ""), status: "Paid" },
      { date: "Nov 1, 2024", amount: policy.premium.replace("/month", ""), status: "Paid" },
      { date: "Oct 1, 2024", amount: policy.premium.replace("/month", ""), status: "Paid" }
    ],
    documents: [
      { name: "Policy Contract", date: "Jan 15, 2024" },
      { name: "Coverage Summary", date: "Jan 15, 2024" },
      { name: "Beneficiary Designation", date: "Jan 15, 2024" }
    ],
    advisor: {
      name: "Jack Cook",
      title: "Principal Agent",
      phone: "(630) 555-0123",
      email: "jack.cook@goldcoastfnl.com"
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-serif">{policy.type}</SheetTitle>
              <SheetDescription>Policy #{policyDetails.policyNumber}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-primary text-white border-0">
              <CardContent className="p-4">
                <p className="text-white/70 text-xs mb-1">Death Benefit</p>
                <p className="text-2xl font-bold">{policyDetails.deathBenefit}</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10 border-secondary/20">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs mb-1">Monthly Premium</p>
                <p className="text-2xl font-bold text-primary">{policy.premium}</p>
              </CardContent>
            </Card>
          </motion.div>

          {policy.type.includes("Whole") && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-700 text-xs mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Cash Value
                      </p>
                      <p className="text-2xl font-bold text-green-800">{policyDetails.cashValue}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Growing</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Policy Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {policy.status}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground text-sm">Effective Date</span>
                  <span className="font-medium text-sm">{policyDetails.effectiveDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground text-sm">Coverage Period</span>
                  <span className="font-medium text-sm">{policyDetails.expirationDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground text-sm">Underwriter</span>
                  <span className="font-medium text-sm">{policyDetails.underwriter}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground text-sm">Next Payment</span>
                  <span className="font-medium text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {policy.nextPayment}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Policy Riders & Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {policyDetails.riders.map((rider, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {rider}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Beneficiaries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {policyDetails.beneficiaries.map((beneficiary, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{beneficiary.name}</p>
                        <p className="text-xs text-muted-foreground">{beneficiary.relationship}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{beneficiary.percentage}</p>
                      <Badge variant="outline" className="text-xs">
                        {beneficiary.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {policyDetails.paymentHistory.map((payment, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-muted-foreground">{payment.date}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">{payment.amount}</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Policy Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {policyDetails.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.date}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        downloadDocument(doc.name, policyDetails.policyNumber, policy.type);
                        toast.success(`Downloading ${doc.name}...`, {
                          description: "Your document is being downloaded."
                        });
                      }}
                      data-testid={`button-download-doc-${i}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Your Dedicated Advisor</p>
                    <p className="font-semibold">{policyDetails.advisor.name}</p>
                    <p className="text-sm text-muted-foreground">{policyDetails.advisor.title}</p>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs"
                        onClick={() => {
                          window.location.href = `tel:${policyDetails.advisor.phone.replace(/[^0-9]/g, '')}`;
                        }}
                        data-testid="button-call-advisor"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        {policyDetails.advisor.phone}
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs"
                        onClick={() => {
                          window.location.href = `mailto:${policyDetails.advisor.email}`;
                        }}
                        data-testid="button-email-advisor"
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Separator />

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                if (onRequestChanges) {
                  onRequestChanges(policyDetails.policyNumber, policy.type);
                  onOpenChange(false);
                } else {
                  toast.info("Request submitted", {
                    description: "Your advisor will contact you within 1-2 business days to discuss policy changes."
                  });
                }
              }}
              data-testid="button-request-changes"
            >
              Request Changes
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => {
                downloadAllDocuments(policyDetails.documents, policyDetails.policyNumber, policy.type);
                toast.success("Downloading documents...", {
                  description: "All policy documents are being downloaded."
                });
              }}
              data-testid="button-download-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All Documents
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
