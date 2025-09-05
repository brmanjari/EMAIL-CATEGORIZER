import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useEmailStats } from "@/hooks/useEmails";
import type { EmailStats } from "@shared/schema";

export function StatsOverview() {
  const { data: stats, isLoading } = useEmailStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6" data-testid="total-emails-card">
          <div className="text-center text-muted-foreground">
            Failed to load statistics
          </div>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Emails (24h)",
      value: stats.totalEmails.toString(),
      icon: Mail,
      iconBg: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
      trend: "+12%",
      trendLabel: "vs yesterday",
      trendUp: true,
      testId: "total-emails-card"
    },
    {
      title: "Urgent Emails", 
      value: stats.urgentEmails.toString(),
      icon: AlertTriangle,
      iconBg: "bg-red-100 dark:bg-red-900", 
      iconColor: "text-red-600 dark:text-red-400",
      trend: `+${Math.max(0, stats.urgentEmails - 4)} new`,
      trendLabel: "require attention",
      trendUp: false,
      testId: "urgent-emails-card",
      valueColor: "text-destructive"
    },
    {
      title: "Resolved",
      value: stats.resolvedEmails.toString(), 
      icon: CheckCircle,
      iconBg: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400", 
      trend: `${Math.round((stats.resolvedEmails / (stats.totalEmails || 1)) * 100)}%`,
      trendLabel: "resolution rate",
      trendUp: true,
      testId: "resolved-emails-card",
      valueColor: "text-green-600"
    },
    {
      title: "Avg Response Time",
      value: stats.avgResponseTime,
      icon: Clock,
      iconBg: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
      trend: "-15%", 
      trendLabel: "improvement",
      trendUp: true,
      testId: "avg-response-time-card"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.testId} className="p-6" data-testid={stat.testId}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${stat.valueColor || 'text-foreground'}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`${stat.iconColor} w-5 h-5`} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`${stat.trendUp ? 'text-green-600' : 'text-red-600'} font-medium flex items-center`}>
              {stat.trendUp ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {stat.trend}
            </span>
            <span className="text-muted-foreground ml-2">{stat.trendLabel}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
