import React, { useMemo, useState } from "react";
import { NavLink } from "react-router";

type LinkMenuItem = {
  id?: string;
  label?: string;
  linkType?: "internal" | "external";
  pageSlug?: string;
  externalUrl?: string;
  openInNewTab?: boolean;
};

type LinkNodeProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  underline?: "always" | "hover" | "none";
  color?: "inherit" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  linkType?: "internal" | "external";
  pageSlug?: string;
  externalUrl?: string;
  openInNewTab?: boolean;
  enableHoverMenu?: boolean;
  hoverMenuItems?: LinkMenuItem[];
  hoverMenuLayout?: "dropdown" | "mega";
  hoverMenuColumns?: number;
  hoverMenuMinWidth?: number;
  isDesignMode?: boolean;
  resolveInternalHref?: (slug: string) => string;
  onNavigateToPageSlug?: (slug: string) => void;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

const resolveLinkHref = (
  itemLinkType: "internal" | "external",
  itemPageSlug: string,
  itemExternalUrl: string,
  resolveInternalHref?: (slug: string) => string,
) => {
  if (itemLinkType === "external") return itemExternalUrl || "#";
  return resolveInternalHref ? resolveInternalHref(itemPageSlug || "/") : itemPageSlug || "#";
};

export const LinkNode = ({
  children,
  className,
  style,
  underline,
  color,
  linkType = "internal",
  pageSlug = "/",
  externalUrl = "",
  openInNewTab = false,
  enableHoverMenu = false,
  hoverMenuItems = [],
  hoverMenuLayout = "dropdown",
  hoverMenuColumns = 3,
  hoverMenuMinWidth = 640,
  isDesignMode = false,
  resolveInternalHref,
  onNavigateToPageSlug,
  onClick,
}: LinkNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasHoverItems =
    !isDesignMode &&
    enableHoverMenu &&
    Array.isArray(hoverMenuItems) &&
    hoverMenuItems.length > 0;
  const isHoverMenuTrigger = enableHoverMenu;
  const isNonInteractive = isDesignMode || isHoverMenuTrigger;

  const mainHref = useMemo(
    () =>
      resolveLinkHref(
        linkType,
        pageSlug || "/",
        externalUrl || "",
        resolveInternalHref,
      ),
    [externalUrl, linkType, pageSlug, resolveInternalHref],
  );

  const handleMainClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    if (isDesignMode) {
      event.preventDefault();
      return;
    }
    if (linkType === "internal" && pageSlug && onNavigateToPageSlug) {
      event.preventDefault();
      onNavigateToPageSlug(pageSlug);
      return;
    }
    if (linkType === "external" && !externalUrl) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {isNonInteractive ? (
        <span className={className} style={style}>
          {children}
        </span>
      ) : (
        <NavLink
          className={className}
          style={style}
          to={mainHref}
          target={linkType === "external" && openInNewTab ? "_blank" : undefined}
          rel={linkType === "external" && openInNewTab ? "noopener noreferrer" : undefined}
          reloadDocument={linkType === "external"}
          onClick={handleMainClick}
        >
          {children}
        </NavLink>
      )}

      {hasHoverItems && isOpen ? (
        <div
          className="absolute left-0 top-full z-30 rounded-md border border-gray-200 bg-white p-2 shadow-lg"
          style={
            hoverMenuLayout === "mega"
              ? { minWidth: `${Math.max(240, Number(hoverMenuMinWidth) || 640)}px` }
              : undefined
          }
        >
          <div
            className={hoverMenuLayout === "mega" ? "grid gap-1" : "flex flex-col gap-1"}
            style={
              hoverMenuLayout === "mega"
                ? {
                    gridTemplateColumns: `repeat(${Math.max(
                      1,
                      Math.min(6, Number(hoverMenuColumns) || 3),
                    )}, minmax(0, 1fr))`,
                  }
                : undefined
            }
          >
            {hoverMenuItems.map((item, index) => {
              const itemType = item.linkType || (item.externalUrl ? "external" : "internal");
              const itemPageSlug = item.pageSlug || "/";
              const itemExternalUrl = item.externalUrl || "";
              const itemHref = resolveLinkHref(
                itemType,
                itemPageSlug,
                itemExternalUrl,
                resolveInternalHref,
              );
              const itemLabel = item.label || `Menu Link ${index + 1}`;
              const itemNewTab = Boolean(item.openInNewTab);

              return (
                <NavLink
                  key={item.id || `${itemLabel}-${index}`}
                  to={itemHref}
                  target={itemType === "external" && itemNewTab ? "_blank" : undefined}
                  rel={itemType === "external" && itemNewTab ? "noopener noreferrer" : undefined}
                  className="rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(event) => {
                    if (isDesignMode) {
                      event.preventDefault();
                      return;
                    }
                    if (itemType === "internal" && itemPageSlug && onNavigateToPageSlug) {
                      event.preventDefault();
                      onNavigateToPageSlug(itemPageSlug);
                    }
                  }}
                >
                  {itemLabel}
                </NavLink>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
