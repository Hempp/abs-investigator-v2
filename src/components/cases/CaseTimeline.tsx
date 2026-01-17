'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  Mail,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Plus,
  Clock,
} from 'lucide-react';
import { CaseTimelineEvent } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, Badge } from '@/components/ui';

interface CaseTimelineProps {
  events: CaseTimelineEvent[];
  className?: string;
}

const eventIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  created: Plus,
  letter_generated: FileText,
  letter_sent: Mail,
  response_received: MessageSquare,
  status_change: RefreshCw,
  note_added: MessageSquare,
  document_added: FileText,
  reminder_set: Clock,
};

const eventColors: Record<string, string> = {
  created: 'bg-blue-500',
  letter_generated: 'bg-purple-500',
  letter_sent: 'bg-orange-500',
  response_received: 'bg-green-500',
  status_change: 'bg-yellow-500',
  note_added: 'bg-gray-500',
  document_added: 'bg-indigo-500',
  reminder_set: 'bg-pink-500',
};

export function CaseTimeline({ events, className }: CaseTimelineProps) {
  // Sort events by date, newest first
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={cn('relative', className)}>
      {/* Timeline Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4">
        {sortedEvents.map((event, index) => {
          const Icon = eventIcons[event.type] || AlertCircle;
          const color = eventColors[event.type] || 'bg-gray-500';

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex gap-4 pl-2"
            >
              {/* Icon Circle */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center w-5 h-5 rounded-full text-white',
                  color
                )}
              >
                <Icon className="h-3 w-3" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(event.date)}
                  </span>
                </div>

                {event.status && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Status: {event.status.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {events.length === 0 && (
        <Card className="p-6 text-center">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No timeline events yet</p>
        </Card>
      )}
    </div>
  );
}
