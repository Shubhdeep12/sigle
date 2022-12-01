import {
  Box,
  Button,
  Flex,
  Typography,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../../ui';
import Link from 'next/link';
import Image from 'next/image';
import { generateAvatar } from '../../utils/boringAvatar';
import { SettingsFile } from '../../types';
import { styled } from '../../stitches.config';
import { useAuth } from '../auth/AuthContext';
import { useGetUserByAddress } from '../../hooks/users';
import {
  useGetGaiaUserFollowing,
  useUserFollow,
  useUserUnfollow,
} from '../../hooks/appData';
import { useTheme } from 'next-themes';
import { sigleConfig } from '../../config';
import { useState } from 'react';
import { LoginModal } from '../loginModal/LoginModal';

const ProfileImageContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  br: '$1',
  overflow: 'hidden',
  width: 56,
  height: 56,
});

const ProfileImage = styled('img', {
  width: 'auto',
  height: '100%',
  maxWidth: 56,
  maxHeight: 56,
  objectFit: 'cover',
});

interface ProfileCardProps {
  children: React.ReactNode;
  settings: SettingsFile;
  userInfo: { username: string; address: string };
}

export const ProfileCard = ({
  children,
  settings,
  userInfo,
}: ProfileCardProps) => {
  const { user, isLegacy } = useAuth();
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPromptDialog, setShowLoginPromptDialog] = useState(false);
  const { data: userFollowing } = useGetGaiaUserFollowing({
    enabled: isOpen && !!user && userInfo.username !== user.username,
    staleTime: Infinity,
  });
  const { data: userInfoByAddress } = useGetUserByAddress(userInfo.address, {
    enabled: isOpen,
    staleTime: Infinity,
  });
  const { mutate: followUser } = useUserFollow();
  const { mutate: unfollowUser } = useUserUnfollow();

  const isFollowingUser =
    userFollowing && !!userFollowing.following[userInfo.address];

  const handleFollow = async () => {
    if (!userFollowing) return;
    followUser({ userFollowing, address: userInfo.address });
  };

  const handleUnfollow = async () => {
    if (!userFollowing) {
      return;
    }
    unfollowUser({ userFollowing, address: userInfo.address });
  };

  const siteName = settings.siteName || userInfo.username;

  const handleShowLoginPrompt = () => setShowLoginPromptDialog(true);

  const handleCancelLoginPrompt = () => setShowLoginPromptDialog(false);

  return (
    <HoverCard onOpenChange={(open) => setIsOpen(open)} openDelay={300}>
      <Link
        href="/[username]"
        as={`/${userInfo.username}`}
        passHref
        legacyBehavior
      >
        <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      </Link>
      <HoverCardContent
        sideOffset={40}
        css={{
          display: 'flex',
          gap: '$2',
          flexDirection: 'column',
          width: 280,
        }}
      >
        <Flex justify="between">
          <ProfileImageContainer>
            <ProfileImage
              src={
                settings?.siteLogo
                  ? settings.siteLogo
                  : generateAvatar(userInfo.address)
              }
            />
          </ProfileImageContainer>
          {user?.username !== userInfo.username &&
            !isLegacy &&
            (!isFollowingUser ? (
              <Button
                size="sm"
                color="orange"
                css={{ ml: '$5', alignSelf: 'start' }}
                onClick={user ? handleFollow : handleShowLoginPrompt}
              >
                Follow
              </Button>
            ) : (
              <Button
                size="sm"
                variant="subtle"
                css={{ ml: '$5', alignSelf: 'start' }}
                onClick={handleUnfollow}
              >
                Unfollow
              </Button>
            ))}
        </Flex>
        <Flex gap="1" align="center">
          <Link
            href="/[username]"
            as={`/${userInfo.username}`}
            passHref
            legacyBehavior
          >
            <Typography as="a" css={{ fontWeight: 600 }} size="subheading">
              {siteName}
            </Typography>
          </Link>
          {userInfoByAddress?.subscription && (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <a
                  href={`${sigleConfig.gammaUrl}/${userInfoByAddress.subscription.nftId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src={
                      resolvedTheme === 'dark'
                        ? '/img/badges/creatorPlusDark.svg'
                        : '/img/badges/creatorPlusLight.svg'
                    }
                    alt="Creator + badge"
                    width={12}
                    height={12}
                  />
                </a>
              </TooltipTrigger>
              <TooltipContent
                css={{ boxShadow: 'none' }}
                side="right"
                sideOffset={8}
              >
                Creator + Explorer #{userInfoByAddress.subscription.nftId}
              </TooltipContent>
            </Tooltip>
          )}
        </Flex>
        <Typography css={{ color: '$gray9' }} size="subheading">
          {settings.siteDescription}
        </Typography>
        <Flex gap="3">
          <Link
            href={{
              pathname: `/[username]`,
              query: { tab: 'followers' },
            }}
            as={`/${userInfo.username}`}
            passHref
            legacyBehavior
          >
            <Typography
              as="a"
              size="subheading"
              css={{ color: '$gray9', cursor: 'pointer' }}
            >
              <Box css={{ color: '$gray11', mr: 2 }} as="span">
                {userInfoByAddress ? userInfoByAddress.followersCount : 0}
              </Box>
              Followers
            </Typography>
          </Link>
          <Link
            href={{
              pathname: `/[username]`,
              query: { tab: 'following' },
            }}
            as={`/${userInfo.username}`}
            passHref
            legacyBehavior
          >
            <Typography
              as="a"
              size="subheading"
              css={{ color: '$gray9', cursor: 'pointer' }}
            >
              <Box css={{ color: '$gray11', mr: 2 }} as="span">
                {userInfoByAddress ? userInfoByAddress.followingCount : 0}
              </Box>
              Following
            </Typography>
          </Link>
        </Flex>
      </HoverCardContent>

      <LoginModal
        open={showLoginPromptDialog}
        onClose={handleCancelLoginPrompt}
      />
    </HoverCard>
  );
};
