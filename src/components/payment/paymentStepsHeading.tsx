import { cn } from "@/lib/utils";

interface CheckoutStepsProps {
  step: "cart" | "checkout" | "payment";
  setStep: (step: "cart" | "checkout" | "payment") => void;
}

export function CheckoutSteps({ step, setStep }: CheckoutStepsProps) {
  const steps: ("cart" | "checkout" | "payment")[] = [
    "cart",
    "checkout",
    "payment",
  ];

  const stepIndex = steps.findIndex((s) => s === step);

  return (
    <nav className="flex items-center space-x-2 text-sm font-medium mb-8">
      {steps.slice(0, stepIndex + 1).map((label, index) => {
        const isActive = index === stepIndex;
        const isCompleted = index < stepIndex;

        return (
          <div
            key={label}
            className="flex items-center cursor-pointer"
            onClick={() => setStep(label)} // 👈 updates parent state
          >
            <span
              className={cn(
                "transition-colors",
                isActive
                  ? "text-green-600 font-semibold"
                  : isCompleted
                  ? "text-gray-500"
                  : "text-gray-400"
              )}
            >
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </span>
            {index < stepIndex && (
              <span className="mx-2 text-gray-400">{">"}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
