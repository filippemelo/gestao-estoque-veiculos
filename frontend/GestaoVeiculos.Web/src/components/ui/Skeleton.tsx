import { cn } from '@/lib/cn'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'inline-block rounded bg-slate-200/80',
        'motion-safe:animate-pulse motion-reduce:opacity-70',
        className,
      )}
    />
  )
}
