import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge, UserBadge } from "@shared/schema";
import { BadgeGrid } from "./BadgeGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Trophy, Medal } from "lucide-react";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";

const badgeCategories = [
  { id: "all", label: "All Badges" },
  { id: "milestone", label: "Milestones", icon: Trophy },
  { id: "regional", label: "Regional", icon: Medal },
  { id: "special", label: "Special", icon: Award },
];

interface BadgesSectionProps {
  userId: string;
}

interface BadgeResponse {
  newBadgesEarned: boolean;
  badges: Badge[];
}

export function BadgesSection({ userId }: BadgesSectionProps) {
  const { toast } = useToast();
  
  // Fetch all badges
  const badgesQuery = useQuery({
    queryKey: ['/api/badges'],
    queryFn: getQueryFn<Badge[]>({
      on401: "returnNull"
    }),
  });
  
  // Fetch user badges
  const userBadgesQuery = useQuery({
    queryKey: ['/api/user-badges', userId],
    queryFn: getQueryFn<{badge: Badge, userBadge: UserBadge}[]>({
      on401: "returnNull"
    }),
    enabled: !!userId,
  });
  
  // Check for new badges mutation
  const checkBadgesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest<BadgeResponse>(`/api/check-badges/${userId}`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data: BadgeResponse) => {
      if (data.newBadgesEarned) {
        // Show a toast for each new badge
        data.badges.forEach((badge: Badge) => {
          toast({
            title: `🏆 New Badge Earned!`,
            description: `You've earned the "${badge.name}" badge: ${badge.description}`,
            variant: "default",
          });
        });
        
        // Invalidate user badges query to refetch
        queryClient.invalidateQueries({ queryKey: ['/api/user-badges', userId] });
        queryClient.invalidateQueries({ queryKey: ['/api/activities', userId] });
      } else {
        toast({
          title: "No new badges",
          description: "Keep exploring to earn more badges!",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error checking badges",
        description: "There was an error checking for new badges.",
        variant: "destructive",
      });
      console.error("Error checking badges:", error);
    },
  });
  
  // Filter badges by category
  const getBadgesByCategory = (category: string) => {
    if (!badgesQuery.data) return [];
    if (category === 'all') return badgesQuery.data;
    return badgesQuery.data.filter(badge => badge.category === category);
  };
  
  // Get earned badges count
  const earnedBadgesCount = userBadgesQuery.data?.length || 0;
  const totalBadgesCount = badgesQuery.data?.length || 0;
  const earnedPercentage = totalBadgesCount > 0 
    ? Math.round((earnedBadgesCount / totalBadgesCount) * 100) 
    : 0;
  
  // Loading state
  if (badgesQuery.isLoading || (userId && userBadgesQuery.isLoading)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Badges</CardTitle>
          <CardDescription>Please wait while we fetch your badges...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (badgesQuery.isError || (userId && userBadgesQuery.isError)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Badges</CardTitle>
          <CardDescription>There was an error loading the badges.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              badgesQuery.refetch();
              if (userId) userBadgesQuery.refetch();
            }}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle className="text-2xl">Achievements</CardTitle>
            <CardDescription>
              Track your exploration milestones and unlock badges for your adventures
            </CardDescription>
          </div>
          
          {userId && (
            <Button
              onClick={() => checkBadgesMutation.mutate()}
              disabled={checkBadgesMutation.isPending}
              size="sm"
              className="h-8"
            >
              {checkBadgesMutation.isPending ? "Checking..." : "Check for new badges"}
            </Button>
          )}
        </div>
        
        {userId && (
          <div className="flex flex-wrap items-center mt-2 gap-2">
            <BadgeUI variant="outline" className="px-2 py-1">
              <Trophy className="h-3.5 w-3.5 mr-1" />
              {earnedBadgesCount} of {totalBadgesCount} badges earned ({earnedPercentage}%)
            </BadgeUI>
          </div>
        )}
      </CardHeader>
      
      <Tabs defaultValue="all">
        <CardContent className="pb-1 pt-0">
          <TabsList className="mb-4">
            {badgeCategories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
                {category.icon && <category.icon className="h-4 w-4" />}
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardContent>
        
        {badgeCategories.map(category => (
          <TabsContent key={category.id} value={category.id} className="m-0">
            <CardContent>
              <BadgeGrid 
                badges={getBadgesByCategory(category.id)}
                earnedBadges={userBadgesQuery.data || []}
                emptyMessage={`No ${category.label.toLowerCase()} badges available`}
              />
            </CardContent>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}