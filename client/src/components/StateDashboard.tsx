import { Activity } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Stats {
  visited: number;
  total: number;
  percentage: number;
}

interface StateDashboardProps {
  stats: Stats;
  activities: Activity[];
  onReset: () => void;
  onShare: () => void;
  loading: boolean;
}

const StateDashboard = ({
  stats,
  activities,
  onReset,
  onShare,
  loading
}: StateDashboardProps) => {
  if (loading) {
    return (
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">Your Statistics</h2>
          
          <div className="mb-6">
            <div className="flex items-end justify-between mb-2">
              <h3 className="text-lg font-medium">Overall Progress</h3>
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="w-full h-2.5 rounded-full" />
            <Skeleton className="mt-2 h-4 w-40" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">Your Statistics</h2>
        
        {/* Progress overview */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <h3 className="text-lg font-medium">Overall Progress</h3>
            <p className="text-3xl font-bold text-blue-500">{stats.percentage}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full" 
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-500">{stats.visited} of {stats.total} states visited</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">Visited</h4>
            <p className="text-2xl font-bold text-emerald-500">{stats.visited}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">Remaining</h4>
            <p className="text-2xl font-bold text-red-500">{stats.total - stats.visited}</p>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No activity yet. Start by clicking on states you've visited!</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between text-sm p-2 border-b border-gray-100">
                  <span className="flex items-center space-x-1">
                    <span className={activity.action === "visited" ? "text-emerald-500" : "text-red-500"}>•</span>
                    <span>
                      {activity.stateName} {activity.action === "visited" ? "marked as visited" : "unmarked"}
                    </span>
                  </span>
                  <span className="text-gray-400 text-xs">
                    {format(new Date(activity.timestamp), "h:mm a")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button 
            variant="outline"
            className="w-full"
            onClick={onReset}
          >
            Reset All States
          </Button>
          <Button 
            variant="default"
            className="w-full"
            onClick={onShare}
          >
            Share Your Map
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StateDashboard;
