interface Props {
  originalValue: number;
  remainingValue: number;
}

const CouponUsageProgress = ({ originalValue, remainingValue }: Props) => {
  const usedValue = originalValue - remainingValue;
  const usedPercent = originalValue > 0 ? Math.round((usedValue / originalValue) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Usage</span>
        <span>{usedPercent}% used</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${usedPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>₹{usedValue.toLocaleString()} used</span>
        <span>₹{remainingValue.toLocaleString()} remaining</span>
      </div>
    </div>
  );
};

export default CouponUsageProgress;
