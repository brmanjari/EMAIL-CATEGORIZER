import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  RefreshCw, 
  Bot, 
  Clock,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import { format } from "date-fns";
import type { Email, ExtractedInfo } from "@shared/schema";
import { useUpdateEmail, useSendResponse, useRegenerateResponse } from "@/hooks/useEmails";

interface EmailModalProps {
  email: Email | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailModal({ email, isOpen, onClose }: EmailModalProps) {
  const [editedResponse, setEditedResponse] = useState("");
  const { toast } = useToast();
  
  const updateEmailMutation = useUpdateEmail();
  const sendResponseMutation = useSendResponse();
  const regenerateResponseMutation = useRegenerateResponse();

  // Update edited response when email changes
  useEffect(() => {
    if (email?.aiResponse) {
      setEditedResponse(email.aiResponse);
    }
  }, [email?.aiResponse]);

  if (!email) return null;

  const extractedInfo: ExtractedInfo = email.extractedInfo ? 
    JSON.parse(email.extractedInfo) : {};

  const initials = email.sender.split('@')[0].charAt(0).toUpperCase();
  
  const priorityColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    normal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  };
  
  const sentimentColors: Record<string, string> = {
    positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    neutral: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  };

  const handleSendResponse = async () => {
    try {
      // Update email with edited response first
      if (editedResponse !== email.aiResponse) {
        await updateEmailMutation.mutateAsync({
          id: email.id,
          data: { aiResponse: editedResponse }
        });
      }
      
      // Mark as sent
      await sendResponseMutation.mutateAsync(email.id);
      
      toast({
        title: "Response Sent",
        description: "Email response has been sent successfully.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "Could not send the response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateResponse = async () => {
    try {
      await regenerateResponseMutation.mutateAsync(email.id);
      toast({
        title: "Response Regenerated",
        description: "A new AI response has been generated.",
      });
    } catch (error) {
      toast({
        title: "Failed to Regenerate",
        description: "Could not regenerate the response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateResponseQuality = () => {
    if (!email.aiResponse) return 0;
    
    // Simple quality calculation based on response length and completeness
    const wordCount = email.aiResponse.split(' ').length;
    const hasGreeting = email.aiResponse.toLowerCase().includes('dear') || email.aiResponse.toLowerCase().includes('hello');
    const hasClosing = email.aiResponse.toLowerCase().includes('regards') || email.aiResponse.toLowerCase().includes('sincerely');
    const hasActionItems = email.aiResponse.toLowerCase().includes('will') || email.aiResponse.toLowerCase().includes('next');
    
    let quality = 70; // Base quality
    if (wordCount > 100) quality += 10;
    if (hasGreeting) quality += 10;
    if (hasClosing) quality += 5;
    if (hasActionItems) quality += 5;
    
    return Math.min(100, quality);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden"
        data-testid="email-modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Email Details & Response</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="close-modal-btn"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Original Email */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Original Email</h3>
            
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground" data-testid="modal-email-sender">
                      {email.sender}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="modal-email-date">
                      {format(new Date(email.sentDate), 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge className={priorityColors[email.priority]}>
                    {email.priority.toUpperCase()}
                  </Badge>
                  <Badge className={sentimentColors[email.sentiment]}>
                    {email.sentiment.charAt(0).toUpperCase() + email.sentiment.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <h4 className="font-medium text-foreground mb-2" data-testid="modal-email-subject">
                {email.subject}
              </h4>
              
              <p className="text-sm text-muted-foreground" data-testid="modal-email-body">
                {email.body}
              </p>
            </Card>

            {/* Extracted Information */}
            {extractedInfo && Object.keys(extractedInfo).length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Extracted Information</h4>
                <Card className="p-4">
                  <div className="space-y-2 text-sm">
                    {extractedInfo.issueType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issue Type:</span>
                        <span className="text-foreground font-medium" data-testid="extracted-issue-type">
                          {extractedInfo.issueType}
                        </span>
                      </div>
                    )}
                    {extractedInfo.urgency && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Urgency Level:</span>
                        <span className={`font-medium ${extractedInfo.urgency.toLowerCase().includes('critical') ? 'text-red-600' : 'text-foreground'}`} 
                              data-testid="extracted-urgency">
                          {extractedInfo.urgency}
                        </span>
                      </div>
                    )}
                    {extractedInfo.duration && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="text-foreground font-medium" data-testid="extracted-duration">
                          {extractedInfo.duration}
                        </span>
                      </div>
                    )}
                    {extractedInfo.impact && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Business Impact:</span>
                        <span className="text-foreground font-medium" data-testid="extracted-impact">
                          {extractedInfo.impact}
                        </span>
                      </div>
                    )}
                    {extractedInfo.keywords && extractedInfo.keywords.length > 0 && (
                      <div>
                        <span className="text-muted-foreground block mb-1">Keywords:</span>
                        <div className="flex flex-wrap gap-1">
                          {extractedInfo.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* AI Response */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">AI Generated Response</h3>
            
            <div className="space-y-4">
              <Textarea 
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                className="min-h-64 font-mono text-sm resize-none"
                placeholder="AI response will appear here..."
                data-testid="response-editor"
                disabled={!email.aiResponse}
              />

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSendResponse}
                    disabled={sendResponseMutation.isPending || !email.aiResponse || email.responseStatus === 'sent'}
                    data-testid="send-final-response-btn"
                  >
                    {sendResponseMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Response
                  </Button>
                  
                  <Button 
                    variant="secondary"
                    onClick={handleRegenerateResponse}
                    disabled={regenerateResponseMutation.isPending}
                    data-testid="regenerate-response-btn"
                  >
                    {regenerateResponseMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Regenerate
                  </Button>
                </div>
                
                {email.aiResponse && (
                  <div className="text-xs text-muted-foreground">
                    <span>Response quality: </span>
                    <span className="text-green-600 font-medium">
                      {calculateResponseQuality()}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Response Metrics */}
            {email.aiResponse && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Response Analysis</h4>
                <Card className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tone:</span>
                      <span className="text-green-600 font-medium">
                        {email.sentiment === 'negative' ? 'Empathetic' : 
                         email.sentiment === 'positive' ? 'Appreciative' : 
                         'Professional'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Response Length:</span>
                      <span className="text-foreground font-medium">
                        {email.aiResponse.split(' ').length} words
                      </span>
                    </div>
                    {email.sentimentScore && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Sentiment Score:</span>
                        <span className="text-foreground font-medium">
                          {email.sentiment} ({email.sentimentScore}/5)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Action Items:</span>
                      <span className="text-foreground font-medium">
                        {(email.aiResponse.match(/\d+\./g) || []).length || 'None'} identified
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
