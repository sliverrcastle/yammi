import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import Form from '@components/Form';
import Gnb from '@components/Gnb';
import { Constant, CookieGetter } from '@system/cookie';

import PageComponent from './Page';
import { atomMapKey } from '../../modules/atomMap';
import { setAccessTokenAtom } from '../../modules/auth/atom';
import {
  setSearchResultLisAtom,
  setTopSelectedRestaurantListAtom,
} from '../../modules/board/atom';
import {
  getRestaurantListSearch,
  getSearchResult,
} from '../../modules/board/fetch';

export const getServerSideProps = async ({ req, query }) => {
  const { keyword } = query;
  const cookieGetter = new CookieGetter({ req });
  const accessToken = cookieGetter.get(Constant.USER_ACCESS_TOKEN);

  const [topSelectedRestaurantList, searchList] = await Promise.all([
    getRestaurantListSearch({}, { accessToken }),
    getSearchResult({ keyword: keyword }, { accessToken }),
  ]);
  return {
    props: {
      initialData: {
        [atomMapKey.board.topSelectedRestaurantListAtom]:
          topSelectedRestaurantList.data,
        [atomMapKey.board.searchResultListAtom]: searchList.data,
        [atomMapKey.auth.accessTokenAtom]: accessToken,
      },
    },
  };
};

const Page = ({ initialData }) => {
  const form = useForm();
  const router = useRouter();

  const setTopSelectedRestaurantList = useSetRecoilState(
    setTopSelectedRestaurantListAtom,
  );
  const setSearchResult = useSetRecoilState(setSearchResultLisAtom);
  const setAccessToken = useSetRecoilState(setAccessTokenAtom);

  useEffect(() => {
    setTopSelectedRestaurantList(
      initialData[atomMapKey.board.topSelectedRestaurantListAtom],
    );
    setSearchResult(initialData[atomMapKey.board.searchResultListAtom]);
    setAccessToken(initialData[atomMapKey.auth.accessTokenAtom]);
  }, []);

  const handleSearch = async data => {
    router.push({
      pathname: '/search',
      query: {
        keyword: data.keyword,
      },
    });
  };

  return (
    <Wrapper>
      <Form form={form} onSubmit={form.handleSubmit(handleSearch)}>
        <Gnb isSearch isMenu searchName={'keyword'} />
      </Form>
      <PageComponent />
    </Wrapper>
  );
};

export default Page;
const Wrapper = styled.div``;