import { useMemo, useState } from "react";
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

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const formatNumber = (value: number) => numberFormatter.format(value);
const formatInteger = (value: number) => integerFormatter.format(value);

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

const getPreviewPalette = (setupType: SetupType) => {
  switch (setupType) {
    case "earthen-pond":
      return {
        front: "#8c644a",
        side: "#75533d",
        sideAlt: "#9b7357",
        base: "#5e4635",
        water: "#48a7b8",
        outline: "#18332f",
        glow: "rgba(52, 139, 151, 0.18)",
        wallOpacity: 0.92,
      };
    case "concrete-pond":
      return {
        front: "#7f8d96",
        side: "#6c7982",
        sideAlt: "#909ca4",
        base: "#53616b",
        water: "#4eb5cf",
        outline: "#22333b",
        glow: "rgba(80, 152, 170, 0.18)",
        wallOpacity: 0.88,
      };
    default:
      return {
        front: "#76bed1",
        side: "#5aa7bc",
        sideAlt: "#91d2e1",
        base: "#2f6c79",
        water: "#8fe2f0",
        outline: "#11414c",
        glow: "rgba(100, 190, 210, 0.22)",
        wallOpacity: 0.55,
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
  const [yaw, setYaw] = useState(-34);
  const [pitch, setPitch] = useState(24);
  const [zoom, setZoom] = useState(1);
  const palette = getPreviewPalette(setupType);
  const hasValidDimensions = length > 0 && width > 0 && depth > 0;

  const preview = useMemo(() => {
    if (!hasValidDimensions) {
      return null;
    }

    const maxDimension = Math.max(length, width, depth, 1);
    const baseScale = 180 / maxDimension;
    const scaledLength = length * baseScale;
    const scaledWidth = width * baseScale;
    const scaledDepth = depth * baseScale;

    const vertices: Point3D[] = [
      { x: -scaledLength / 2, y: -scaledDepth / 2, z: -scaledWidth / 2 },
      { x: scaledLength / 2, y: -scaledDepth / 2, z: -scaledWidth / 2 },
      { x: scaledLength / 2, y: -scaledDepth / 2, z: scaledWidth / 2 },
      { x: -scaledLength / 2, y: -scaledDepth / 2, z: scaledWidth / 2 },
      { x: -scaledLength / 2, y: scaledDepth / 2, z: -scaledWidth / 2 },
      { x: scaledLength / 2, y: scaledDepth / 2, z: -scaledWidth / 2 },
      { x: scaledLength / 2, y: scaledDepth / 2, z: scaledWidth / 2 },
      { x: -scaledLength / 2, y: scaledDepth / 2, z: scaledWidth / 2 },
    ];

    const waterInset = Math.min(scaledLength, scaledWidth) * 0.05;
    const waterLevel = scaledDepth / 2 - Math.max(8, scaledDepth * 0.08);
    const waterVertices: Point3D[] = [
      {
        x: -scaledLength / 2 + waterInset,
        y: waterLevel,
        z: -scaledWidth / 2 + waterInset,
      },
      {
        x: scaledLength / 2 - waterInset,
        y: waterLevel,
        z: -scaledWidth / 2 + waterInset,
      },
      {
        x: scaledLength / 2 - waterInset,
        y: waterLevel,
        z: scaledWidth / 2 - waterInset,
      },
      {
        x: -scaledLength / 2 + waterInset,
        y: waterLevel,
        z: scaledWidth / 2 - waterInset,
      },
    ];

    const rotatedVertices = vertices.map((vertex) =>
      rotatePoint(vertex, yaw, pitch),
    );
    const rotatedWaterVertices = waterVertices.map((vertex) =>
      rotatePoint(vertex, yaw, pitch),
    );
    const projectedVertices = rotatedVertices.map(projectPoint);
    const projectedWaterVertices = rotatedWaterVertices.map(projectPoint);

    const bounds = projectedVertices.reduce(
      (accumulator, point) => ({
        minX: Math.min(accumulator.minX, point.x),
        maxX: Math.max(accumulator.maxX, point.x),
        minY: Math.min(accumulator.minY, point.y),
        maxY: Math.max(accumulator.maxY, point.y),
      }),
      {
        minX: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      },
    );

    const stageWidth = 420;
    const stageHeight = 320;
    const padding = 44;
    const fitScale =
      Math.min(
        (stageWidth - padding * 2) / Math.max(bounds.maxX - bounds.minX, 1),
        (stageHeight - padding * 2) / Math.max(bounds.maxY - bounds.minY, 1),
      ) * zoom;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const screenVertices = projectedVertices.map((point) => ({
      x: stageWidth / 2 + (point.x - centerX) * fitScale,
      y: stageHeight / 2 + (point.y - centerY) * fitScale,
    }));
    const screenWaterVertices = projectedWaterVertices.map((point) => ({
      x: stageWidth / 2 + (point.x - centerX) * fitScale,
      y: stageHeight / 2 + (point.y - centerY) * fitScale,
    }));

    const faces = [
      {
        key: "bottom",
        indices: [0, 1, 2, 3],
        fill: palette.base,
        opacity: 0.28,
      },
      {
        key: "back",
        indices: [0, 1, 5, 4],
        fill: palette.sideAlt,
        opacity: palette.wallOpacity,
      },
      {
        key: "left",
        indices: [0, 3, 7, 4],
        fill: palette.side,
        opacity: palette.wallOpacity,
      },
      {
        key: "right",
        indices: [1, 2, 6, 5],
        fill: palette.sideAlt,
        opacity: palette.wallOpacity,
      },
      {
        key: "front",
        indices: [3, 2, 6, 7],
        fill: palette.front,
        opacity: palette.wallOpacity,
      },
    ].sort((firstFace, secondFace) => {
      const firstDepth =
        firstFace.indices.reduce(
          (sum, index) => sum + rotatedVertices[index].z,
          0,
        ) / firstFace.indices.length;
      const secondDepth =
        secondFace.indices.reduce(
          (sum, index) => sum + rotatedVertices[index].z,
          0,
        ) / secondFace.indices.length;

      return firstDepth - secondDepth;
    });

    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];

    return {
      stageWidth,
      stageHeight,
      faces,
      edges,
      screenVertices,
      screenWaterVertices,
      lengthLine: createMeasurementLine(
        screenVertices[7],
        screenVertices[6],
        18,
      ),
      widthLine: createMeasurementLine(
        screenVertices[6],
        screenVertices[5],
        -18,
      ),
      depthLine: createMeasurementLine(
        screenVertices[3],
        screenVertices[7],
        22,
      ),
    };
  }, [depth, hasValidDimensions, length, palette, pitch, width, yaw, zoom]);

  return (
    <Card className="border-[#d7e7d5] container mx-auto px-4 lg:px-8 mb-8">
      <CardHeader>
        <CardTitle className="text-[#062b28]">3D Size Preview</CardTitle>
        <CardDescription>
          Rotate the preview to inspect the recommended pond or tank size with
          measurements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {preview ? (
          <>
            <div
              className="overflow-hidden rounded-[28px] border border-[#d7e7d5] p-4"
              style={{
                background: `radial-gradient(circle at top left, ${palette.glow}, transparent 34%), linear-gradient(180deg, #f8fcfb 0%, #edf7f2 100%)`,
              }}
            >
              <svg
                viewBox={`0 0 ${preview.stageWidth} ${preview.stageHeight}`}
                className="h-[340px] w-full"
                role="img"
                aria-label="Interactive 3D pond or tank size preview"
              >
                <defs>
                  <filter
                    id="preview-shadow"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="160%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="16"
                      stdDeviation="14"
                      floodColor="rgba(7, 40, 34, 0.22)"
                    />
                  </filter>
                </defs>

                <ellipse
                  cx={preview.stageWidth / 2}
                  cy={preview.stageHeight - 38}
                  rx="128"
                  ry="28"
                  fill="rgba(6, 43, 40, 0.08)"
                />

                <g filter="url(#preview-shadow)">
                  {preview.faces.map((face) => (
                    <polygon
                      key={face.key}
                      points={face.indices
                        .map((index) => {
                          const point = preview.screenVertices[index];
                          return `${point.x},${point.y}`;
                        })
                        .join(" ")}
                      fill={face.fill}
                      fillOpacity={face.opacity}
                      stroke={palette.outline}
                      strokeOpacity="0.35"
                      strokeWidth="1.5"
                    />
                  ))}

                  <polygon
                    points={preview.screenWaterVertices
                      .map((point) => `${point.x},${point.y}`)
                      .join(" ")}
                    fill={palette.water}
                    fillOpacity={setupType === "tank" ? 0.42 : 0.64}
                    stroke={palette.outline}
                    strokeOpacity="0.3"
                    strokeWidth="1.2"
                  />

                  {preview.edges.map(([startIndex, endIndex]) => (
                    <line
                      key={`${startIndex}-${endIndex}`}
                      x1={preview.screenVertices[startIndex].x}
                      y1={preview.screenVertices[startIndex].y}
                      x2={preview.screenVertices[endIndex].x}
                      y2={preview.screenVertices[endIndex].y}
                      stroke={palette.outline}
                      strokeOpacity="0.6"
                      strokeWidth="1.5"
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

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-3">
                <Label>Rotate</Label>
                <Slider
                  value={[yaw]}
                  min={-70}
                  max={70}
                  step={1}
                  onValueChange={(values) => setYaw(values[0] ?? yaw)}
                />
                <p className="text-xs text-muted-foreground">
                  {formatInteger(yaw)} deg
                </p>
              </div>

              <div className="space-y-3">
                <Label>Tilt</Label>
                <Slider
                  value={[pitch]}
                  min={10}
                  max={55}
                  step={1}
                  onValueChange={(values) => setPitch(values[0] ?? pitch)}
                />
                <p className="text-xs text-muted-foreground">
                  {formatInteger(pitch)} deg
                </p>
              </div>

              <div className="space-y-3">
                <Label>Zoom</Label>
                <Slider
                  value={[zoom]}
                  min={0.75}
                  max={1.35}
                  step={0.01}
                  onValueChange={(values) => setZoom(values[0] ?? zoom)}
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
          <div className="rounded-2xl bg-secondary/50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Length
            </p>
            <p className="mt-2 text-lg font-semibold text-[#062b28]">
              {formatNumber(length)} m
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Width
            </p>
            <p className="mt-2 text-lg font-semibold text-[#062b28]">
              {formatNumber(width)} m
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-4">
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
