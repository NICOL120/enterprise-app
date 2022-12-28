import { AnimatedPage } from '@terra-money/apps/components';
import { useRef, useState } from 'react';
import { LoadingPage } from 'pages/shared/LoadingPage';
import { Header } from './Header';
import { useNavigate, useParams } from 'react-router';
import { useDAOQuery } from 'queries';
import { CW20Addr } from '@terra-money/apps/types';
import { Button, Text } from 'components/primitives';
import { FormFooter } from 'components/form-footer';
import { CurrentDaoProvider } from 'pages/shared/CurrentDaoProvider';
import { Navigation } from 'components/Navigation';
import { ResponsiveView } from 'lib/ui/ResponsiveView';
import { VStack } from 'lib/ui/Stack';
import { MobileCreateProposalHeader } from './MobileCreateProposalHeader';
import { assertDefined } from '@terra-money/apps/utils';
import { PrimarySelect } from 'lib/ui/inputs/PrimarySelect';
import styled from '@emotion/styled';

const sharedProposalTypes = ['text', 'config', 'upgrade', 'assets', 'nfts', 'execute', 'spend', 'delegate'] as const;
const executeMessage: string = `Execute custom messages that will allow you to interact with smart contracts, send assets and more. Click here <a href="https://docs.enterprise.money/guides/messages">messages</a> for more information on message templates.`
const daoProposalsRecord = {
  multisig: [...sharedProposalTypes, 'members'] as const,
  token: [...sharedProposalTypes, 'mint', 'burn'] as const,
  nft: sharedProposalTypes,
} as const;

export type ProposalType =
  | typeof daoProposalsRecord.multisig[number]
  | typeof daoProposalsRecord.token[number]
  | typeof daoProposalsRecord.nft[number];

export const proposalTitle: Record<ProposalType, string> = {
  text: 'Text proposal',
  config: 'Update configuration proposal',
  upgrade: 'Upgrade proposal',
  assets: 'Update whitelisted assets',
  nfts: 'Update whitelisted NFTs',
  execute: 'Proposal to execute message',
  members: 'Update multisig members',
  spend: 'Spend treasury proposal',
  mint: 'Mint token proposal',
  burn: 'Burn token proposal',
  delegate: 'Delegate LUNA proposal',
};

export const proposalDescription: Record<ProposalType, string> = {
  text: 'Create general-purpose petitions, such as asking the DAO to partner with another protocol or for the DAO to implement a new feature',
  config: 'Update DAO configurations such as governance parameters and DAO metadata',
  upgrade: 'Upgrade your DAO to the latest contracts to get upgraded features',
  assets: 'Update whitelisted assets',
  nfts: 'Add/remove assets thats displayed on the Treasury page',
  execute: executeMessage,
  members: 'Add/remove members from the Multisig',
  spend: 'Submit this proposal to send assets in your treasury to another address',
  mint: 'Mint DAO governance tokens to accounts. This only works if the minter of the CW20 token is the DAO treasury address.',
  burn: 'Undelegate LUNA from a validator that you have delegated to',
  delegate: 'Delegate LUNA in your treasury with a validator of your choice to earn staking rewards'
};

const title = 'Create a proposal';

// TODO: turn into a reusable component
const NormalScreenContainer = styled(VStack)`
  padding: 48px 48px 64px 48px;
  height: 100%;
  gap: 32px;
`;

const NormalScreenContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ProposalScreenContainer = styled.div`
  display: flex;
  justify-content: space-between;
  overflow: hidden;
`

export const SelectProposalTypePage = () => {
  const { address } = useParams();

  const { data: dao, isLoading } = useDAOQuery(address as CW20Addr);

  const ref = useRef<HTMLDivElement>(null);

  const [proposalType, setProposalType] = useState<ProposalType>('text');

  const navigate = useNavigate();

  const renderOptions = () => {
    const { type } = assertDefined(dao);
    const options = daoProposalsRecord[type];

    return (
      <PrimarySelect
        label="Choose type"
        options={options}
        getName={(type) => proposalTitle[type]}
        selectedOption={proposalType}
        onSelect={setProposalType}
        groupName="proposal-type"
      />
    );
  };

  const renderFooter = () => {
    const { address } = assertDefined(dao);
    return (
      <FormFooter
        primary={
          <Button onClick={() => navigate(`/dao/${address}/proposals/create/${proposalType}`)} variant="primary">
            Next
          </Button>
        }
        secondary={<Button onClick={() => navigate(`/dao/${address}`)}>Cancel</Button>}
      />
    );
  };

  return (
    <Navigation>
      <LoadingPage isLoading={isLoading}>
        {dao && (
          <CurrentDaoProvider value={dao}>
            <ResponsiveView
              small={() => (
                <VStack gap={24}>
                  <MobileCreateProposalHeader title={title} />
                  {renderOptions()}
                  {renderFooter()}
                </VStack>
              )}
              normal={() => (
                <AnimatedPage>
                  <NormalScreenContainer>
                    <Header ref={ref} title={title} />
                    <ProposalScreenContainer>
                      <NormalScreenContent>{renderOptions()}</NormalScreenContent>
                      <VStack gap={8} style={{ width: '50%', marginLeft: '10%' }}>
                        <Text variant="heading4">What is a {proposalTitle[proposalType]}?</Text>
                        <Text variant="text">{proposalDescription[proposalType]}</Text>
                      </VStack>
                    </ProposalScreenContainer>
                    {renderFooter()}
                  </NormalScreenContainer>
                </AnimatedPage>
              )}
            />
          </CurrentDaoProvider>
        )}
      </LoadingPage>
    </Navigation>
  );
};
