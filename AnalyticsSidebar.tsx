import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp,
  Download,
  Filter,
  BarChart3,
  Layers,
  Bot
} from "lucide-react";
import { useEmailStats } from "@/hooks/useEmails";

export function AnalyticsSidebar() {
  const { data: stats, isLoading } = useEmailStats();

  const handleExportData = () => {
    // TODO: Implement actual export functionality
    console.log('Exporting data...');
  };

  const handleConfigureFilters = () => {
    // TODO: Implement filter configuration
    console.log('Configuring filters...');
  };

  const handleBulkResponse = () => {
    // TODO: Implement bulk response functionality
    console.log('Bulk response...');
  };

  const handleAdvancedAnalytics = () => {
    // TODO: Implement advanced analytics view
    console.log('Advanced analytics...');
  };

  return (
    <div className="space-y-6">
      {/* Analytics Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Email Trends</h3>
        <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center mb-4">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground mb-2 mx-auto" />
            <p className="text-sm text-muted-foreground">Interactive Chart</p>
            <p className="text-xs text-muted-foreground">Chart.js implementation</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary" data-testid="today-count">
                {Math.floor(stats.totalEmails * 0.4)}
              </div>
              <div className="text-muted-foreground">Today</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600" data-testid="week-count">
                {stats.totalEmails}
              </div>
              <div className="text-muted-foreground">This Week</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Failed to load analytics
          </div>
        )}
      </Card>

      {/* AI Response Preview */}
      <Card className="p-6" data-testid="ai-response-panel">
        <h3 className="text-lg font-semibold text-foreground mb-4">AI Response System</h3>
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">System Status</span>
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center justify-between">
              <span>Model:</span>
              <span className="font-medium text-foreground">GPT-5</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className="text-green-600 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Processed Today:</span>
              <span className="font-medium text-foreground">
                {isLoading ? '...' : stats?.resolvedEmails || 0}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            className="flex-1"
            data-testid="ai-status-btn"
            disabled
          >
            <Bot className="w-3 h-3 mr-1" />
            AI Active
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={handleBulkResponse}
            data-testid="bulk-response-btn"
          >
            <Layers className="w-4 h-4 mr-2" />
            Bulk Response
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleExportData}
            data-testid="export-data-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleConfigureFilters}
            data-testid="configure-filters-btn"
          >
            <Filter className="w-4 h-4 mr-2" />
            Configure Filters
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleAdvancedAnalytics}
            data-testid="view-analytics-btn"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Advanced Analytics
          </Button>
        </div>
      </Card>
    </div>
  );
}
