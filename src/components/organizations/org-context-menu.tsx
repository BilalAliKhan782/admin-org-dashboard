import type { ReactNode } from "react";
import { Copy, ExternalLink } from "lucide-react";
import type { OrganizationDirectoryItem } from "@/api/organizations";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface OrgContextMenuProps {
  children: ReactNode;
  organization: OrganizationDirectoryItem;
  onCopyId: () => void;
  onView: () => void;
}

export function OrgContextMenu({ children, organization, onCopyId, onView }: OrgContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuLabel>{organization.name}</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onView}>
          <ExternalLink className="h-4 w-4" />
          View details
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopyId}>
          <Copy className="h-4 w-4" />
          Copy ID
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
