import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Image from '@components/Image';

import { accessTokenAtom } from '../../modules/auth/atom';

const Component = () => {
  const router = useRouter();
  const accessToken = useRecoilValue(accessTokenAtom);

  const BnbItems = [
    {
      link: '/categories',
      icon: 'map-pin',
    },
    {
      link: '/search',
      icon: 'search',
    },
    {
      link: '/',
      icon: 'home',
    },
    {
      link: !!accessToken ? '/favorites/bookmarks' : '/login',
      icon: 'star',
    },
    {
      link: !!accessToken ? '/my-page' : '/login',
      icon: 'user',
    },
  ];

  const focusState = useCallback(
    item => {
      if (
        (router.pathname === '/' || router.pathname === '/random-pick') &&
        item.link === '/'
      ) {
        return true;
      }
      if (
        router.pathname.startsWith('/categories') &&
        item.link === '/categories'
      ) {
        return true;
      }
      if (
        router.pathname.startsWith('/favorites') &&
        item.link === '/favorites/bookmarks'
      ) {
        return true;
      }
      if (router.pathname.startsWith('/my-page') && item.link === '/my-page') {
        return true;
      }
      if (router.pathname.startsWith('/search') && item.link === '/search') {
        return true;
      }
    },
    [router],
  );

  return (
    <Wrapper>
      <Container>
        {BnbItems.map(item => (
          <IconWrapper key={item.icon} onClick={() => router.push(item.link)}>
            <Image
              src={`/images/${item.icon}${focusState(item) ? '_clicked' : ''}.svg`}
              alt={item.icon}
              width={28}
              height={28}
            />
          </IconWrapper>
        ))}
      </Container>
    </Wrapper>
  );
};

export default Component;
const Wrapper = styled.div`
  position: fixed;
  width: 100%;
  bottom: 0;

  z-index: 100;
  width: 375px;
  margin: 0 auto;
  left: 50%;
  transform: translate(-50%);
  ${({ theme }) => theme.responsive('sm')} {
    width: 100%;
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;

  height: 82px;
  padding: 12px 16px 42px;
  border-top: ${({ theme }) => `1px solid ${theme.colors.neutral[400]}`};
`;
const IconWrapper = styled.div`
  cursor: pointer;
`;
