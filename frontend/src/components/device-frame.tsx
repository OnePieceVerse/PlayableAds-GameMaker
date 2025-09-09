"use client";

import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Orientation = "vertical" | "horizontal";
// Inner screen visible area (portrait) in pixels inside the phone frame
const BASE_DIM = { w: 423, h: 762 };
const ORI_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACACAMAAAD9CzGDAAAAY1BMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+aRQ2gAAAAIHRSTlMAf78/643R28eyZ19TNBK6SPPlh+CnmpJyJ596IASvGahDLtcAAAHnSURBVHja7dvpasJgEIXhE7OY3RjrXttz/1dZCk6ziRg136Qw7y8DDjwQJxKJGFRs4mXAe6Ep2y75StEpxbA0pvQAYs/XWw0IETkCEfAdLdEp5EN13/56B7SKOArxzXeFpuXImXwCxJ5NsXev68Du/YiK0i4v8UiL9yNW8ln1ASghsuuxB+ghYtlZRURxPSw0EWe5bCgi5Gx8KiLkQvUBRYR8FX3pImQ/n0H4eDbPEIYwxD9FlO4Ri/TSQRRh7h6RsQ6Pf4g8YaRxOj5IJlfE7+uDBmLDTutSA3Fkp73Odmw7iEIHUbFVonWdiNmUayHSxhBBC3EJKB3UEAib/dRDHJv91EPgS/ZTE1HJb1iaCESyn5qIVG7ANBGXNcmzJkK29FsbcSRP0EYgYaGPqGLoI5DNAQFDGMIQM0WU4Srg0y3GtEur2wg/oMu2txAZXTdEfK7puvONu3L3VX1EwnbeVLFd2EfUbIepYruoj6ACgoYwhCEMYQhDGMIQhjCEIQwBQ8iMIWTGEDJjCJkxhMwYQmYMITOGwFTxVoYwhCEMYYhxiGAOiGQOCH8GiB30ERtoI6JTBjUEmgwxP0StgAjQK2G7xVTd/0P7hu4L0UnlcZagRL+MrvPRTeERpzrHIHnYy0311sOgHzr5wcea1oBCAAAAAElFTkSuQmCC";
// Local phone frame images
const PHONE_VERTICAL_URL = "/images/phone-vertical.png";
const PHONE_HORIZONTAL_URL = "/images/phone-horizontal.png";

export function DeviceFrame({
  children,
  className,
  defaultOrientation = "vertical",
}: {
  children: React.ReactNode;
  className?: string;
  defaultOrientation?: Orientation;
}) {
  const [orientation, setOrientation] = useState<Orientation>(defaultOrientation);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const screenContentRef = useRef<HTMLDivElement | null>(null);
  const [landscapeIframeHeight, setLandscapeIframeHeight] = useState<number>(423);
  const [refreshTick, setRefreshTick] = useState(0);

  // Enforce portrait-only preview
  useEffect(() => {
    if (orientation !== "vertical") setOrientation("vertical");
  }, [orientation]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scale, dims, outer, padUsed, frameUrl } = useMemo(() => {
    const isPortrait = orientation === "vertical";
    const screen = isPortrait ? { w: 423, h: 762 } : { w: 762, h: 423 };
    const p = isPortrait
      ? { top: 0.10, bottom: 0.07, left: 0.065, right: 0.065 }
      : { top: 0.08, bottom: 0.08, left: 0.08, right: 0.08 };
    const frameUrl = isPortrait ? PHONE_VERTICAL_URL : PHONE_HORIZONTAL_URL;
    const dw = screen.w;
    const dh = screen.h;
    const outerW = Math.round(dw / (1 - p.left - p.right));
    const outerH = Math.round(dh / (1 - p.top - p.bottom));
    const { w: cw, h: ch } = containerSize;
    if (cw === 0 || ch === 0) return { scale: 1, dims: { w: dw, h: dh }, outer: { w: outerW, h: outerH }, padUsed: p, frameUrl } as any;
    let s = Math.min(cw / outerW, ch / outerH);
    // Portrait：略缩小避免贴边；横屏：尽量占满可用宽度/高度（不变形）
    if (isPortrait) {
      s *= 0.95;
    } else {
      s *= 1.05; // nudge to better utilize width
    }
    if (s > 2) s = 2;
    return { scale: s, dims: { w: dw, h: dh }, outer: { w: outerW, h: outerH }, padUsed: p, frameUrl } as any;
  }, [orientation, containerSize]);

  const adjustedChild = useMemo(() => {
    if (React.isValidElement(children)) {
      const extraStyle = orientation === "horizontal" ? { height: `${landscapeIframeHeight}px`, width: "100%" } : {};
      return React.cloneElement(children as any, {
        key: refreshTick,
        style: { ...(children as any).props?.style, ...extraStyle },
      });
    }
    return children;
  }, [children, orientation, landscapeIframeHeight, refreshTick]);

  useEffect(() => {
    if (!screenContentRef.current) return;
    const el = screenContentRef.current;
    const update = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const newH = rect.width * (423 / 762);
      setLandscapeIframeHeight(newH);
    };
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [orientation]);
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="rounded-xl border overflow-hidden">
        <div className="grid grid-cols-[88px_1fr] h-[740px] bg-background/50">
          <aside className="bg-neutral-800 text-neutral-200 h-full p-3 flex flex-col items-center gap-6">
            <img src={ORI_ICON} alt="方向" className="w-8 h-8 opacity-90" />
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                aria-label="竖屏"
                onClick={() => setOrientation("vertical")}
                className={cn(
                  "rounded-md px-2 py-1 transition text-sm",
                  "opacity-100 ring-2 ring-white/70"
                )}
              >
                竖屏
              </button>
              <button
                type="button"
                aria-label="横屏（禁用）"
                disabled
                className="rounded-md px-2 py-1 text-sm opacity-40 cursor-not-allowed"
              >
                横屏
              </button>
              <button
                type="button"
                aria-label="刷新"
                onClick={() => setRefreshTick((v) => v + 1)}
                className="rounded-md mt-8 px-2 py-1 text-sm opacity-90 hover:opacity-100 inline-flex items-center gap-1.5"
              >
                <RotateCw className="size-8" aria-hidden="true" />
              </button>
            </div>
          </aside>
          <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center">
            <div
              style={{
                width: `${outer.w}px`,
                height: `${outer.h}px`,
                transform: `scale(${scale})`,
                transformOrigin: "center",
              }}
              className="relative"
            >
              <img
                src={frameUrl}
                alt="phone frame"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              />
              <div
                className="absolute"
                style={{
                  left: `${padUsed.left * 100}%`,
                  right: `${padUsed.right * 100}%`,
                  top: `${padUsed.top * 100}%`,
                  bottom: `${padUsed.bottom * 100}%`,
                }}
              >
                <div ref={screenContentRef} className="relative w-full h-full overflow-hidden rounded-md bg-background shadow-sm">
                  {adjustedChild}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


