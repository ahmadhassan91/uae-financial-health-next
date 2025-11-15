import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FilePdf, 
  EnvelopeSimple, 
  Download, 
  CheckCircle, 
  Warning, 
  Spinner,
  Clock,
  Eye
} from '@phosphor-icons/react';
import { apiClient } from '../lib/api-client';

interface ReportDeliveryProps {
  surveyResponseId: number;
  userEmail?: string;
  onClose?: () => void;
}

interface DeliveryResult {
  success: boolean;
  message: string;
  pdf_generated: boolean;
  email_sent: boolean;
  errors: string[];
}

interface DeliveryHistory {
  id: number;
  survey_response_id: number;
  delivery_type: string;
  delivery_status: string;
  recipient_email?: string;
  language: string;
  file_size?: number;
  delivered_at?: string;
  created_at: string;
  error_message?: string;
  retry_count: number;
}

export function ReportDelivery({ surveyResponseId, userEmail, onClose }: ReportDeliveryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailAddress, setEmailAddress] = useState(userEmail || '');
  const [sendEmail, setSendEmail] = useState(false);
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState<DeliveryResult | null>(null);
  const [history, setHistory] = useState<DeliveryHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await apiClient.post('/reports/generate', {
        survey_response_id: surveyResponseId,
        send_email: sendEmail,
        email_address: sendEmail ? emailAddress : null,
        language: language,
        branding_config: {
          primary_color: '#1e3a8a',
          secondary_color: '#059669',
          company_name: 'National Bonds',
          accent_color: '#fbbf24'
        }
      });

      setResult(response.data);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.detail || 'Failed to generate report',
        pdf_generated: false,
        email_sent: false,
        errors: [error.message]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await fetch(`${apiClient.baseURL}/reports/download/${surveyResponseId}`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `financial_health_report_${surveyResponseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const resendEmail = async () => {
    if (!emailAddress) return;

    try {
      await apiClient.post('/reports/resend-email', {
        survey_response_id: surveyResponseId,
        email_address: emailAddress,
        language: language
      });

      // Refresh history after resending
      loadHistory();
    } catch (error) {
      console.error('Resend failed:', error);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await apiClient.get('/reports/history?limit=10');
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleHistory = () => {
    if (!showHistory) {
      loadHistory();
    }
    setShowHistory(!showHistory);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'generated':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePdf className="h-5 w-5" />
            Generate Report
          </CardTitle>
          <CardDescription>
            Generate and deliver your financial health assessment report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language">Report Language</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isGenerating}
            >
              <option value="en">English</option>
              <option value="ar">العربية (Arabic)</option>
            </select>
          </div>

          {/* Email Delivery Option */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="send-email"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                disabled={isGenerating}
              />
              <Label htmlFor="send-email" className="flex items-center gap-2">
                <EnvelopeSimple className="h-4 w-4" />
                Send report via email
              </Label>
            </div>

            {sendEmail && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter email address"
                  disabled={isGenerating}
                />
              </div>
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateReport}
            disabled={isGenerating || (sendEmail && !emailAddress)}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Spinner className="h-4 w-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FilePdf className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>

          {/* Result Display */}
          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Warning className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                      {result.message}
                    </p>
                    
                    {result.success && (
                      <div className="flex flex-wrap gap-2">
                        {result.pdf_generated && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={downloadReport}
                            className="flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            Download PDF
                          </Button>
                        )}
                        
                        {result.email_sent && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Email Sent
                          </Badge>
                        )}
                      </div>
                    )}

                    {result.errors.length > 0 && (
                      <div className="text-sm text-red-700">
                        <p className="font-medium">Errors:</p>
                        <ul className="list-disc list-inside">
                          {result.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Delivery History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Delivery History
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleHistory}
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? (
                <Spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </CardTitle>
        </CardHeader>

        {showHistory && (
          <CardContent>
            {history.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No delivery history found
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {delivery.delivery_type === 'email' ? (
                          <EnvelopeSimple className="h-4 w-4" />
                        ) : (
                          <FilePdf className="h-4 w-4" />
                        )}
                        <span className="font-medium capitalize">
                          {delivery.delivery_type.replace('_', ' ')}
                        </span>
                        {getStatusBadge(delivery.delivery_status)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {delivery.recipient_email && (
                          <p>To: {delivery.recipient_email}</p>
                        )}
                        <p>
                          {formatDate(delivery.delivered_at || delivery.created_at)} • 
                          {formatFileSize(delivery.file_size)} • 
                          {delivery.language.toUpperCase()}
                        </p>
                        {delivery.error_message && (
                          <p className="text-red-600">Error: {delivery.error_message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {delivery.delivery_type === 'email' && delivery.delivery_status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={resendEmail}
                          className="flex items-center gap-1"
                        >
                          <EnvelopeSimple className="h-3 w-3" />
                          Resend
                        </Button>
                      )}
                      
                      {delivery.delivery_type === 'pdf_download' && delivery.delivery_status === 'generated' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={downloadReport}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
}