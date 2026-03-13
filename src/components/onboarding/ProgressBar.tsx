export function ProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-navy/10"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemax={totalSteps}
    >
      <div
        className="h-full bg-coral transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
