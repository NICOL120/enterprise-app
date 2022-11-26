import { AnimateNumber, Container } from '@terra-money/apps/components';
import { demicrofy, formatAmount } from '@terra-money/apps/libs/formatting';
import { u } from '@terra-money/apps/types';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import Big from 'big.js';
import classNames from 'classnames';
import { NotConnected as WalletNotConnected } from 'components/not-connected';
import { NumericPanel } from 'components/numeric-panel';
import { Button } from 'components/primitives';
import {
  useCW20BalanceQuery,
  useCW20TokenInfoQuery,
  useReleasableClaimsQuery,
  useTokenStakingAmountQuery,
  useVotingPowerQuery,
} from 'queries';
import { useStakeTokenDialog } from './StakeTokenDialog';
import { useUnstakeTokenDialog } from './UnstakeTokenDialog';
import { useClaimTx } from 'tx';
import { Text } from 'components/primitives';
import { DAOLogo } from 'components/dao-logo';
import { DAO } from 'types';
import { usePendingClaims } from 'hooks';
import { PendingClaims } from './PendingClaims';
import styles from './TokenStaking.module.sass';

const useTokenData = (daoAddress: string, tokenAddress: string) => {
  const { data: token } = useCW20TokenInfoQuery(tokenAddress);

  const { data: totalStaked = Big(0) as u<Big> } = useTokenStakingAmountQuery(daoAddress);

  const totalSupply = token === undefined ? Big(0) : demicrofy(Big(token.total_supply) as u<Big>, token.decimals);

  const totalStakedPercent =
    token === undefined || Big(token.total_supply ?? 0).eq(0)
      ? Big(0)
      : totalStaked.div(token.total_supply ?? 0).mul(100);

  return {
    isLoading: token === undefined,
    totalStaked,
    totalStakedPercent,
    totalSupply,
    tokenSymbol: token?.symbol ?? '',
    tokenDecimals: token?.decimals ?? 6,
  };
};

const useWalletData = (daoAddress: string, walletAddress: string, totalStaked: u<Big>) => {
  const { data: walletStaked = Big(0) as u<Big> } = useTokenStakingAmountQuery(daoAddress, walletAddress);

  const { data: walletVotingPower = Big(0) } = useVotingPowerQuery(daoAddress, walletAddress);

  const walletStakedPercent = totalStaked.eq(0) ? Big(0) : walletStaked.div(totalStaked).mul(100);

  const pendingClaims = usePendingClaims(daoAddress, walletAddress);

  const { data: releasableClaims = [] } = useReleasableClaimsQuery(daoAddress, walletAddress);

  const claimableAmount =
    releasableClaims.length > 0 && 'cw20' in releasableClaims[0].asset
      ? (Big(releasableClaims[0].asset.cw20.amount) as u<Big>)
      : (Big(0) as u<Big>);

  return {
    walletStaked,
    walletStakedPercent,
    walletVotingPower,
    claimableAmount,
    pendingClaims,
  };
};

interface LayoutProps {
  walletAddress: string;
  dao: DAO;
}

