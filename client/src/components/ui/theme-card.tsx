import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export type ThemeColor = 'blue' | 'red' | 'green' | 'purple' | 'amber' | 'teal' | 'indigo' | 'yellow';

interface ThemeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  color: ThemeColor;
  glowIntensity?: 'low' | 'medium' | 'high';
  children: React.ReactNode;
  className?: string;
  withGlowEffect?: boolean;
}

export function ThemeCard({ 
  color, 
  glowIntensity = 'medium', 
  children, 
  className,
  withGlowEffect = true,
  ...props 
}: ThemeCardProps) {
  // Updated color map to use futuristic theme colors
  const colorMap = {
    blue: {
      border: 'border-[#00E5FF]/30',
      glow: 'bg-[#00E5FF]/10',
      secondaryGlow: 'bg-[#14B8A6]/10',
      title: 'text-[#00E5FF]'
    },
    red: {
      border: 'border-[#EF4444]/30',
      glow: 'bg-[#EF4444]/10',
      secondaryGlow: 'bg-[#F59E0B]/10',
      title: 'text-[#EF4444]'
    },
    green: {
      border: 'border-[#10B981]/30',
      glow: 'bg-[#10B981]/10',
      secondaryGlow: 'bg-[#14B8A6]/10',
      title: 'text-[#10B981]'
    },
    purple: {
      border: 'border-[#8B5CF6]/30',
      glow: 'bg-[#8B5CF6]/10',
      secondaryGlow: 'bg-[#6366F1]/10',
      title: 'text-[#8B5CF6]'
    },
    amber: {
      border: 'border-[#F59E0B]/30',
      glow: 'bg-[#F59E0B]/10',
      secondaryGlow: 'bg-[#EAB308]/10',
      title: 'text-[#F59E0B]'
    },
    teal: {
      border: 'border-[#14B8A6]/30',
      glow: 'bg-[#14B8A6]/10',
      secondaryGlow: 'bg-[#00E5FF]/10',
      title: 'text-[#14B8A6]'
    },
    indigo: {
      border: 'border-[#6366F1]/30',
      glow: 'bg-[#6366F1]/10',
      secondaryGlow: 'bg-[#00E5FF]/10',
      title: 'text-[#6366F1]'
    },
    yellow: {
      border: 'border-[#EAB308]/30',
      glow: 'bg-[#EAB308]/10',
      secondaryGlow: 'bg-[#F59E0B]/10',
      title: 'text-[#EAB308]'
    }
  };

  const glowSizes = {
    low: { primary: 'h-32 w-32', secondary: 'h-24 w-24' },
    medium: { primary: 'h-40 w-40', secondary: 'h-32 w-32' },
    high: { primary: 'h-48 w-48', secondary: 'h-40 w-40' }
  };
  
  return (
    <Card 
      className={cn(
        "shadow-md relative overflow-hidden bg-black/10 backdrop-blur-sm", 
        colorMap[color].border,
        "animate-border-glow",
        className
      )}
      style={{ 
        "--border-glow-color": color === 'blue' ? '0, 229, 255' : 
                            color === 'red' ? '239, 68, 68' : 
                            color === 'green' ? '16, 185, 129' : 
                            color === 'purple' ? '139, 92, 246' : 
                            color === 'amber' ? '245, 158, 11' : 
                            color === 'teal' ? '20, 184, 166' : 
                            color === 'indigo' ? '99, 102, 241' : '234, 179, 8'
      } as React.CSSProperties}
      {...props}
    >
      {withGlowEffect && (
        <>
          <div className={cn(
            "absolute -top-20 -right-20 blur-xl rounded-full animate-glow-pulse", 
            colorMap[color].glow,
            glowSizes[glowIntensity].primary
          )}
          style={{
            "--glow-color": `rgba(${
              color === 'blue' ? '0, 229, 255' : 
              color === 'red' ? '239, 68, 68' : 
              color === 'green' ? '16, 185, 129' : 
              color === 'purple' ? '139, 92, 246' : 
              color === 'amber' ? '245, 158, 11' : 
              color === 'teal' ? '20, 184, 166' : 
              color === 'indigo' ? '99, 102, 241' : '234, 179, 8'
            }, 0.5)`
          } as React.CSSProperties}
          ></div>
          <div className={cn(
            "absolute -bottom-20 -left-20 blur-xl rounded-full animate-glow-pulse-fast", 
            colorMap[color].secondaryGlow,
            glowSizes[glowIntensity].secondary
          )}
          style={{
            "--glow-color": `rgba(${
              color === 'blue' ? '20, 184, 166' : 
              color === 'red' ? '245, 158, 11' : 
              color === 'green' ? '20, 184, 166' : 
              color === 'purple' ? '99, 102, 241' : 
              color === 'amber' ? '234, 179, 8' : 
              color === 'teal' ? '0, 229, 255' : 
              color === 'indigo' ? '0, 229, 255' : '245, 158, 11'
            }, 0.5)`
          } as React.CSSProperties}></div>
        </>
      )}
      {children}
    </Card>
  );
}

interface ThemeCardTitleProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  color: ThemeColor;
  description?: React.ReactNode;
}

