import { Fragment } from "react";

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export const StepProgressBar = ({
  currentStep,
  totalSteps,
  stepLabels,
}: StepProgressBarProps) => {
  return (
    <div className="flex items-start w-full">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber <= currentStep;
        const isLast = index === totalSteps - 1;

        return (
          <Fragment key={index}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isCompleted
                    ? "bg-primary-blue text-white"
                    : "bg-gray-200 text-text-secondary"
                }`}
              >
                {stepNumber}
              </div>
              {stepLabels?.[index] && (
                <span
                  className={`text-[10px] whitespace-nowrap transition-colors ${
                    isCompleted
                      ? "text-primary-blue font-medium"
                      : "text-text-secondary"
                  }`}
                >
                  {stepLabels[index]}
                </span>
              )}
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-[2px] mt-3.5 transition-colors ${
                  stepNumber < currentStep ? "bg-primary-blue" : "bg-gray-200"
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};
