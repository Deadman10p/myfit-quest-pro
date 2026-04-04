import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";
import { Bell, Check, Trophy, Flame, Star, Megaphone, Zap, Gift, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, React.ReactNode> = {
  achievement: <Trophy className="w-4 h-4" />,
  challenge: <Star className="w-4 h-4" />,
  streak: <Flame className="w-4 h-4" />,
  reminder: <Bell className="w-4 h-4" />,
  announcement: <Megaphone className="w-4 h-4" />,
  update: <Zap className="w-4 h-4" />,
  feedback: <MessageCircle className="w-4 h-4" />,
  birthday: <Gift className="w-4 h-4" />,
};

const NotificationsScreen: React.FC = () => {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Notifications</h2>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs touch-target">
            <Check className="w-3 h-3 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => (
            <motion.button
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => markRead(notif.id)}
              className={cn(
                "w-full text-left bg-card rounded-xl p-4 border transition-colors touch-target",
                notif.read ? "border-border opacity-70" : "border-primary/30"
              )}
              aria-label={`${notif.read ? "Read" : "Unread"}: ${notif.title}`}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  notif.read ? "bg-secondary text-muted-foreground" : "bg-primary/20 text-primary")}>
                  {typeIcons[notif.type] || <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{notif.title}</h3>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(notif.date).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;
