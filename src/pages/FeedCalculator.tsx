import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calculator,
  Droplets,
  Fish,
  Ruler,
  Scale,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SetupType = "earthen-pond" | "concrete-pond" | "tank";
type FishType = "catfish" | "tilapia";
type CalculatorMode = "feed-planner" | "stock-density" | "pond-size";

type FeedCycle = {
  stage: string;
  durationWeeks: number;
  weightRangeGrams: [number, number];
  feedRate: number;
  feedSize: string;
};

const setupOptions: Array<{ value: SetupType; label: string }> = [
  { value: "earthen-pond", label: "Earthen Pond" },
  { value: "concrete-pond", label: "Concrete Pond" },
  { value: "tank", label: "Tank" },
];

const fishOptions: Array<{ value: FishType; label: string }> = [
  { value: "catfish", label: "Catfish" },
  { value: "tilapia", label: "Tilapia" },
];

const calculatorOptions: Array<{
  value: CalculatorMode;
  label: string;
  description: string;
}> = [
  {
    value: "feed-planner",
    label: "Feed Planner",
    description:
      "Calculate feed size and feed quantity for catfish or tilapia from young stage to mature stage.",
  },
  {
    value: "stock-density",
    label: "Stock Density Calculator",
    description:
      "Estimate how many catfish or tilapia fingerlings you can stock for optimal performance using pond dimensions and target harvest weight.",
  },
  {
    value: "pond-size",
    label: "Pond Size Calculator",
    description:
      "Estimate the pond or tank size needed to house the number of fish you want to rear at your chosen harvest weight.",
  },
];

const feedPrograms: Record<FishType, FeedCycle[]> = {
  catfish: [
    {
      stage: "Young Starter",
      durationWeeks: 3,
      weightRangeGrams: [2, 10],
      feedRate: 0.08,
      feedSize: "0.8 - 1 mm",
    },
    {
      stage: "Fingerling",
      durationWeeks: 4,
      weightRangeGrams: [10, 50],
      feedRate: 0.06,
      feedSize: "1.5 - 2 mm",
    },
    {
      stage: "Juvenile",
      durationWeeks: 5,
      weightRangeGrams: [50, 150],
      feedRate: 0.045,
      feedSize: "2 - 3 mm",
    },
    {
      stage: "Grow-out",
      durationWeeks: 6,
      weightRangeGrams: [150, 400],
      feedRate: 0.03,
      feedSize: "4 mm",
    },
    {
      stage: "Mature",
      durationWeeks: 8,
      weightRangeGrams: [400, 900],
      feedRate: 0.02,
      feedSize: "6 mm",
    },
  ],
  tilapia: [
    {
      stage: "Young Starter",
      durationWeeks: 3,
      weightRangeGrams: [1, 5],
      feedRate: 0.1,
      feedSize: "0.5 - 0.8 mm",
    },
    {
      stage: "Fingerling",
      durationWeeks: 4,
      weightRangeGrams: [5, 30],
      feedRate: 0.07,
      feedSize: "1 - 1.5 mm",
    },
    {
      stage: "Juvenile",
      durationWeeks: 5,
      weightRangeGrams: [30, 120],
      feedRate: 0.045,
      feedSize: "2 mm",
    },
    {
      stage: "Grow-out",
      durationWeeks: 6,
      weightRangeGrams: [120, 250],
      feedRate: 0.03,
      feedSize: "3 mm",
    },
    {
      stage: "Mature",
      durationWeeks: 8,
      weightRangeGrams: [250, 500],
      feedRate: 0.02,
      feedSize: "4 - 6 mm",
    },
  ],
};

const stockingGuides: Record<
  SetupType,
  {
    unit: "m2" | "m3";
    densityLabel: string;
    notes: string;
    densityByFish: Record<FishType, number>;
  }
> = {
  "earthen-pond": {
    unit: "m2",
    densityLabel: "fish per m2 of surface area",
    notes:
      "Earthen ponds are planned mainly from surface area, with healthy water depth and good pond management.",
    densityByFish: {
      catfish: 6,
      tilapia: 4,
    },
  },
  "concrete-pond": {
    unit: "m3",
    densityLabel: "fish per m3 of water volume",
    notes:
      "Concrete ponds can carry more fish when water exchange and aeration are steady.",
    densityByFish: {
      catfish: 18,
      tilapia: 10,
    },
  },
  tank: {
    unit: "m3",
    densityLabel: "fish per m3 of water volume",
    notes:
      "Tanks assume active aeration and tighter daily water quality management.",
    densityByFish: {
      catfish: 28,
      tilapia: 16,
    },
  },
};

