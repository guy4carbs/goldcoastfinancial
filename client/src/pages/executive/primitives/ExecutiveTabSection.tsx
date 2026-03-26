/**
 * Executive Tab Section — Styled Tabs wrapper with orange/amber active states
 * Heritage Design System — Orange/Amber theme
 */

import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RADIUS, COLORS } from '@/lib/heritageDesignSystem';
import { cn } from '@/lib/utils';

interface Tab {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface ExecutiveTabSectionProps {
  defaultValue: string;
  tabs: Tab[];
  children: ReactNode;
  className?: string;
}

export function ExecutiveTabSection({
  defaultValue,
  tabs,
  children,
  className,
}: ExecutiveTabSectionProps) {
  return (
    <Tabs defaultValue={defaultValue} className={cn('w-full', className)}>
      <TabsList
        className="h-auto w-auto inline-flex"
        style={{
          backgroundColor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: RADIUS.card,
          padding: 4,
          border: `1px solid ${COLORS.gray[200]}`,
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'font-medium text-stone-500',
                'transition-colors transition-[background-color] duration-150',
                'data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-sm',
              )}
              style={{
                borderRadius: RADIUS.button,
              }}
            >
              {Icon && (
                <Icon
                  style={{ width: 16, height: 16, marginRight: 6 }}
                  aria-hidden="true"
                />
              )}
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
}

export { TabsContent };

export default ExecutiveTabSection;
