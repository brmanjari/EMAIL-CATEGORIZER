import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Bot, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { Email } from "@shared/schema";

interface EmailCardProps {
  email: Email;
  onClick: () => void;
}

export function EmailCard({ email, onClick }: EmailCardProps) {
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

  const avatarColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    normal: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
  };

  const getStatusIcon = () => {
    switch (email.responseStatus) {
      case 'sent':
        return <Check className="w-3 h-3 text-green-600" />;
      case 'generated':
        return <Bot className="w-3 h-3 text-primary" />;
      case 'pending':
        return <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />;
      case 'failed':
        return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (email.responseStatus) {
      case 'sent':
        return 'Response Sent';
      case 'generated':
        return 'AI Response Ready';
      case 'pending':
        return 'Processing...';
      case 'failed':
        return 'Processing Failed';
      default:
        return 'Pending';
    }
  };

  return (
    <Card 
      className="p-6 hover:bg-accent/50 cursor-pointer transition-colors" 
      onClick={onClick}
      data-testid={`email-item-${email.priority}`}
      data-email-id={email.id}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className={`w-10 h-10 ${avatarColors[email.priority]}`}>
            <AvatarFallback className="text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground" data-testid="email-sender">
              {email.sender}
            </p>
            <p className="text-xs text-muted-foreground" data-testid="email-date">
              {format(new Date(email.sentDate), 'MMM dd, yyyy • h:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            className={priorityColors[email.priority]} 
            data-testid="priority-badge"
          >
            {email.priority.toUpperCase()}
          </Badge>
          <Badge 
            className={sentimentColors[email.sentiment]} 
            data-testid="sentiment-badge"
          >
            {email.sentiment.charAt(0).toUpperCase() + email.sentiment.slice(1)}
          </Badge>
        </div>
      </div>
      
      <h3 className="font-medium text-foreground mb-2" data-testid="email-subject">
        {email.subject}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid="email-body">
        {email.body}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{format(new Date(email.processed || email.sentDate), 'MMM dd, HH:mm')}</span>
          </span>
        </div>
        <Button 
          variant="link" 
          size="sm" 
          className="h-auto p-0 text-primary hover:underline"
          data-testid="view-response-btn"
          disabled={email.responseStatus === 'pending'}
        >
          {email.responseStatus === 'sent' ? 'View Sent' : 
           email.responseStatus === 'generated' ? 'View Response' : 
           'Generating...'}
        </Button>
      </div>
    </Card>
  );
}
