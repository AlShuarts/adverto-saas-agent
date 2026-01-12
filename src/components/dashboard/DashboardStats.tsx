import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, CheckCircle2, Video, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    publishedListings: 0,
    slideshows: 0,
    banners: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all stats in parallel
      const [listingsRes, publishedRes, slideshowsRes, bannersRes] = await Promise.all([
        supabase.from("listings").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("listings").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_published", true),
        supabase.from("slideshow_renders").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "done"),
        supabase.from("sold_banner_renders").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "done"),
      ]);

      setStats({
        totalListings: listingsRes.count || 0,
        publishedListings: publishedRes.count || 0,
        slideshows: slideshowsRes.count || 0,
        banners: bannersRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: "Annonces totales", 
      value: stats.totalListings, 
      icon: Building2,
      color: "text-primary"
    },
    { 
      label: "Publiées", 
      value: stats.publishedListings, 
      icon: CheckCircle2,
      color: "text-green-500"
    },
    { 
      label: "Diaporamas créés", 
      value: stats.slideshows, 
      icon: Video,
      color: "text-purple-500"
    },
    { 
      label: "Bannières créées", 
      value: stats.banners, 
      icon: Image,
      color: "text-orange-500"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
