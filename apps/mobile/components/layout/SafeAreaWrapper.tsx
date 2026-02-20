import { PropsWithChildren } from 'react';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '../../lib/utils';

interface SafeAreaWrapperProps extends PropsWithChildren {
  className?: string;
  edges?: Edge[];
}

export function SafeAreaWrapper({
  children,
  className,
  edges = ['top', 'left', 'right'],
}: SafeAreaWrapperProps) {
  return (
    <SafeAreaView edges={edges} className={cn('flex-1 bg-slate-50', className)}>
      {children}
    </SafeAreaView>
  );
}