export function ThemeCardTitle({ icon, children, color, description }: ThemeCardTitleProps) {
  // Updated to use futuristic theme colors
  const colorMap = {
    blue: 'text-[#00E5FF]',
    red: 'text-[#EF4444]',
    green: 'text-[#10B981]',
    purple: 'text-[#8B5CF6]',
    amber: 'text-[#F59E0B]',
    teal: 'text-[#14B8A6]',
    indigo: 'text-[#6366F1]',
    yellow: 'text-[#EAB308]'
  };
  
  return (
    <CardHeader className="pb-2">
      <CardTitle 
        className={cn(
          "text-lg flex items-center animate-text-glow", 
          colorMap[color]
        )}
        style={{
          "--text-glow-color": `${
            color === 'blue' ? '0, 229, 255' : 
            color === 'red' ? '239, 68, 68' : 
            color === 'green' ? '16, 185, 129' : 
            color === 'purple' ? '139, 92, 246' : 
            color === 'amber' ? '245, 158, 11' : 
            color === 'teal' ? '20, 184, 166' : 
            color === 'indigo' ? '99, 102, 241' : '234, 179, 8'
          }`
        } as React.CSSProperties}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
  );
}

interface ThemeInfoBoxProps {
  color: ThemeColor;
  children: React.ReactNode;
  className?: string;
}

export function ThemeInfoBox({ color, children, className }: ThemeInfoBoxProps) {
  // Updated to use futuristic theme colors
  const colorMap = {
    blue: { bg: 'bg-[#00E5FF]/5', border: 'border-[#00E5FF]/20' },
    red: { bg: 'bg-[#EF4444]/5', border: 'border-[#EF4444]/20' },
    green: { bg: 'bg-[#10B981]/5', border: 'border-[#10B981]/20' },
    purple: { bg: 'bg-[#8B5CF6]/5', border: 'border-[#8B5CF6]/20' },
    amber: { bg: 'bg-[#F59E0B]/5', border: 'border-[#F59E0B]/20' },
    teal: { bg: 'bg-[#14B8A6]/5', border: 'border-[#14B8A6]/20' },
    indigo: { bg: 'bg-[#6366F1]/5', border: 'border-[#6366F1]/20' },
    yellow: { bg: 'bg-[#EAB308]/5', border: 'border-[#EAB308]/20' }
  };
  
  return (
    <div className={cn(
      "p-2 rounded-lg backdrop-blur-sm text-xs text-gray-400 animate-border-glow",
      colorMap[color].bg, 
      colorMap[color].border,
      className
    )}
    style={{
      "--border-glow-color": `${
        color === 'blue' ? '0, 229, 255' : 
        color === 'red' ? '239, 68, 68' : 
        color === 'green' ? '16, 185, 129' : 
        color === 'purple' ? '139, 92, 246' : 
        color === 'amber' ? '245, 158, 11' : 
        color === 'teal' ? '20, 184, 166' : 
        color === 'indigo' ? '99, 102, 241' : '234, 179, 8'
      }`
    } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// Themed progress bar
interface ThemeProgressProps {
  value: number; 
  max?: number;
  color: ThemeColor;
  className?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  height?: 'sm' | 'md' | 'lg';
  label?: string;
  labelRight?: string;
  animated?: boolean;
}

export function ThemeProgress({ 
  value, 
  max = 100, 
  color, 
  className,
  showValue = false,
  formatValue,
  height = 'md',
  label,
  labelRight,
  animated = true,
}: ThemeProgressProps) {
  // Updated to use futuristic theme colors
  const colorMap = {
    blue: { bg: '#00E5FF', shadow: '#00E5FF' },
    red: { bg: '#EF4444', shadow: '#F87171' },
    green: { bg: '#10B981', shadow: '#10B981' },
    purple: { bg: '#8B5CF6', shadow: '#8B5CF6' },
    amber: { bg: '#F59E0B', shadow: '#F59E0B' },
    teal: { bg: '#14B8A6', shadow: '#14B8A6' },
    indigo: { bg: '#6366F1', shadow: '#6366F1' },
    yellow: { bg: '#EAB308', shadow: '#EAB308' }
  };

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };
  
  const percentage = (value / max) * 100;
  const formattedValue = formatValue ? formatValue(value) : value.toString();
  
  return (
    <div className="w-full">
      {(label || labelRight) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span className="font-medium">{label}</span>}
          {labelRight && <span>{labelRight}</span>}
        </div>
      )}
      <div className={cn("relative", className)}>
        <div className={cn("w-full bg-muted/30 backdrop-blur-sm rounded-full overflow-hidden border border-muted/50", heightClass[height])}>
          <div 
            className={cn(
              "h-full rounded-full",
              animated && "transition-all duration-700",
              "animate-glow-pulse"
            )}
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: colorMap[color].bg,
              boxShadow: `0 0 10px ${colorMap[color].shadow}`,
              "--glow-color": `${colorMap[color].shadow}`
            } as React.CSSProperties}
          />
        </div>
        {showValue && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {formattedValue}
          </span>
        )}
      </div>
    </div>
  );
}