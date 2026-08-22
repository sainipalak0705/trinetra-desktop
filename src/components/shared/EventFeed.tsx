import { useEffect, useRef } from 'react';
import { useTrinetraStore } from '../../store/useTrinetraStore';

const AGENT_COLORS: Record<string, string> = {
  'WATCHDOG': '#ff0040',
  'RISK ANALYSER': '#ffaa00',
  'POLICY ENGINE': '#00aaff',
  'ENFORCER': '#aa00ff',
  'VAULTKEEPER': '#00ff88',
  'GATEKEEPER': '#ff6600',
  'SYSTEM': '#7a7a9a',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff0040',
  high: '#ff6600',
  medium: '#ffaa00',
  low: '#3a3a5a',
};

interface EventFeedProps {
  maxHeight?: string;
  showSeverity?: boolean;
  limit?: number;
}

export function EventFeed({ maxHeight = '180px', showSeverity = false, limit = 100 }: EventFeedProps) {
  const events = useTrinetraStore((s) => s.events);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length]);

  const displayed = events.slice(0, limit);

  return (
    <div
      ref={scrollRef}
      className="event-feed overflow-y-auto"
      style={{ maxHeight }}
    >
      {displayed.map((evt) => (
        <div
          key={evt.id}
          className="event-item"
          style={{ animationDelay: '0ms' }}
        >
          <span className="event-time">{evt.time}</span>
          <span
            className="event-agent"
            style={{ color: AGENT_COLORS[evt.agent] || '#7a7a9a', minWidth: '110px' }}
          >
            {evt.agent}
          </span>
          {showSeverity && (
            <span
              style={{
                color: SEVERITY_COLORS[evt.severity],
                fontSize: '9px',
                fontWeight: 700,
                minWidth: '50px',
                letterSpacing: '0.1em',
              }}
            >
              {evt.severity.toUpperCase()}
            </span>
          )}
          <span className="event-msg">{evt.message}</span>
        </div>
      ))}
      {displayed.length === 0 && (
        <div className="event-item" style={{ color: '#3a3a5a' }}>
          <span>Awaiting events...</span>
        </div>
      )}
    </div>
  );
}