const fishProfiles: Record<
  FishType,
  {
    defaultTargetWeightGrams: string;
    referenceHarvestWeightKg: number;
    targetHint: string;
  }
> = {
  catfish: {
    defaultTargetWeightGrams: "900",
    referenceHarvestWeightKg: 0.9,
    targetHint: "Typical grow-out target: 700g to 1200g",
  },
  tilapia: {
    defaultTargetWeightGrams: "500",
    referenceHarvestWeightKg: 0.5,
    targetHint: "Typical grow-out target: 250g to 600g",
  },
};

const defaultForm = {
  calculatorMode: "feed-planner" as CalculatorMode,
  setupType: "earthen-pond" as SetupType,
  fishType: "catfish" as FishType,
  numberOfFish: "250",
  targetWeightGrams: fishProfiles.catfish.defaultTargetWeightGrams,
  length: "10",
  width: "5",
  depth: "1.2",
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const parseNumber = (value: string) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const formatNumber = (value: number) => numberFormatter.format(value);

const formatInteger = (value: number) => integerFormatter.format(value);

const getSuggestedFootprint = (surfaceArea: number) => {
  if (surfaceArea <= 0) {
    return {
      suggestedLength: 0,
      suggestedWidth: 0,
    };
  }

  const suggestedWidth = Math.sqrt(surfaceArea / 2);
  const suggestedLength = suggestedWidth * 2;

  return {
    suggestedLength,
    suggestedWidth,
  };
};

const getAdjustedDensity = (
  setupType: SetupType,
  fishType: FishType,
  targetWeightKg: number,
) => {
  const baseDensity = stockingGuides[setupType].densityByFish[fishType];

  if (targetWeightKg <= 0) {
    return {
      baseDensity,
      adjustedDensity: 0,
      adjustmentFactor: 0,
      referenceWeightKg: fishProfiles[fishType].referenceHarvestWeightKg,
    };
  }

  const referenceWeightKg = fishProfiles[fishType].referenceHarvestWeightKg;
  const adjustmentFactor = clamp(
    Math.pow(referenceWeightKg / targetWeightKg, 0.85),
    0.45,
    2,
  );

  return {
    baseDensity,
    adjustedDensity: baseDensity * adjustmentFactor,
    adjustmentFactor,
    referenceWeightKg,
  };
};

const StatCard = ({
  icon,
  title,
  value,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  detail: string;
}) => (
  <Card className="border-[#d7e7d5]">
    <CardContent className="flex items-start gap-4 p-6">
      <div className="rounded-2xl bg-primary/10 p-3 text-primary">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-[#062b28]">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </div>
    </CardContent>
  </Card>
);

export default function FeedCalculator() {
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>(
    defaultForm.calculatorMode,
  );
  const [setupType, setSetupType] = useState<SetupType>(defaultForm.setupType);
  const [fishType, setFishType] = useState<FishType>(defaultForm.fishType);
  const [numberOfFish, setNumberOfFish] = useState(defaultForm.numberOfFish);
  const [targetWeightGrams, setTargetWeightGrams] = useState(
    defaultForm.targetWeightGrams,
  );
  const [length, setLength] = useState(defaultForm.length);
  const [width, setWidth] = useState(defaultForm.width);
  const [depth, setDepth] = useState(defaultForm.depth);

  const selectedCalculator =
    calculatorOptions.find((option) => option.value === calculatorMode) ??
    calculatorOptions[0];

  const geometry = useMemo(() => {
    const fishCount = parseNumber(numberOfFish);
    const targetWeightKg = parseNumber(targetWeightGrams) / 1000;
    const lengthValue = parseNumber(length);
    const widthValue = parseNumber(width);
    const depthValue = parseNumber(depth);
    const surfaceArea = lengthValue * widthValue;
    const waterVolume = surfaceArea * depthValue;
    const stockingGuide = stockingGuides[setupType];
    const measurementBase =
      stockingGuide.unit === "m2" ? surfaceArea : waterVolume;
    const measurementLabel =
      stockingGuide.unit === "m2" ? "Usable surface area" : "Usable water volume";
    const measurementUnit = stockingGuide.unit;

    return {
      fishCount,
      targetWeightKg,
      lengthValue,
      widthValue,
      depthValue,
      surfaceArea,
      waterVolume,
      stockingGuide,
      measurementBase,
      measurementLabel,
      measurementUnit,
    };
  }, [depth, numberOfFish, setupType, targetWeightGrams, width, length]);

  const feedPlanner = useMemo(() => {
    const density = geometry.stockingGuide.densityByFish[fishType];
    const recommendedCapacity = geometry.measurementBase * density;
    const stockingRatio =
      recommendedCapacity > 0 ? geometry.fishCount / recommendedCapacity : 0;
    const feedRows = feedPrograms[fishType].map((cycle) => {
      const averageWeightKg =
        (cycle.weightRangeGrams[0] + cycle.weightRangeGrams[1]) / 2 / 1000;
      const dailyFeedKg = geometry.fishCount * averageWeightKg * cycle.feedRate;
      const cycleFeedKg = dailyFeedKg * cycle.durationWeeks * 7;

      return {
        ...cycle,
        dailyFeedKg,
        cycleFeedKg,
      };
    });
    const totalProgramFeedKg = feedRows.reduce(
      (sum, cycle) => sum + cycle.cycleFeedKg,
      0,
    );
    const peakDailyFeedKg = Math.max(
      ...feedRows.map((cycle) => cycle.dailyFeedKg),
      0,
    );

    return {
      density,
      recommendedCapacity,
      stockingRatio,
      feedRows,
      totalProgramFeedKg,
      peakDailyFeedKg,
    };
  }, [fishType, geometry]);

  const stockDensity = useMemo(() => {
    const density = getAdjustedDensity(
      setupType,
      fishType,
      geometry.targetWeightKg,
    );
    const recommendedFingerlings = geometry.measurementBase * density.adjustedDensity;
    const projectedHarvestBiomassKg =
      recommendedFingerlings * geometry.targetWeightKg;

    return {
      ...density,
      recommendedFingerlings,
      projectedHarvestBiomassKg,
    };
  }, [fishType, geometry.measurementBase, geometry.targetWeightKg, setupType]);

  const pondSize = useMemo(() => {
    const density = getAdjustedDensity(
      setupType,
      fishType,
      geometry.targetWeightKg,
    );
    const requiredMeasurementBase =
      density.adjustedDensity > 0
        ? geometry.fishCount / density.adjustedDensity
        : 0;
    const requiredSurfaceArea =
      geometry.stockingGuide.unit === "m2"
        ? requiredMeasurementBase
        : geometry.depthValue > 0
          ? requiredMeasurementBase / geometry.depthValue
          : 0;
    const requiredWaterVolume =
      geometry.stockingGuide.unit === "m2"
        ? requiredSurfaceArea * geometry.depthValue
        : requiredMeasurementBase;
    const footprint = getSuggestedFootprint(requiredSurfaceArea);
    const projectedHarvestBiomassKg =
      geometry.fishCount * geometry.targetWeightKg;

    return {
      ...density,
      requiredMeasurementBase,
      requiredSurfaceArea,
      requiredWaterVolume,
      projectedHarvestBiomassKg,
      ...footprint,
    };
  }, [
    fishType,
    geometry.depthValue,
    geometry.fishCount,
    geometry.stockingGuide.unit,
    geometry.targetWeightKg,
    setupType,
  ]);

  const feedPlannerState =
    feedPlanner.recommendedCapacity <= 0
      ? {
          label: "Enter a valid pond or tank size to calculate stocking and feed.",
          className:
            "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
        }
      : feedPlanner.stockingRatio > 1
        ? {
            label: "This stock count is above the recommended capacity for the entered pond or tank size.",
            className:
              "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200",
          }
        : feedPlanner.stockingRatio > 0.8
          ? {
              label: "This stock count is within the recommended density range.",
              className:
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
            }
          : {
              label: "This stock count is below the recommended limit, so you still have room to stock more fish.",
              className:
                "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200",
            };

  const stockDensityState =
    geometry.measurementBase <= 0
      ? {
          label: "Enter valid pond or tank dimensions to estimate how many fingerlings you can stock.",
          className:
            "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
        }
      : geometry.targetWeightKg <= 0
        ? {
            label: "Enter a valid target harvest weight to adjust the stocking recommendation.",
            className:
              "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
          }
        : stockDensity.adjustmentFactor < 0.95
          ? {
              label: "Because you want to grow the fish to a heavier market weight, the recommended stocking density is reduced.",
              className:
                "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200",
            }
          : stockDensity.adjustmentFactor > 1.05
            ? {
                label: "Because the target harvest weight is lighter, the system allows a higher stocking density than the base guide.",
                className:
                  "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
              }
            : {
                label: "This target harvest weight is close to the standard density guide.",
                className:
                  "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200",
              };

  const pondSizeState =
    geometry.fishCount <= 0
      ? {
          label: "Enter the number of fish you want to rear to estimate the pond or tank size you need.",
          className:
            "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
        }
      : geometry.targetWeightKg <= 0
        ? {
            label: "Enter a valid target harvest weight so the required size can be adjusted correctly.",
            className:
              "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
          }
        : geometry.stockingGuide.unit === "m3" && geometry.depthValue <= 0
          ? {
              label: "Enter a preferred water depth to calculate the footprint needed for the pond or tank.",
              className:
                "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
            }
          : {
              label: "The recommended size below is designed to hold your planned stock count at the selected harvest weight.",
              className:
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
            };

  const handleFishTypeChange = (value: string) => {
    const nextFishType = value as FishType;

    setFishType(nextFishType);
    setTargetWeightGrams(fishProfiles[nextFishType].defaultTargetWeightGrams);
  };

  const handleReset = () => {
    setCalculatorMode(defaultForm.calculatorMode);
    setSetupType(defaultForm.setupType);
    setFishType(defaultForm.fishType);
    setNumberOfFish(defaultForm.numberOfFish);
    setTargetWeightGrams(defaultForm.targetWeightGrams);
    setLength(defaultForm.length);
    setWidth(defaultForm.width);
    setDepth(defaultForm.depth);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbf7_0%,#eff8f0_34%,#ffffff_100%)]">
      <section className="overflow-hidden bg-[#052f29] text-white">
        <div className="container grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge className="border-0 bg-white/10 text-white hover:bg-white/10">
              Aquaculture Planning Tools
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
              Plan feed, stock density, and pond size for catfish and tilapia.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
              Start with the calculator selector, then enter your pond or tank
              details. The form opens different sections for feed planning,
              stock density, and pond size estimation.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold">Feed Planner</p>
                <p className="mt-1 text-sm text-white/70">
                  Estimate feed size and quantity from young fish to mature fish.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold">Stock Density</p>
                <p className="mt-1 text-sm text-white/70">
                  Estimate the optimal number of fingerlings to stock.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold">Pond Size</p>
                <p className="mt-1 text-sm text-white/70">
                  Estimate the pond or tank size needed for your planned stock.
                </p>
              </div>
            </div>
          </div>

          <Card className="border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Available sections</CardTitle>
              <CardDescription className="text-white/70">
                Choose the section that matches the planning decision you want
                to make first.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {calculatorOptions.map((option) => (
                <div
                  key={option.value}
                  className={`rounded-2xl border p-4 ${
                    option.value === calculatorMode
                      ? "border-white/25 bg-white/15"
                      : "border-white/10 bg-black/15"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">
                    {option.label}
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    {option.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-[#d7e7d5] shadow-[0_20px_60px_-40px_rgba(6,43,40,0.55)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#062b28]">
                <Calculator className="h-5 w-5" />
                {selectedCalculator.label}
              </CardTitle>
              <CardDescription>{selectedCalculator.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="calculator-mode">Calculator section</Label>
                <Select
                  value={calculatorMode}
                  onValueChange={(value) =>
                    setCalculatorMode(value as CalculatorMode)
                  }
                >
                  <SelectTrigger id="calculator-mode">
                    <SelectValue placeholder="Select calculator section" />
                  </SelectTrigger>
                  <SelectContent>
                    {calculatorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
                {selectedCalculator.description}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="setup-type">Pond or tank type</Label>
                  <Select
                    value={setupType}
                    onValueChange={(value) => setSetupType(value as SetupType)}
                  >
                    <SelectTrigger id="setup-type">
                      <SelectValue placeholder="Select setup type" />
                    </SelectTrigger>
                    <SelectContent>
                      {setupOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fish-type">Type of fish</Label>
                  <Select value={fishType} onValueChange={handleFishTypeChange}>
                    <SelectTrigger id="fish-type">
                      <SelectValue placeholder="Select fish type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fishOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {calculatorMode === "feed-planner" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="number-of-fish">Number of fish</Label>
                    <Input
                      id="number-of-fish"
                      type="number"
                      min="0"
                      value={numberOfFish}
                      onChange={(event) => setNumberOfFish(event.target.value)}
                      placeholder="e.g. 250"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="length">Length (m)</Label>
                      <Input
                        id="length"
                        type="number"
                        min="0"
                        step="0.1"
                        value={length}
                        onChange={(event) => setLength(event.target.value)}
                        placeholder="Length"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="width">Width (m)</Label>
                      <Input
                        id="width"
                        type="number"
                        min="0"
                        step="0.1"
                        value={width}
                        onChange={(event) => setWidth(event.target.value)}
                        placeholder="Width"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="depth">Depth (m)</Label>
                      <Input
                        id="depth"
                        type="number"
                        min="0"
                        step="0.1"
                        value={depth}
                        onChange={(event) => setDepth(event.target.value)}
                        placeholder="Depth"
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {calculatorMode === "stock-density" ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="length">Length (m)</Label>
                      <Input
                        id="length"
                        type="number"
                        min="0"
                        step="0.1"
                        value={length}
                        onChange={(event) => setLength(event.target.value)}
                        placeholder="Length"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="width">Width (m)</Label>
                      <Input
                        id="width"
                        type="number"
                        min="0"
                        step="0.1"
                        value={width}
                        onChange={(event) => setWidth(event.target.value)}
                        placeholder="Width"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="depth">Depth (m)</Label>
                      <Input
                        id="depth"
                        type="number"
                        min="0"
                        step="0.1"
                        value={depth}
                        onChange={(event) => setDepth(event.target.value)}
                        placeholder="Depth"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-weight">
                      Target harvest weight per fish (g)
                    </Label>
                    <Input
                      id="target-weight"
                      type="number"
                      min="0"
                      step="10"
                      value={targetWeightGrams}
                      onChange={(event) =>
                        setTargetWeightGrams(event.target.value)
                      }
                      placeholder="e.g. 900"
                    />
                    <p className="text-sm text-muted-foreground">
                      {fishProfiles[fishType].targetHint}
                    </p>
                  </div>
                </>
              ) : null}

              {calculatorMode === "pond-size" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="number-of-fish">Number of fish</Label>
                    <Input
                      id="number-of-fish"
                      type="number"
                      min="0"
                      value={numberOfFish}
                      onChange={(event) => setNumberOfFish(event.target.value)}
                      placeholder="e.g. 250"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="target-weight">
                        Target harvest weight per fish (g)
                      </Label>
                      <Input
                        id="target-weight"
                        type="number"
                        min="0"
                        step="10"
                        value={targetWeightGrams}
                        onChange={(event) =>
                          setTargetWeightGrams(event.target.value)
                        }
                        placeholder="e.g. 900"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="depth">
                        Preferred water depth (m)
                      </Label>
                      <Input
                        id="depth"
                        type="number"
                        min="0"
                        step="0.1"
                        value={depth}
                        onChange={(event) => setDepth(event.target.value)}
                        placeholder="e.g. 1.2"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {fishProfiles[fishType].targetHint}
                  </p>
                </>
              ) : null}

              <div className="rounded-2xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
                {geometry.stockingGuide.notes} Base density for {fishType} in
                this setup is{" "}
                <span className="font-semibold text-foreground">
                  {formatNumber(geometry.stockingGuide.densityByFish[fishType])}{" "}
                  {geometry.stockingGuide.densityLabel}
                </span>
                .
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="w-full md:w-auto"
              >
                Reset calculator
              </Button>
            </CardContent>
          </Card>

          {calculatorMode === "feed-planner" ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard
                  icon={<Scale className="h-5 w-5" />}
                  title="Recommended capacity"
                  value={`${formatInteger(feedPlanner.recommendedCapacity)} fish`}
                  detail="Based on the pond or tank size you entered."
                />
                <StatCard
                  icon={<Fish className="h-5 w-5" />}
                  title="Planned stock count"
                  value={`${formatInteger(geometry.fishCount)} fish`}
                  detail="Used across all feed cycle estimates."
                />
                <StatCard
                  icon={<Droplets className="h-5 w-5" />}
                  title="Water volume"
                  value={`${formatNumber(geometry.waterVolume)} m3`}
                  detail={`Surface area: ${formatNumber(geometry.surfaceArea)} m2`}
                />
                <StatCard
                  icon={<Calculator className="h-5 w-5" />}
                  title="Total feed estimate"
                  value={`${formatNumber(feedPlanner.totalProgramFeedKg)} kg`}
                  detail={`Peak daily feed: ${formatNumber(feedPlanner.peakDailyFeedKg)} kg`}
                />
              </div>

              <Card className={`border ${feedPlannerState.className}`}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="rounded-2xl bg-black/5 p-3 dark:bg-white/10">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Stocking guidance</p>
                    <p className="mt-2 text-sm leading-6">
                      {feedPlannerState.label}
                    </p>
                    {feedPlanner.recommendedCapacity > 0 ? (
                      <p className="mt-2 text-sm">
                        You are using about{" "}
                        <span className="font-semibold">
                          {formatNumber(feedPlanner.stockingRatio * 100)}%
                        </span>{" "}
                        of the recommended capacity.
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#d7e7d5] fish-pattern-bg">
                <CardHeader>
                  <CardTitle className="text-[#062b28]">
                    Planning notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-[#062b28]/80">
                  <p>
                    Feed is estimated from average body weight in each growth
                    cycle and the full number of fish entered above.
                  </p>
                  <p>
                    Actual feed use can change with water quality, temperature,
                    survival rate, and how aggressively the fish are feeding.
                  </p>
                  <p>
                    This section works best when you already know the pond size
                    and the number of fish you want to rear.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {calculatorMode === "stock-density" ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard
                  icon={<Fish className="h-5 w-5" />}
                  title="Recommended fingerlings"
                  value={`${formatInteger(stockDensity.recommendedFingerlings)} fish`}
                  detail="Estimated optimal stocking quantity for this setup."
                />
                <StatCard
                  icon={<Scale className="h-5 w-5" />}
                  title="Adjusted density"
                  value={`${formatNumber(stockDensity.adjustedDensity)} ${geometry.stockingGuide.unit === "m2" ? "fish/m2" : "fish/m3"}`}
                  detail="Adjusted from the base density using target harvest weight."
                />
                <StatCard
                  icon={<Droplets className="h-5 w-5" />}
                  title={geometry.measurementLabel}
                  value={`${formatNumber(geometry.measurementBase)} ${geometry.measurementUnit}`}
                  detail="This is the usable size basis behind the estimate."
                />
                <StatCard
                  icon={<Calculator className="h-5 w-5" />}
                  title="Projected harvest biomass"
                  value={`${formatNumber(stockDensity.projectedHarvestBiomassKg)} kg`}
                  detail="Estimated live weight at the selected harvest target."
                />
              </div>

              <Card className={`border ${stockDensityState.className}`}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="rounded-2xl bg-black/5 p-3 dark:bg-white/10">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Density guidance</p>
                    <p className="mt-2 text-sm leading-6">
                      {stockDensityState.label}
                    </p>
                    {geometry.targetWeightKg > 0 ? (
                      <p className="mt-2 text-sm">
                        Weight adjustment factor:{" "}
                        <span className="font-semibold">
                          {formatNumber(stockDensity.adjustmentFactor)}x
                        </span>
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#d7e7d5] fish-pattern-bg">
                <CardHeader>
                  <CardTitle className="text-[#062b28]">
                    How this section works
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-[#062b28]/80">
                  <p>
                    The stock density calculator estimates the total number of
                    fingerlings your pond or tank can hold for good performance.
                  </p>
                  <p>
                    It uses the pond dimensions together with the weight you
                    intend to grow the fish to, so heavier harvest targets
                    reduce the recommended stocking quantity.
                  </p>
                  <p>
                    Use this section when you know the pond size already and
                    want to decide how many fish to stock.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {calculatorMode === "pond-size" ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard
                  icon={<Ruler className="h-5 w-5" />}
                  title="Required size basis"
                  value={`${formatNumber(pondSize.requiredMeasurementBase)} ${geometry.stockingGuide.unit}`}
                  detail={
                    geometry.stockingGuide.unit === "m2"
                      ? "This is the surface area needed for the planned stock."
                      : "This is the water volume needed for the planned stock."
                  }
                />
                <StatCard
                  icon={<Droplets className="h-5 w-5" />}
                  title="Required water volume"
                  value={`${formatNumber(pondSize.requiredWaterVolume)} m3`}
                  detail="Useful when planning tank or concrete pond water capacity."
                />
                <StatCard
                  icon={<Scale className="h-5 w-5" />}
                  title="Required surface area"
                  value={`${formatNumber(pondSize.requiredSurfaceArea)} m2`}
                  detail="Used to estimate the footprint of the pond or tank."
                />
                <StatCard
                  icon={<Calculator className="h-5 w-5" />}
                  title="Projected harvest biomass"
                  value={`${formatNumber(pondSize.projectedHarvestBiomassKg)} kg`}
                  detail="Estimated total live weight for the target stock plan."
                />
              </div>

              <Card className={`border ${pondSizeState.className}`}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="rounded-2xl bg-black/5 p-3 dark:bg-white/10">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Pond size guidance</p>
                    <p className="mt-2 text-sm leading-6">{pondSizeState.label}</p>
                    {geometry.fishCount > 0 && pondSize.adjustedDensity > 0 ? (
                      <p className="mt-2 text-sm">
                        Planned density:{" "}
                        <span className="font-semibold">
                          {formatNumber(pondSize.adjustedDensity)}{" "}
                          {geometry.stockingGuide.unit === "m2"
                            ? "fish/m2"
                            : "fish/m3"}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#d7e7d5] fish-pattern-bg">
                <CardHeader>
                  <CardTitle className="text-[#062b28]">
                    Suggested footprint
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-[#062b28]/80">
                  <p>
                    Example 2:1 footprint at the entered depth: about{" "}
                    <span className="font-semibold">
                      {formatNumber(pondSize.suggestedLength)} m
                    </span>{" "}
                    long by{" "}
                    <span className="font-semibold">
                      {formatNumber(pondSize.suggestedWidth)} m
                    </span>{" "}
                    wide.
                  </p>
                  <p>
                    For earthen ponds, surface area drives the recommendation
                    most strongly. For tanks and concrete ponds, water volume
                    and depth matter more.
                  </p>
                  <p>
                    Use this section when you know the number of fish you want
                    to rear and want to size the pond or tank before building.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </section>

      {calculatorMode === "feed-planner" ? (
        <section className="container pb-16">
          <Card className="overflow-hidden border-[#d7e7d5] shadow-[0_20px_60px_-40px_rgba(6,43,40,0.55)]">
            <CardHeader className="bg-[#f5fbf5]">
              <CardTitle className="text-[#062b28]">
                Feed Schedule by Growth Cycle
              </CardTitle>
              <CardDescription>
                Estimated feed quantities for {fishType} from young stage to
                mature harvest size.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Fish size</TableHead>
                    <TableHead>Feed size</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Feed rate</TableHead>
                    <TableHead>Daily feed</TableHead>
                    <TableHead>Cycle total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedPlanner.feedRows.map((cycle) => (
                    <TableRow key={cycle.stage}>
                      <TableCell className="font-medium">{cycle.stage}</TableCell>
                      <TableCell>
                        {cycle.weightRangeGrams[0]}g - {cycle.weightRangeGrams[1]}g
                      </TableCell>
                      <TableCell>{cycle.feedSize}</TableCell>
                      <TableCell>{cycle.durationWeeks} weeks</TableCell>
                      <TableCell>{formatNumber(cycle.feedRate * 100)}%</TableCell>
                      <TableCell>
                        {formatNumber(cycle.dailyFeedKg)} kg/day
                      </TableCell>
                      <TableCell>{formatNumber(cycle.cycleFeedKg)} kg</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
