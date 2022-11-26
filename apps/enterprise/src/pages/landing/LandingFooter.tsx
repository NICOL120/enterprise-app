import { ExternalLink, UnstyledAnchor } from 'components/link';
import { InternalLink } from 'components/link/InternalLink';
import { Button, Text } from 'components/primitives';
import { discordUrl, mediumUrl, Path, supportEmail, telegramUrl, twitterUrl } from 'navigation';
import { SliceHeader } from './SliceHeader';
import { ReactComponent as TwitterIcon } from 'components/assets/TwitterSolidLogo.svg';
import { ReactComponent as DiscordIcon } from 'components/assets/DiscordSolidLogo.svg';
import { ReactComponent as TelegramIcon } from 'components/assets/TelegramLogo.svg';
import { ReactComponent as MediumIcon } from 'components/assets/MediumLogo.svg';
import styles from './LandingFooter.module.sass';

export const LandingFooter = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <SliceHeader
          title="More in the works"
          description="The team is hard at work making updates and creating new features. Follow Enterprise on social media to find out more."
        />
        <div className={styles.actions}>
          <InternalLink to={Path.Dashboard}>
            <Button component="div">Start now</Button>
          </InternalLink>
          <ExternalLink to={`mailto:${supportEmail}`}>
            <Button component="div">Contact us</Button>
          </ExternalLink>
        </div>
      </div>
      <div className={styles.links}>
        <div className={styles.left}>
          <div className={styles.items}>
            <ExternalLink to={`mailto:${supportEmail}`}>
              <Text variant="text">Contact Us</Text>
            </ExternalLink>
            <UnstyledAnchor
              href=""
              onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();

                window.open(`${document.location.href}docs/terms_of_use.pdf`);
              }}
            >
              <Text variant="text">Terms</Text>
            </UnstyledAnchor>
            <UnstyledAnchor
              href=""
              onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();

                window.open(`${document.location.href}docs/privacy_policy.pdf`);
              }}
            >
              <Text variant="text">Privacy Policy</Text>
            </UnstyledAnchor>
          </div>
        </div>
        <div className={styles.socials}>
          <ExternalLink to={twitterUrl}>
            <TwitterIcon />
          </ExternalLink>
          <ExternalLink to={mediumUrl}>
            <MediumIcon />
          </ExternalLink>
          <ExternalLink to={telegramUrl}>
            <TelegramIcon />
          </ExternalLink>
          <ExternalLink to={discordUrl}>
            <DiscordIcon />
          </ExternalLink>
        </div>
      </div>
    </div>
  );
};
