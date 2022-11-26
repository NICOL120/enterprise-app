import { useDaoWizardForm } from '../DaoWizardFormProvider';
import { WizardInput } from '../WizardInput';

export const MultisigAddressInput = () => {
  const {
    formState: {
      existingMultisigAddr,
      existingMultisigVoters,
      existingMultisigVotersLoading,
      existingMultisigVotersError,
    },
    formInput,
  } = useDaoWizardForm();

  return (
    <WizardInput
      label="Multisig address"
      placeholder="Type your existing CW3 Multisig address"
      value={existingMultisigAddr}
      error={existingMultisigVotersError}
      valid={existingMultisigVoters !== undefined}
      loading={existingMultisigVotersLoading}
      onChange={(addr) => {
        formInput({ existingMultisigAddr: addr.currentTarget.value });
      }}
    />
  );
};
