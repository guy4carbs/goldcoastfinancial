import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Bell, 
  Mail, 
  Smartphone, 
  FileText,
  Calendar,
  Shield,
  DollarSign,
  Save,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface PreferencesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Preferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  paperlessStatements: boolean;
  paymentReminders: boolean;
  policyUpdates: boolean;
  marketingEmails: boolean;
  reminderFrequency: string;
  documentDelivery: string;
}

export function PreferencesDrawer({ open, onOpenChange }: PreferencesDrawerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    smsNotifications: false,
    paperlessStatements: true,
    paymentReminders: true,
    policyUpdates: true,
    marketingEmails: false,
    reminderFrequency: "7days",
    documentDelivery: "email"
  });

  const updatePreference = (key: keyof Preferences, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Preferences saved", {
      description: "Your notification preferences have been updated."
    });
    
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-serif">Notification Preferences</SheetTitle>
              <SheetDescription>Manage how we communicate with you</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Communication Channels
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose how you'd like to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="email-notif" className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => updatePreference("emailNotifications", checked)}
                    data-testid="switch-email-notifications"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="sms-notif" className="text-sm font-medium">SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">Get text message alerts</p>
                    </div>
                  </div>
                  <Switch
                    id="sms-notif"
                    checked={preferences.smsNotifications}
                    onCheckedChange={(checked) => updatePreference("smsNotifications", checked)}
                    data-testid="switch-sms-notifications"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Document Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="paperless" className="text-sm font-medium">Paperless Statements</Label>
                    <p className="text-xs text-muted-foreground">Go green with electronic documents</p>
                  </div>
                  <Switch
                    id="paperless"
                    checked={preferences.paperlessStatements}
                    onCheckedChange={(checked) => updatePreference("paperlessStatements", checked)}
                    data-testid="switch-paperless"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Document Delivery Method</Label>
                  <Select
                    value={preferences.documentDelivery}
                    onValueChange={(value) => updatePreference("documentDelivery", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="mail">Physical Mail Only</SelectItem>
                      <SelectItem value="both">Both Email and Mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Payment Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="payment-remind" className="text-sm font-medium">Payment Reminders</Label>
                    <p className="text-xs text-muted-foreground">Get notified before payments are due</p>
                  </div>
                  <Switch
                    id="payment-remind"
                    checked={preferences.paymentReminders}
                    onCheckedChange={(checked) => updatePreference("paymentReminders", checked)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Reminder Timing</Label>
                  <Select
                    value={preferences.reminderFrequency}
                    onValueChange={(value) => updatePreference("reminderFrequency", value)}
                    disabled={!preferences.paymentReminders}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3days">3 days before</SelectItem>
                      <SelectItem value="7days">7 days before</SelectItem>
                      <SelectItem value="14days">14 days before</SelectItem>
                    </SelectContent>
                  </Select>
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
                  Policy Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="policy-updates" className="text-sm font-medium">Policy Change Alerts</Label>
                    <p className="text-xs text-muted-foreground">Updates about your coverage and policies</p>
                  </div>
                  <Switch
                    id="policy-updates"
                    checked={preferences.policyUpdates}
                    onCheckedChange={(checked) => updatePreference("policyUpdates", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="marketing" className="text-sm font-medium">Marketing Communications</Label>
                    <p className="text-xs text-muted-foreground">Tips, offers, and educational content</p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={preferences.marketingEmails}
                    onCheckedChange={(checked) => updatePreference("marketingEmails", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Your Data is Protected</p>
                  <p className="text-xs text-green-700">
                    We never share your contact information with third parties. Your preferences are securely stored and you can update them anytime.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Separator />

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