const Connected = (props: LayoutProps) => {
  const { walletAddress, dao } = props;

  const tokenAddress = dao.membershipContractAddress;

  const { data: token } = useCW20TokenInfoQuery(tokenAddress);

  const { isLoading, totalStaked, totalStakedPercent, totalSupply, tokenSymbol, tokenDecimals } = useTokenData(
    dao.address,
    tokenAddress
  );

  const { walletStaked, walletStakedPercent, walletVotingPower, claimableAmount, pendingClaims } = useWalletData(
    dao.address,
    walletAddress,
    totalStaked
  );

  const { data: balance = Big(0) as u<Big> } = useCW20BalanceQuery(walletAddress, tokenAddress);

  const openStakeTokenDialog = useStakeTokenDialog();

  const openUnstakeTokenDialog = useUnstakeTokenDialog();

  const [claimTxResult, claimTx] = useClaimTx();

  return (
    <>
      <Container className={classNames(styles.root, styles.connected)}>
        <Container className={styles.staking} component="section" direction="column">
          <Container className={styles.header}>
            <DAOLogo logo={dao.logo} variant="large" />
            <Text variant="label" className={styles.title}>
              Voting power
            </Text>
            <Text variant="heading3">
              <AnimateNumber format={(v) => `${formatAmount(v, { decimals: 2 })}%`}>
                {walletVotingPower.mul(100)}
              </AnimateNumber>
            </Text>
          </Container>
          <Container className={styles.actions} direction="row">
            <Button
              variant="primary"
              disabled={isLoading || balance.lte(0)}
              onClick={() => {
                openStakeTokenDialog({
                  walletAddress,
                  tokenAddress,
                  daoAddress: dao.address,
                  staked: walletStaked,
                  balance,
                  symbol: tokenSymbol,
                  decimals: tokenDecimals,
                });
              }}
            >
              Stake
            </Button>
            <Button
              variant="secondary"
              disabled={isLoading || walletStaked.lte(0)}
              onClick={() => {
                openUnstakeTokenDialog({
                  walletAddress,
                  tokenAddress,
                  daoAddress: dao.address,
                  staked: walletStaked,
                  symbol: tokenSymbol,
                  decimals: tokenDecimals,
                });
              }}
            >
              Unstake
            </Button>
          </Container>
        </Container>
        <NumericPanel
          className={styles.claim}
          title="Claimable tokens"
          value={demicrofy(claimableAmount, tokenDecimals)}
          decimals={2}
          suffix={tokenSymbol}
          footnote={
            <Container className={styles.actions} direction="row">
              <Button
                variant="secondary"
                disabled={isLoading || claimableAmount.lte(0)}
                loading={claimTxResult.loading}
                onClick={() => {
                  claimTx({ daoAddress: dao.address });
                }}
              >
                Claim all
              </Button>
            </Container>
          }
        />
        <NumericPanel title="Total supply" value={totalSupply} decimals={0} suffix={tokenSymbol} />
        <NumericPanel
          title="Total staked"
          value={demicrofy(totalStaked, tokenDecimals)}
          decimals={2}
          suffix={
            <AnimateNumber format={(v) => `${formatAmount(v, { decimals: 1 })}%`}>{totalStakedPercent}</AnimateNumber>
          }
        />
        <NumericPanel title="Your wallet" value={demicrofy(balance, tokenDecimals)} suffix={tokenSymbol} />
        <NumericPanel
          title="Your total staked"
          value={demicrofy(walletStaked, tokenDecimals)}
          decimals={2}
          suffix={
            <AnimateNumber format={(v) => `${formatAmount(v, { decimals: 1 })}%`}>{walletStakedPercent}</AnimateNumber>
          }
        />
      </Container>
      {token && (
        <PendingClaims
          claims={pendingClaims}
          formatter={(amount) => formatAmount(demicrofy(amount as u<Big>, token.decimals), { decimals: 4 })}
        />
      )}
    </>
  );
};

const NotConnected = (props: Omit<LayoutProps, 'walletAddress'>) => {
  const { dao } = props;

  const { totalStaked, totalStakedPercent, totalSupply, tokenSymbol, tokenDecimals } = useTokenData(
    dao.address,
    dao.membershipContractAddress
  );

  return (
    <Container className={classNames(styles.root)}>
      <NumericPanel title="Total supply" value={totalSupply} decimals={0} suffix={tokenSymbol} />
      <NumericPanel
        title="Total staked"
        value={demicrofy(totalStaked, tokenDecimals)}
        decimals={2}
        suffix={
          <AnimateNumber format={(v) => `${formatAmount(v, { decimals: 1 })}%`}>{totalStakedPercent}</AnimateNumber>
        }
      />
      <WalletNotConnected />
    </Container>
  );
};

interface TokenStakingProps {
  dao: DAO;
}

export const TokenStaking = (props: TokenStakingProps) => {
  const { dao } = props;

  const connectedWallet = useConnectedWallet();

  return Boolean(connectedWallet) ? (
    <Connected walletAddress={connectedWallet!.walletAddress} dao={dao} />
  ) : (
    <NotConnected dao={dao} />
  );
};
