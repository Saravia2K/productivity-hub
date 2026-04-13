import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'

interface SidebarNavItemProps {
  label: string
  collapsed: boolean
  children: React.ReactNode
  itemKey: string
}

export function SidebarNavItem({ label, collapsed, children, itemKey }: SidebarNavItemProps) {
  if (collapsed) {
    return (
      <Tooltip key={itemKey}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return <div key={itemKey}>{children}</div>
}
