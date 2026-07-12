import { useEffect, useState } from "react";

type WeightTargetsEditorProps = {
  start: number;
  current: number;
  goal: number;
  onSave: (start: number, current: number, goal: number) => void;
};

export function WeightTargetsEditor({ start, current, goal, onSave }: WeightTargetsEditorProps) {
  const [startVal, setStartVal] = useState<number | "">(start > 0 ? start : "");
  const [currentVal, setCurrentVal] = useState<number | "">(current > 0 ? current : "");
  const [goalVal, setGoalVal] = useState<number | "">(goal > 0 ? goal : "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStartVal(start > 0 ? start : "");
    setCurrentVal(current > 0 ? current : "");
    setGoalVal(goal > 0 ? goal : "");
  }, [start, current, goal]);

  const valid =
    typeof startVal === "number" &&
    typeof currentVal === "number" &&
    typeof goalVal === "number" &&
    startVal > 0 &&
    currentVal > 0 &&
    goalVal > 0;

  const dirty = startVal !== start || currentVal !== current || goalVal !== goal;

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Change your starting weight, current weight or goal. Journey progress and achievements use
        these numbers.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        <NumField label="Start (kg)" value={startVal} onChange={setStartVal} placeholder="e.g. 75" />
        <NumField
          label="Current (kg)"
          value={currentVal}
          onChange={setCurrentVal}
          placeholder="e.g. 72"
        />
        <NumField label="Goal (kg)" value={goalVal} onChange={setGoalVal} placeholder="e.g. 65" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!valid || !dirty}
          onClick={() => {
            onSave(startVal as number, currentVal as number, goalVal as number);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2000);
          }}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90 disabled:opacity-40"
        >
          Save weight targets
        </button>
        {saved && <span className="text-xs text-muted-foreground">Saved</span>}
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type="number"
        step="0.1"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? "" : +e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
