import { SliderInput } from 'components/primitives';
import { FormControl } from 'components/form-control';

export interface UnlockingPeriodProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export const UnlockingPeriodInput = ({ value, error, onChange }: UnlockingPeriodProps) => {
  return (
    <FormControl
      label="Unlocking period"
      helpText="The duration that has to pass for unstaked membership tokens to be claimable."
    >
      <SliderInput
        error={error}
        value={value}
        min={1}
        max={90}
        formatValue={(v) => `${v} days`}
        onChange={(_, value) => onChange(value as number)}
      />
    </FormControl>
  );
};
