import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import Gnb from '@components/Gnb';
import { Constant, CookieGetter } from '@system/cookie';

import PageComponent from './Page';
import { atomMapKey } from '../../../modules/atomMap';
import { setAccessTokenAtom } from '../../../modules/auth/atom';
import {
  restaurantDetailAtom,
  setRestaurantDetailAtom,
  setReviewListAtom,
} from '../../../modules/board/atom';
import { getRestaurant, getReviewList } from '../../../modules/board/fetch';

export const getServerSideProps = async ({ req, query }) => {
  const cookieGetter = new CookieGetter({ req });
  const accessToken = cookieGetter.get(Constant.USER_ACCESS_TOKEN);
  const isLoggedIn = !!accessToken;
  const { id } = query;
  try {
    let token = null;
    if (isLoggedIn) {
      token = accessToken;
    }
    const [restaurant, reviewList] = await Promise.all([
      getRestaurant(
        {
          id: id,
        },
        { accessToken },
      ),
      getReviewList(
        {
          id: id,
        },
        { orderby: 'star' },
        { accessToken },
      ),
    ]);
    return {
      props: {
        initialData: {
          [atomMapKey.board.restaurantDetailAtom]: restaurant,
          [atomMapKey.board.reviewListAtom]: reviewList,
          [atomMapKey.auth.accessTokenAtom]: token,
        },
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {},
    };
  }
};

const Page = ({ initialData }) => {
  const setRestaurantDetail = useSetRecoilState(setRestaurantDetailAtom);
  const setReviewList = useSetRecoilState(setReviewListAtom);
  const setAccessToken = useSetRecoilState(setAccessTokenAtom);

  useEffect(() => {
    setRestaurantDetail(initialData[atomMapKey.board.restaurantDetailAtom]);
    setReviewList(initialData[atomMapKey.board.reviewListAtom]);
    setAccessToken(initialData[atomMapKey.auth.accessTokenAtom]);
  }, []);

  const restaurant = useRecoilValue(restaurantDetailAtom);

  return (
    <Wrapper>
      <Gnb isBack title={restaurant.name} />
      <PageComponent />
    </Wrapper>
  );
};

export default Page;

const Wrapper = styled.div``;
