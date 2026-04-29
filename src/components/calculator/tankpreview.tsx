import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

type Point2D = {
  x: number;
  y: number;
};

type Point3D = {
  x: number;
  y: number;
  z: number;
};

type SetupType = "earthen-pond" | "concrete-pond" | "tank";

type PointerDragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startYaw: number;
  startPitch: number;
};

type PreviewPalette = {
  front: string;
  side: string;
  sideAlt: string;
  base: string;
  waterTop: string;
  waterBottom: string;
  outline: string;
  glow: string;
  sceneTop: string;
  sceneBottom: string;
  ground: string;
  groundAlt: string;
  rim: string;
  frame: string;
  badgeBg: string;
  badgeText: string;
  wallOpacity: number;
  waterOpacity: number;
  waterPatternOpacity: number;
  label: string;
  description: string;
};

type PreviewPolygon3D = {
  key: string;
  points: Point3D[];
  fill: string;
  fillOpacity?: number;
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
};

type PreviewPolygon2D = Omit<PreviewPolygon3D, "points"> & {
  points: Point2D[];
};

type PreviewRing3D = {
  key: string;
  outer: Point3D[];
  inner: Point3D[];
  fill: string;
  fillOpacity?: number;
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
};

type PreviewPath2D = Omit<PreviewRing3D, "outer" | "inner"> & {
  d: string;
};

type PreviewLine3D = {
  key: string;
  start: Point3D;
  end: Point3D;
  stroke: string;
  strokeWidth: number;
  strokeOpacity?: number;
  dashArray?: string;
};

type PreviewLine2D = Omit<PreviewLine3D, "start" | "end"> & {
  start: Point2D;
  end: Point2D;
};

type PreviewScene = {
  stageWidth: number;
  stageHeight: number;
  palette: PreviewPalette;
  backgroundPolygons: PreviewPolygon2D[];
  backgroundPaths: PreviewPath2D[];
  polygons: PreviewPolygon2D[];
  overlayPaths: PreviewPath2D[];
  lines: PreviewLine2D[];
  waterPoints: Point2D[];
  lengthLine: ReturnType<typeof createMeasurementLine>;
  widthLine: ReturnType<typeof createMeasurementLine>;
  depthLine: ReturnType<typeof createMeasurementLine>;
  badgeWidth: number;
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const DEFAULT_VIEW = {
  yaw: -34,
  pitch: 24,
  zoom: 1,
};

const YAW_LIMITS = {
  min: -70,
  max: 70,
};

const PITCH_LIMITS = {
  min: 10,
  max: 55,
};

const ZOOM_LIMITS = {
  min: 0.75,
  max: 1.35,
};

const formatNumber = (value: number) => numberFormatter.format(value);
const formatInteger = (value: number) => integerFormatter.format(value);

const clampValue = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const sanitizeIdFragment = (value: string) =>
  value.replace(/[^a-zA-Z0-9_-]/g, "");

const toPointsAttribute = (points: Point2D[]) =>
  points.map((point) => `${point.x},${point.y}`).join(" ");

const getSurfaceTextureOpacity = (setupType: SetupType, polygonKey: string) => {
  if (polygonKey === "bottom") {
    return setupType === "earthen-pond" ? 0.14 : 0.1;
  }

  switch (setupType) {
    case "earthen-pond":
      return 0.18;
    case "concrete-pond":
      return 0.15;
    default:
      return 0.22;
  }
};

const getGroundTextureOpacity = (setupType: SetupType) => {
  switch (setupType) {
    case "earthen-pond":
      return 0.22;
    case "concrete-pond":
      return 0.17;
    default:
      return 0.14;
  }
};

const getOverlayTextureOpacity = (setupType: SetupType) =>
  setupType === "tank" ? 0.2 : 0.12;

const lerp = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

const mixPoint2D = (start: Point2D, end: Point2D, amount: number): Point2D => ({
  x: lerp(start.x, end.x, amount),
  y: lerp(start.y, end.y, amount),
});

const mixPoint3D = (start: Point3D, end: Point3D, amount: number): Point3D => ({
  x: lerp(start.x, end.x, amount),
  y: lerp(start.y, end.y, amount),
  z: lerp(start.z, end.z, amount),
});

const rotatePoint = (
  point: Point3D,
  yawDegrees: number,
  pitchDegrees: number,
) => {
  const yaw = (yawDegrees * Math.PI) / 180;
  const pitch = (pitchDegrees * Math.PI) / 180;

  const yawX = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const yawZ = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
  const pitchY = point.y * Math.cos(pitch) - yawZ * Math.sin(pitch);
  const pitchZ = point.y * Math.sin(pitch) + yawZ * Math.cos(pitch);

  return {
    x: yawX,
    y: pitchY,
    z: pitchZ,
  };
};

const projectPoint = (point: Point3D) => {
  const cameraDistance = 520;
  const perspective = cameraDistance / (cameraDistance - point.z);

  return {
    x: point.x * perspective,
    y: -point.y * perspective,
  };
};

const buildRectLayer = (length: number, width: number, y: number): Point3D[] => {
  const halfLength = length / 2;
  const halfWidth = width / 2;

  return [
    { x: -halfLength, y, z: -halfWidth },
    { x: halfLength, y, z: -halfWidth },
    { x: halfLength, y, z: halfWidth },
    { x: -halfLength, y, z: halfWidth },
  ];
};

const toPathData = (loops: Point2D[][]) =>
  loops
    .map(
      (loop) =>
        `M ${loop.map((point) => `${point.x},${point.y}`).join(" L ")} Z`,
    )
    .join(" ");

const createMeasurementLine = (
  start: Point2D,
  end: Point2D,
  offset: number,
  labelOffset = 18,
) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const normalX = -dy / length;
  const normalY = dx / length;

  return {
    start: {
      x: start.x + normalX * offset,
      y: start.y + normalY * offset,
    },
    end: {
      x: end.x + normalX * offset,
      y: end.y + normalY * offset,
    },
    label: {
      x: (start.x + end.x) / 2 + normalX * (offset + labelOffset),
      y: (start.y + end.y) / 2 + normalY * (offset + labelOffset),
    },
  };
};

