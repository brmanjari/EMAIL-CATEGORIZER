import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmails } from "@/hooks/useEmails";

export function PriorityQueue() {
  const { data: emails, isLoading } = useEmails({ priority: 'urgent' });

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Priority Queue</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const urgentEmails = emails?.filter(email => email.priority === 'urgent').slice(0, 3) || [];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Priority Queue</h3>
      <div className="space-y-3">
        {urgentEmails.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No urgent emails in queue
          </div>
        ) : (
          urgentEmails.map((email) => {
            const getStatusColor = () => {
              switch (email.responseStatus) {
                case 'pending':
                  return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700';
                case 'generated':
                  return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700';
                case 'sent':
                  return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700';
                case 'failed':
                  return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700';
                default:
                  return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700';
              }
            };

            const getStatusText = () => {
              switch (email.responseStatus) {
                case 'pending':
                  return 'Queued';
                case 'generated':
                  return 'Ready';
                case 'sent':
                  return 'Sent';
                case 'failed':
                  return 'Failed';
                default:
                  return 'Pending';
              }
            };

            // Extract short issue description from subject
            const issueDescription = email.subject
              .replace(/^(urgent|critical|immediate|help|support|request|query):\s*/i, '')
              .substring(0, 30) + (email.subject.length > 30 ? '...' : '');

            return (
              <div 
                key={email.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${getStatusColor()}`}
                data-testid="queue-item-urgent"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium text-foreground">
                    {issueDescription}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {getStatusText()}
                </Badge>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