const createFacePolygons = (
  bottomLayer: Point3D[],
  topLayer: Point3D[],
  palette: PreviewPalette,
): PreviewPolygon3D[] => [
  {
    key: "bottom",
    points: bottomLayer,
    fill: palette.base,
    fillOpacity: 0.28,
  },
  {
    key: "back",
    points: [bottomLayer[0], bottomLayer[1], topLayer[1], topLayer[0]],
    fill: palette.sideAlt,
    fillOpacity: palette.wallOpacity,
  },
  {
    key: "left",
    points: [bottomLayer[0], bottomLayer[3], topLayer[3], topLayer[0]],
    fill: palette.side,
    fillOpacity: palette.wallOpacity,
  },
  {
    key: "right",
    points: [bottomLayer[1], bottomLayer[2], topLayer[2], topLayer[1]],
    fill: palette.sideAlt,
    fillOpacity: palette.wallOpacity,
  },
  {
    key: "front",
    points: [bottomLayer[3], bottomLayer[2], topLayer[2], topLayer[3]],
    fill: palette.front,
    fillOpacity: palette.wallOpacity,
  },
];

const createFrustumEdgeLines = (
  bottomLayer: Point3D[],
  topLayer: Point3D[],
  keyPrefix: string,
  stroke: string,
  strokeWidth: number,
  strokeOpacity: number,
): PreviewLine3D[] => {
  const lines: PreviewLine3D[] = [];

  for (let index = 0; index < 4; index += 1) {
    const nextIndex = (index + 1) % 4;

    lines.push({
      key: `${keyPrefix}-bottom-${index}`,
      start: bottomLayer[index],
      end: bottomLayer[nextIndex],
      stroke,
      strokeWidth,
      strokeOpacity,
    });
    lines.push({
      key: `${keyPrefix}-top-${index}`,
      start: topLayer[index],
      end: topLayer[nextIndex],
      stroke,
      strokeWidth,
      strokeOpacity,
    });
    lines.push({
      key: `${keyPrefix}-vertical-${index}`,
      start: bottomLayer[index],
      end: topLayer[index],
      stroke,
      strokeWidth,
      strokeOpacity,
    });
  }

  return lines;
};

const createLayerOutlineLines = (
  layer: Point3D[],
  keyPrefix: string,
  stroke: string,
  strokeWidth: number,
  strokeOpacity: number,
): PreviewLine3D[] =>
  layer.map((point, index) => ({
    key: `${keyPrefix}-${index}`,
    start: point,
    end: layer[(index + 1) % layer.length],
    stroke,
    strokeWidth,
    strokeOpacity,
  }));

const createWaterRipples = (
  waterPoints: Point2D[],
  stroke: string,
  strokeOpacity: number,
): PreviewLine2D[] => [
  {
    key: "ripple-1",
    start: mixPoint2D(waterPoints[3], waterPoints[0], 0.22),
    end: mixPoint2D(waterPoints[2], waterPoints[1], 0.18),
    stroke,
    strokeWidth: 1.4,
    strokeOpacity,
  },
  {
    key: "ripple-2",
    start: mixPoint2D(waterPoints[3], waterPoints[0], 0.52),
    end: mixPoint2D(waterPoints[2], waterPoints[1], 0.46),
    stroke,
    strokeWidth: 1.2,
    strokeOpacity: strokeOpacity * 0.82,
  },
];

const getPreviewPalette = (setupType: SetupType): PreviewPalette => {
  switch (setupType) {
    case "earthen-pond":
      return {
        front: "#9a6a45",
        side: "#7a5337",
        sideAlt: "#b27d55",
        base: "#603f2f",
        waterTop: "#9beee1",
        waterBottom: "#2f90a2",
        outline: "#17332f",
        glow: "rgba(101, 175, 107, 0.2)",
        sceneTop: "#f4fbf2",
        sceneBottom: "#e4f0e1",
        ground: "#79a866",
        groundAlt: "#5e854d",
        rim: "#b5d08f",
        frame: "#4c6a44",
        badgeBg: "#ecf8e8",
        badgeText: "#35513d",
        wallOpacity: 0.95,
        waterOpacity: 0.86,
        waterPatternOpacity: 0.2,
        label: "Earthen Pond Cutaway",
        description:
          "A sloped-bank cutaway that shows how the pond footprint, waterline, and depth fit together.",
      };
    case "concrete-pond":
      return {
        front: "#8d969d",
        side: "#6f7880",
        sideAlt: "#a6afb5",
        base: "#596269",
        waterTop: "#adecf6",
        waterBottom: "#379ebc",
        outline: "#213338",
        glow: "rgba(110, 137, 149, 0.16)",
        sceneTop: "#f6fafc",
        sceneBottom: "#e5edf2",
        ground: "#d6dee3",
        groundAlt: "#bac7ce",
        rim: "#e9eef1",
        frame: "#728089",
        badgeBg: "#eef3f6",
        badgeText: "#33444b",
        wallOpacity: 0.92,
        waterOpacity: 0.88,
        waterPatternOpacity: 0.16,
        label: "Concrete Pond",
        description:
          "A walled concrete pond with coping, inner water level, and clear measurement guides.",
      };
    default:
      return {
        front: "#5aa9bc",
        side: "#408ea3",
        sideAlt: "#79c4d4",
        base: "#2a5965",
        waterTop: "#c3f8fb",
        waterBottom: "#4bb3c7",
        outline: "#123f49",
        glow: "rgba(99, 194, 212, 0.22)",
        sceneTop: "#f1fbfd",
        sceneBottom: "#e2f1f6",
        ground: "#d6e4e8",
        groundAlt: "#b6c9cf",
        rim: "#174f5d",
        frame: "#46636b",
        badgeBg: "#def4f7",
        badgeText: "#123f49",
        wallOpacity: 0.44,
        waterOpacity: 0.92,
        waterPatternOpacity: 0.24,
        label: "Framed Tank",
        description:
          "A framed fish tank view with support rails, platform base, and waterline detail.",
      };
  }
};

export const TankSizePreview3D = ({
  setupType,
  length,
  width,
  depth,
}: {
  setupType: SetupType;
  length: number;
  width: number;
  depth: number;
}) => {
  const [yaw, setYaw] = useState(DEFAULT_VIEW.yaw);
  const [pitch, setPitch] = useState(DEFAULT_VIEW.pitch);
  const [zoom, setZoom] = useState(DEFAULT_VIEW.zoom);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<PointerDragState | null>(null);
  const palette = useMemo(() => getPreviewPalette(setupType), [setupType]);
  const hasValidDimensions = length > 0 && width > 0 && depth > 0;

  const preview = useMemo<PreviewScene | null>(() => {
    if (!hasValidDimensions) {
      return null;
    }

    const maxDimension = Math.max(length, width, depth, 1);
    const baseScale = 176 / maxDimension;
    const scaledLength = length * baseScale;
    const scaledWidth = width * baseScale;
    const scaledDepth = depth * baseScale;
    const topY = scaledDepth / 2;
    const bottomY = -scaledDepth / 2;
    const stageWidth = 460;
    const stageHeight = 340;
    const padding = 40;

    let bottomLayer: Point3D[] = [];
    let topLayer: Point3D[] = [];
    let waterLayer: Point3D[] = [];
    const backgroundPolygons3D: PreviewPolygon3D[] = [];
    const backgroundPaths3D: PreviewRing3D[] = [];
    const polygons3D: PreviewPolygon3D[] = [];
    const overlayPaths3D: PreviewRing3D[] = [];
    const lines3D: PreviewLine3D[] = [];

    if (setupType === "earthen-pond") {
      const topLength = scaledLength * 1.18 + 18;
      const topWidth = scaledWidth * 1.14 + 14;
      const bottomLength = Math.max(scaledLength * 0.74, topLength * 0.58);
      const bottomWidth = Math.max(scaledWidth * 0.7, topWidth * 0.56);
      const waterDepthRatio = 0.74;
      const waterLevelY = lerp(bottomY, topY, waterDepthRatio);
      const waterLength = Math.max(
        24,
        lerp(bottomLength, topLength, waterDepthRatio) - 12,
      );
      const waterWidth = Math.max(
        24,
        lerp(bottomWidth, topWidth, waterDepthRatio) - 12,
      );

      bottomLayer = buildRectLayer(bottomLength, bottomWidth, bottomY);
      topLayer = buildRectLayer(topLength, topWidth, topY);
      waterLayer = buildRectLayer(waterLength, waterWidth, waterLevelY);

      const groundLayer = buildRectLayer(
        topLength * 1.85,
        topWidth * 1.75,
        topY + 12,
      );

      backgroundPaths3D.push({
        key: "earthen-ground",
        outer: groundLayer,
        inner: topLayer,
        fill: palette.ground,
        fillOpacity: 0.96,
        stroke: palette.frame,
        strokeOpacity: 0.18,
        strokeWidth: 1.2,
      });

      polygons3D.push(...createFacePolygons(bottomLayer, topLayer, palette));
      lines3D.push(
        ...createFrustumEdgeLines(
          bottomLayer,
          topLayer,
          "earthen-edge",
          palette.outline,
          1.4,
          0.38,
        ),
      );
    } else if (setupType === "concrete-pond") {
      const outerLength = scaledLength * 1.02;
      const outerWidth = scaledWidth * 1.02;
      const wallThickness = Math.max(
        12,
        Math.min(outerLength, outerWidth) * 0.08,
      );
      const innerTopLength = Math.max(
        30,
        outerLength - wallThickness * 2.2,
      );
      const innerTopWidth = Math.max(30, outerWidth - wallThickness * 2.2);
      const waterLevelY = topY - Math.max(12, scaledDepth * 0.18);
      const innerTopLayer = buildRectLayer(
        innerTopLength,
        innerTopWidth,
        topY - Math.max(6, scaledDepth * 0.06),
      );

      bottomLayer = buildRectLayer(outerLength, outerWidth, bottomY);
      topLayer = buildRectLayer(outerLength, outerWidth, topY);
      waterLayer = buildRectLayer(
        Math.max(20, innerTopLength - 10),
        Math.max(20, innerTopWidth - 10),
        waterLevelY,
      );

      const slabLayer = buildRectLayer(
        outerLength * 1.34,
        outerWidth * 1.28,
        topY + 10,
      );

      backgroundPaths3D.push({
        key: "concrete-slab",
        outer: slabLayer,
        inner: topLayer,
        fill: palette.ground,
        fillOpacity: 1,
        stroke: palette.frame,
        strokeOpacity: 0.14,
        strokeWidth: 1,
      });

      polygons3D.push(...createFacePolygons(bottomLayer, topLayer, palette));
      polygons3D.push(
        ...createFacePolygons(waterLayer, innerTopLayer, {
          ...palette,
          front: "#dce4e8",
          side: "#cfd9de",
          sideAlt: "#e6edf0",
          wallOpacity: 0.84,
        })
          .filter((face) => face.key !== "bottom")
          .map((face) => ({
            ...face,
            key: `concrete-inner-${face.key}`,
          })),
      );

      overlayPaths3D.push({
        key: "concrete-rim",
        outer: topLayer,
        inner: innerTopLayer,
        fill: palette.rim,
        fillOpacity: 0.98,
        stroke: palette.outline,
        strokeOpacity: 0.18,
        strokeWidth: 1.2,
      });

      lines3D.push(
        ...createFrustumEdgeLines(
          bottomLayer,
          topLayer,
          "concrete-edge",
          palette.outline,
          1.4,
          0.4,
        ),
        ...createLayerOutlineLines(
          innerTopLayer,
          "concrete-inner-rim",
          palette.outline,
          1.15,
          0.24,
        ),
      );
    } else {
      const topLength = scaledLength * 1.04;
      const topWidth = scaledWidth * 1.04;
      const bottomLength = topLength * 0.98;
      const bottomWidth = topWidth * 0.98;
      const waterLevelY = topY - Math.max(10, scaledDepth * 0.12);
      const frameTopLayer = buildRectLayer(topLength + 22, topWidth + 22, topY + 8);
      const frameBaseLayer = buildRectLayer(
        topLength + 28,
        topWidth + 28,
        bottomY - 18,
      );
      const platformLayer = buildRectLayer(
        topLength * 1.28,
        topWidth * 1.24,
        bottomY - 24,
      );
      const rimOuterLayer = buildRectLayer(topLength + 18, topWidth + 18, topY + 8);
      const rimInnerLayer = buildRectLayer(topLength - 8, topWidth - 8, topY - 4);

      bottomLayer = buildRectLayer(bottomLength, bottomWidth, bottomY);
      topLayer = buildRectLayer(topLength, topWidth, topY);
      waterLayer = buildRectLayer(
        Math.max(20, topLength - 20),
        Math.max(20, topWidth - 20),
        waterLevelY,
      );

      backgroundPolygons3D.push({
        key: "tank-platform",
        points: platformLayer,
        fill: palette.ground,
        fillOpacity: 0.9,
        stroke: palette.frame,
        strokeOpacity: 0.16,
        strokeWidth: 1.2,
      });

      polygons3D.push(...createFacePolygons(bottomLayer, topLayer, palette));
      overlayPaths3D.push({
        key: "tank-rim",
        outer: rimOuterLayer,
        inner: rimInnerLayer,
        fill: palette.rim,
        fillOpacity: 0.98,
        stroke: palette.outline,
        strokeOpacity: 0.26,
        strokeWidth: 1.2,
      });

      const bandLevels = [0.34, 0.68];
      bandLevels.forEach((amount, index) => {
        const frontLeft = mixPoint3D(bottomLayer[3], topLayer[3], amount);
        const frontRight = mixPoint3D(bottomLayer[2], topLayer[2], amount);
        const rightBack = mixPoint3D(bottomLayer[1], topLayer[1], amount);

        lines3D.push({
          key: `tank-band-front-${index}`,
          start: frontLeft,
          end: frontRight,
          stroke: palette.frame,
          strokeWidth: 1.5,
          strokeOpacity: 0.48,
        });
        lines3D.push({
          key: `tank-band-side-${index}`,
          start: frontRight,
          end: rightBack,
          stroke: palette.frame,
          strokeWidth: 1.3,
          strokeOpacity: 0.42,
        });
      });

      lines3D.push(
        ...createFrustumEdgeLines(
          bottomLayer,
          topLayer,
          "tank-edge",
          palette.outline,
          1.45,
          0.42,
        ),
        ...createLayerOutlineLines(
          frameTopLayer,
          "tank-frame-top",
          palette.frame,
          2,
          0.7,
        ),
        ...createLayerOutlineLines(
          frameBaseLayer,
          "tank-frame-base",
          palette.frame,
          2,
          0.56,
        ),
      );

      for (let index = 0; index < 4; index += 1) {
        lines3D.push({
          key: `tank-frame-vertical-${index}`,
          start: frameBaseLayer[index],
          end: frameTopLayer[index],
          stroke: palette.frame,
          strokeWidth: 2.2,
          strokeOpacity: 0.64,
        });
      }
    }

    const projectionCache = new Map<string, { rotated: Point3D; projected: Point2D }>();
    const getProjectedPoint = (point: Point3D) => {
      const cacheKey = `${point.x.toFixed(2)}|${point.y.toFixed(2)}|${point.z.toFixed(2)}`;
      const cachedProjection = projectionCache.get(cacheKey);

      if (cachedProjection) {
        return cachedProjection;
      }

      const rotated = rotatePoint(point, yaw, pitch);
      const projected = projectPoint(rotated);
      const result = { rotated, projected };

      projectionCache.set(cacheKey, result);

      return result;
    };

    const getPolygonDepth = (points: Point3D[]) =>
      points.reduce((sum, point) => sum + getProjectedPoint(point).rotated.z, 0) /
      points.length;

    const allPoints = [
      ...bottomLayer,
      ...topLayer,
      ...waterLayer,
      ...backgroundPolygons3D.flatMap((item) => item.points),
      ...backgroundPaths3D.flatMap((item) => [...item.outer, ...item.inner]),
      ...polygons3D.flatMap((item) => item.points),
      ...overlayPaths3D.flatMap((item) => [...item.outer, ...item.inner]),
      ...lines3D.flatMap((item) => [item.start, item.end]),
    ];

    const bounds = allPoints.reduce(
      (accumulator, point) => {
        const projected = getProjectedPoint(point).projected;

        return {
          minX: Math.min(accumulator.minX, projected.x),
          maxX: Math.max(accumulator.maxX, projected.x),
          minY: Math.min(accumulator.minY, projected.y),
          maxY: Math.max(accumulator.maxY, projected.y),
        };
      },
      {
        minX: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      },
    );

    const fitScale =
      Math.min(
        (stageWidth - padding * 2) / Math.max(bounds.maxX - bounds.minX, 1),
        (stageHeight - padding * 2) / Math.max(bounds.maxY - bounds.minY, 1),
      ) * zoom;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const toScreenPoint = (point: Point3D): Point2D => {
      const projected = getProjectedPoint(point).projected;

      return {
        x: stageWidth / 2 + (projected.x - centerX) * fitScale,
        y: stageHeight / 2 + (projected.y - centerY) * fitScale,
      };
    };

    const toScreenPolygon = (polygon: PreviewPolygon3D): PreviewPolygon2D => ({
      ...polygon,
      points: polygon.points.map(toScreenPoint),
    });

    const toScreenPath = (ring: PreviewRing3D): PreviewPath2D => ({
      key: ring.key,
      d: toPathData([
        ring.outer.map(toScreenPoint),
        ring.inner.map(toScreenPoint),
      ]),
      fill: ring.fill,
      fillOpacity: ring.fillOpacity,
      stroke: ring.stroke,
      strokeOpacity: ring.strokeOpacity,
      strokeWidth: ring.strokeWidth,
    });

    const toScreenLine = (line: PreviewLine3D): PreviewLine2D => ({
      ...line,
      start: toScreenPoint(line.start),
      end: toScreenPoint(line.end),
    });

    const screenTopLayer = topLayer.map(toScreenPoint);
    const screenBottomLayer = bottomLayer.map(toScreenPoint);
    const screenWaterLayer = waterLayer.map(toScreenPoint);
    const waterRipples = createWaterRipples(
      screenWaterLayer,
      palette.outline,
      palette.waterPatternOpacity,
    );

    return {
      stageWidth,
      stageHeight,
      palette,
      backgroundPolygons: backgroundPolygons3D.map(toScreenPolygon),
      backgroundPaths: backgroundPaths3D.map(toScreenPath),
      polygons: [...polygons3D]
        .sort((firstPolygon, secondPolygon) => {
          return getPolygonDepth(firstPolygon.points) - getPolygonDepth(secondPolygon.points);
        })
        .map(toScreenPolygon),
      overlayPaths: overlayPaths3D.map(toScreenPath),
      lines: [...lines3D.map(toScreenLine), ...waterRipples],
      waterPoints: screenWaterLayer,
      lengthLine: createMeasurementLine(screenTopLayer[3], screenTopLayer[2], 18),
      widthLine: createMeasurementLine(screenTopLayer[2], screenTopLayer[1], -18),
      depthLine: createMeasurementLine(screenBottomLayer[3], screenTopLayer[3], 22),
      badgeWidth: Math.max(156, palette.label.length * 7.1 + 28),
    };
  }, [depth, hasValidDimensions, length, palette, pitch, setupType, width, yaw, zoom]);

  const previewInstanceId = sanitizeIdFragment(useId());
  const instructionsId = `${previewInstanceId}-preview-help`;
  const shadowFilterId = `${previewInstanceId}-preview-shadow`;
  const waterGradientId = `${previewInstanceId}-${setupType}-water-gradient`;
  const waterPatternId = `${previewInstanceId}-${setupType}-water-pattern`;
  const waterSheenId = `${previewInstanceId}-${setupType}-water-sheen`;
  const groundTextureId = `${previewInstanceId}-${setupType}-ground-texture`;
  const surfaceTextureId = `${previewInstanceId}-${setupType}-surface-texture`;

  const setPreviewYaw = (nextYaw: number) => {
    setYaw(clampValue(nextYaw, YAW_LIMITS.min, YAW_LIMITS.max));
  };

  const setPreviewPitch = (nextPitch: number) => {
    setPitch(clampValue(nextPitch, PITCH_LIMITS.min, PITCH_LIMITS.max));
  };

  const setPreviewZoom = (nextZoom: number) => {
    setZoom(clampValue(nextZoom, ZOOM_LIMITS.min, ZOOM_LIMITS.max));
  };

  const nudgeYaw = (amount: number) => {
    setYaw((currentYaw) =>
      clampValue(currentYaw + amount, YAW_LIMITS.min, YAW_LIMITS.max),
    );
  };

  const nudgePitch = (amount: number) => {
    setPitch((currentPitch) =>
      clampValue(currentPitch + amount, PITCH_LIMITS.min, PITCH_LIMITS.max),
    );
  };

  const nudgeZoom = (amount: number) => {
    setZoom((currentZoom) =>
      clampValue(currentZoom + amount, ZOOM_LIMITS.min, ZOOM_LIMITS.max),
    );
  };

  const resetPreview = () => {
    setYaw(DEFAULT_VIEW.yaw);
    setPitch(DEFAULT_VIEW.pitch);
    setZoom(DEFAULT_VIEW.zoom);
  };

  const endDrag = (target: EventTarget & HTMLDivElement, pointerId: number) => {
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }

    dragStateRef.current = null;
    setIsDragging(false);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!preview || event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startYaw: yaw,
      startPitch: pitch,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    event.preventDefault();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    setPreviewYaw(dragState.startYaw + deltaX * 0.34);
    setPreviewPitch(dragState.startPitch - deltaY * 0.22);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    endDrag(event.currentTarget, event.pointerId);
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    endDrag(event.currentTarget, event.pointerId);
  };

  const handleLostPointerCapture = () => {
    dragStateRef.current = null;
    setIsDragging(false);
  };

  const handlePreviewWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!preview) {
      return;
    }

    nudgeZoom(-event.deltaY * 0.0014);
    event.preventDefault();
  };

  const handlePreviewKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    const rotationStep = event.shiftKey ? 8 : 5;
    const pitchStep = event.shiftKey ? 4 : 3;
    const zoomStep = event.shiftKey ? 0.08 : 0.05;
    let handled = true;

    switch (event.key) {
      case "ArrowLeft":
        nudgeYaw(-rotationStep);
        break;
      case "ArrowRight":
        nudgeYaw(rotationStep);
        break;
      case "ArrowUp":
        nudgePitch(pitchStep);
        break;
      case "ArrowDown":
        nudgePitch(-pitchStep);
        break;
      case "+":
      case "=":
      case "PageUp":
        nudgeZoom(zoomStep);
        break;
      case "-":
      case "_":
      case "PageDown":
        nudgeZoom(-zoomStep);
        break;
      case "0":
      case "r":
      case "R":
      case "Home":
        resetPreview();
        break;
      default:
        handled = false;
        break;
    }

    if (handled) {
      event.preventDefault();
    }
  };

  return (
    <Card className="container mx-auto mb-8 overflow-hidden border-[#d7e7d5] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,249,245,0.98))] px-4 shadow-[0_28px_80px_-52px_rgba(6,43,40,0.58)] lg:px-8">
      <CardHeader className="pb-4">
        <CardTitle className="text-[#062b28]">3D Size Preview</CardTitle>
        <CardDescription>{palette.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {preview ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#d7e7d5] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#35513d]">
                  Drag to orbit
                </span>
                <span className="rounded-full border border-[#d7e7d5] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4b6a60]">
                  Wheel to zoom
                </span>
                <span className="rounded-full border border-[#d7e7d5] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4b6a60]">
                  Arrows and +/- keys
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetPreview}
                className="rounded-full border-[#c9ddd5] bg-white/80 text-[#062b28] hover:bg-[#f5fbf8]"
              >
                <RotateCcw className="h-4 w-4" />
                Reset view
              </Button>
            </div>

            <div
              tabIndex={0}
              aria-label="Interactive 3D pond or tank size preview"
              aria-describedby={instructionsId}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onLostPointerCapture={handleLostPointerCapture}
              onWheel={handlePreviewWheel}
              onKeyDown={handlePreviewKeyDown}
              onDoubleClick={resetPreview}
              className={`relative overflow-hidden rounded-[30px] border p-4 outline-none transition duration-200 ${
                isDragging
                  ? "cursor-grabbing border-[#0d5c54]/45 shadow-[0_24px_65px_-40px_rgba(13,92,84,0.55)]"
                  : "cursor-grab border-[#d7e7d5] hover:border-[#a8d0c6] hover:shadow-[0_24px_65px_-44px_rgba(6,43,40,0.5)] focus-visible:border-[#0d5c54]/45 focus-visible:shadow-[0_0_0_4px_rgba(13,92,84,0.12)]"
              }`}
              style={{
                background: `radial-gradient(circle at 14% 12%, ${palette.glow}, transparent 36%), linear-gradient(180deg, rgba(255,255,255,0.56) 0%, transparent 28%), linear-gradient(180deg, ${palette.sceneTop} 0%, ${palette.sceneBottom} 100%)`,
                touchAction: "none",
              }}
            >
              <p id={instructionsId} className="sr-only">
                Drag to rotate and tilt the preview. Use the mouse wheel to zoom.
                When the preview is focused, use the arrow keys to rotate and
                tilt, plus or minus to zoom, and press R, Home, or zero to reset.
              </p>

              <div className="pointer-events-none absolute inset-x-12 top-3 h-16 rounded-full bg-white/35 blur-3xl" />
              <div className="pointer-events-none absolute -right-12 bottom-4 h-24 w-24 rounded-full bg-white/30 blur-3xl" />

              <svg
                viewBox={`0 0 ${preview.stageWidth} ${preview.stageHeight}`}
                className="relative h-[360px] w-full select-none"
                role="img"
                aria-label="Interactive 3D pond or tank size preview"
              >
                <defs>
                  <filter
                    id={shadowFilterId}
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="170%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="18"
                      stdDeviation="16"
                      floodColor="rgba(7, 40, 34, 0.24)"
                    />
                  </filter>
                  <linearGradient
                    id={waterGradientId}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={palette.waterTop} />
                    <stop offset="100%" stopColor={palette.waterBottom} />
                  </linearGradient>
                  <pattern
                    id={waterPatternId}
                    width="34"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M2 8 C8 4, 14 4, 20 8 S32 12, 38 8"
                      fill="none"
                      stroke="rgba(255,255,255,0.55)"
                      strokeWidth="1.1"
                    />
                    <path
                      d="M-2 16 C4 12, 10 12, 16 16 S28 20, 34 16"
                      fill="none"
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth="0.9"
                    />
                  </pattern>
                  <linearGradient
                    id={waterSheenId}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.54" />
                    <stop offset="38%" stopColor="#ffffff" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>

                  {setupType === "earthen-pond" ? (
                    <>
                      <pattern
                        id={groundTextureId}
                        width="48"
                        height="34"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M-6 18 C6 10, 20 10, 34 18 S58 26, 72 18"
                          fill="none"
                          stroke="rgba(236,248,232,0.28)"
                          strokeWidth="1.1"
                        />
                        <path
                          d="M-10 31 C2 24, 16 23, 30 30 S52 36, 64 30"
                          fill="none"
                          stroke="rgba(76,106,68,0.22)"
                          strokeWidth="1"
                        />
                        <circle cx="11" cy="8" r="1.3" fill="rgba(76,106,68,0.18)" />
                        <circle cx="31" cy="24" r="1" fill="rgba(76,106,68,0.18)" />
                      </pattern>
                      <pattern
                        id={surfaceTextureId}
                        width="26"
                        height="26"
                        patternUnits="userSpaceOnUse"
                        patternTransform="rotate(12)"
                      >
                        <path
                          d="M-6 7 H32"
                          stroke="rgba(255,255,255,0.18)"
                          strokeWidth="1"
                        />
                        <path
                          d="M-6 18 H32"
                          stroke="rgba(23,51,47,0.12)"
                          strokeWidth="1"
                        />
                        <path
                          d="M6 -2 V28"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="0.8"
                        />
                      </pattern>
                    </>
                  ) : setupType === "concrete-pond" ? (
                    <>
                      <pattern
                        id={groundTextureId}
                        width="28"
                        height="28"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="6" cy="7" r="1" fill="rgba(114,128,137,0.18)" />
                        <circle cx="18" cy="11" r="1.3" fill="rgba(255,255,255,0.22)" />
                        <circle cx="10" cy="21" r="0.9" fill="rgba(114,128,137,0.16)" />
                        <path
                          d="M2 23 L10 19"
                          stroke="rgba(255,255,255,0.22)"
                          strokeWidth="0.8"
                        />
                        <path
                          d="M15 5 L24 2"
                          stroke="rgba(114,128,137,0.18)"
                          strokeWidth="0.8"
                        />
                      </pattern>
                      <pattern
                        id={surfaceTextureId}
                        width="24"
                        height="24"
                        patternUnits="userSpaceOnUse"
                        patternTransform="rotate(-8)"
                      >
                        <path
                          d="M0 6 H24 M0 18 H24"
                          stroke="rgba(255,255,255,0.18)"
                          strokeWidth="0.9"
                        />
                        <path
                          d="M4 0 V24 M16 0 V24"
                          stroke="rgba(33,51,56,0.08)"
                          strokeWidth="0.7"
                        />
                        <circle cx="8" cy="11" r="0.9" fill="rgba(33,51,56,0.11)" />
                      </pattern>
                    </>
                  ) : (
                    <>
                      <pattern
                        id={groundTextureId}
                        width="30"
                        height="24"
                        patternUnits="userSpaceOnUse"
                        patternTransform="rotate(-6)"
                      >
                        <path
                          d="M0 18 L30 0"
                          stroke="rgba(70,99,107,0.16)"
                          strokeWidth="0.8"
                        />
                        <path
                          d="M-6 24 L24 -6"
                          stroke="rgba(255,255,255,0.18)"
                          strokeWidth="0.8"
                        />
                        <path
                          d="M0 7 H30 M0 18 H30"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="0.8"
                        />
                      </pattern>
                      <pattern
                        id={surfaceTextureId}
                        width="22"
                        height="28"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M4 0 V28 M18 0 V28"
                          stroke="rgba(255,255,255,0.24)"
                          strokeWidth="1"
                        />
                        <path
                          d="M0 9 H22 M0 18 H22"
                          stroke="rgba(18,63,73,0.12)"
                          strokeWidth="0.9"
                        />
                        <circle cx="11" cy="5" r="0.9" fill="rgba(255,255,255,0.26)" />
                        <circle cx="11" cy="23" r="0.9" fill="rgba(255,255,255,0.26)" />
                      </pattern>
                    </>
                  )}
                </defs>

                <ellipse
                  cx={preview.stageWidth / 2}
                  cy={preview.stageHeight - 28}
                  rx="152"
                  ry="24"
                  fill="rgba(6, 43, 40, 0.08)"
                />

                <g transform="translate(20 18)">
                  <rect
                    width={preview.badgeWidth}
                    height="32"
                    rx="16"
                    fill={palette.badgeBg}
                    stroke="rgba(6, 43, 40, 0.08)"
                  />
                  <text
                    x={preview.badgeWidth / 2}
                    y="21"
                    textAnchor="middle"
                    fill={palette.badgeText}
                    fontSize="12"
                    fontWeight="700"
                    letterSpacing="0.06em"
                  >
                    {palette.label}
                  </text>
                </g>

                {preview.backgroundPaths.map((path) => (
                  <g key={path.key}>
                    <path
                      d={path.d}
                      fill={path.fill}
                      fillOpacity={path.fillOpacity}
                      fillRule="evenodd"
                      stroke={path.stroke}
                      strokeOpacity={path.strokeOpacity}
                      strokeWidth={path.strokeWidth}
                    />
                    <path
                      d={path.d}
                      fill={`url(#${groundTextureId})`}
                      fillOpacity={getGroundTextureOpacity(setupType)}
                      fillRule="evenodd"
                    />
                  </g>
                ))}

                {preview.backgroundPolygons.map((polygon) => (
                  <g key={polygon.key}>
                    <polygon
                      points={toPointsAttribute(polygon.points)}
                      fill={polygon.fill}
                      fillOpacity={polygon.fillOpacity}
                      stroke={polygon.stroke}
                      strokeOpacity={polygon.strokeOpacity}
                      strokeWidth={polygon.strokeWidth}
                    />
                    <polygon
                      points={toPointsAttribute(polygon.points)}
                      fill={`url(#${groundTextureId})`}
                      fillOpacity={getGroundTextureOpacity(setupType)}
                    />
                  </g>
                ))}

                <g filter={`url(#${shadowFilterId})`}>
                  {preview.polygons.map((polygon) => (
                    <g key={polygon.key}>
                      <polygon
                        points={toPointsAttribute(polygon.points)}
                        fill={polygon.fill}
                        fillOpacity={polygon.fillOpacity}
                        stroke={polygon.stroke || palette.outline}
                        strokeOpacity={polygon.strokeOpacity ?? 0.2}
                        strokeWidth={polygon.strokeWidth ?? 1.2}
                      />
                      <polygon
                        points={toPointsAttribute(polygon.points)}
                        fill={`url(#${surfaceTextureId})`}
                        fillOpacity={getSurfaceTextureOpacity(setupType, polygon.key)}
                      />
                    </g>
                  ))}

                  <polygon
                    points={toPointsAttribute(preview.waterPoints)}
                    fill={`url(#${waterGradientId})`}
                    fillOpacity={palette.waterOpacity}
                    stroke={palette.outline}
                    strokeOpacity="0.22"
                    strokeWidth="1.2"
                  />

                  <polygon
                    points={toPointsAttribute(preview.waterPoints)}
                    fill={`url(#${waterPatternId})`}
                    fillOpacity={palette.waterPatternOpacity}
                  />

                  <polygon
                    points={toPointsAttribute(preview.waterPoints)}
                    fill={`url(#${waterSheenId})`}
                    fillOpacity="0.4"
                  />

                  {preview.overlayPaths.map((path) => (
                    <g key={path.key}>
                      <path
                        d={path.d}
                        fill={path.fill}
                        fillOpacity={path.fillOpacity}
                        fillRule="evenodd"
                        stroke={path.stroke}
                        strokeOpacity={path.strokeOpacity}
                        strokeWidth={path.strokeWidth}
                      />
                      <path
                        d={path.d}
                        fill={`url(#${surfaceTextureId})`}
                        fillOpacity={getOverlayTextureOpacity(setupType)}
                        fillRule="evenodd"
                      />
                    </g>
                  ))}

                  {preview.lines.map((line) => (
                    <line
                      key={line.key}
                      x1={line.start.x}
                      y1={line.start.y}
                      x2={line.end.x}
                      y2={line.end.y}
                      stroke={line.stroke}
                      strokeOpacity={line.strokeOpacity}
                      strokeWidth={line.strokeWidth}
                      strokeDasharray={line.dashArray}
                    />
                  ))}
                </g>

                {[preview.lengthLine, preview.widthLine, preview.depthLine].map(
                  (measurement, index) => (
                    <g key={index}>
                      <line
                        x1={measurement.start.x}
                        y1={measurement.start.y}
                        x2={measurement.end.x}
                        y2={measurement.end.y}
                        stroke="#0d5c54"
                        strokeWidth="2"
                        strokeDasharray="6 5"
                      />
                      <circle
                        cx={measurement.start.x}
                        cy={measurement.start.y}
                        r="3"
                        fill="#0d5c54"
                      />
                      <circle
                        cx={measurement.end.x}
                        cy={measurement.end.y}
                        r="3"
                        fill="#0d5c54"
                      />
                    </g>
                  ),
                )}

                <g>
                  <text
                    x={preview.lengthLine.label.x}
                    y={preview.lengthLine.label.y}
                    textAnchor="middle"
                    fill="#062b28"
                    fontSize="12"
                    fontWeight="700"
                  >
                    L: {formatNumber(length)} m
                  </text>
                  <text
                    x={preview.widthLine.label.x}
                    y={preview.widthLine.label.y}
                    textAnchor="middle"
                    fill="#062b28"
                    fontSize="12"
                    fontWeight="700"
                  >
                    W: {formatNumber(width)} m
                  </text>
                  <text
                    x={preview.depthLine.label.x}
                    y={preview.depthLine.label.y}
                    textAnchor="middle"
                    fill="#062b28"
                    fontSize="12"
                    fontWeight="700"
                  >
                    D: {formatNumber(depth)} m
                  </text>
                </g>
              </svg>
            </div>

            <p className="text-sm text-[#4d6b63]">
              Click the preview to focus it, then use arrow keys to orbit,{" "}
              <span className="font-semibold text-[#062b28]">+ / -</span> to zoom,
              and <span className="font-semibold text-[#062b28]">R</span> to snap
              back to the default angle.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-3 rounded-[24px] border border-[#d7e7d5] bg-white/80 p-4 shadow-[0_14px_40px_-34px_rgba(6,43,40,0.45)]">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-[#062b28]">Rotate</Label>
                  <span className="rounded-full bg-[#eef7f1] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4c6a5b]">
                    Drag or arrows
                  </span>
                </div>
                <Slider
                  value={[yaw]}
                  min={YAW_LIMITS.min}
                  max={YAW_LIMITS.max}
                  step={1}
                  onValueChange={(values) => setPreviewYaw(values[0] ?? yaw)}
                />
                <p className="text-xs text-muted-foreground">
                  {formatInteger(yaw)} deg
                </p>
              </div>

              <div className="space-y-3 rounded-[24px] border border-[#d7e7d5] bg-white/80 p-4 shadow-[0_14px_40px_-34px_rgba(6,43,40,0.45)]">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-[#062b28]">Tilt</Label>
                  <span className="rounded-full bg-[#eef7f1] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4c6a5b]">
                    Drag vertically
                  </span>
                </div>
                <Slider
                  value={[pitch]}
                  min={PITCH_LIMITS.min}
                  max={PITCH_LIMITS.max}
                  step={1}
                  onValueChange={(values) => setPreviewPitch(values[0] ?? pitch)}
                />
                <p className="text-xs text-muted-foreground">
                  {formatInteger(pitch)} deg
                </p>
              </div>

              <div className="space-y-3 rounded-[24px] border border-[#d7e7d5] bg-white/80 p-4 shadow-[0_14px_40px_-34px_rgba(6,43,40,0.45)]">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-[#062b28]">Zoom</Label>
                  <span className="rounded-full bg-[#eef7f1] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4c6a5b]">
                    Wheel or keys
                  </span>
                </div>
                <Slider
                  value={[zoom]}
                  min={ZOOM_LIMITS.min}
                  max={ZOOM_LIMITS.max}
                  step={0.01}
                  onValueChange={(values) => setPreviewZoom(values[0] ?? zoom)}
                />
                <p className="text-xs text-muted-foreground">
                  {formatNumber(zoom)}x
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#d7e7d5] bg-[#f6fbf7] p-10 text-center text-sm text-muted-foreground">
            Enter valid pond or tank dimensions to generate a 3D preview with
            measurements.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-[#d7e7d5] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(240,248,244,0.95))] p-4 shadow-[0_14px_34px_-30px_rgba(6,43,40,0.45)]">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Length
            </p>
            <p className="mt-2 text-lg font-semibold text-[#062b28]">
              {formatNumber(length)} m
            </p>
          </div>
          <div className="rounded-[24px] border border-[#d7e7d5] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(240,248,244,0.95))] p-4 shadow-[0_14px_34px_-30px_rgba(6,43,40,0.45)]">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Width
            </p>
            <p className="mt-2 text-lg font-semibold text-[#062b28]">
              {formatNumber(width)} m
            </p>
          </div>
          <div className="rounded-[24px] border border-[#d7e7d5] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(240,248,244,0.95))] p-4 shadow-[0_14px_34px_-30px_rgba(6,43,40,0.45)]">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Depth
            </p>
            <p className="mt-2 text-lg font-semibold text-[#062b28]">
              {formatNumber(depth)} m
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
