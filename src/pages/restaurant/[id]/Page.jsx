import { ajvResolver } from '@hookform/resolvers/ajv';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Element } from 'react-scroll';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import Button from '@components/Button';
import ChipGroup from '@components/ChipGroup';
import EmptyState from '@components/EmptyState';
import Form from '@components/Form';
import Tab from '@components/Tab';
import Textarea from '@components/Textarea';
import Typography from '@components/Typography';
import { NetworkError } from '@system/fetcher';
import withComma from '@system/stringUtils/withComma';

import { useToast } from '../../../hooks/useToast';
import { accessTokenAtom } from '../../../modules/auth/atom';
import {
  restaurantDetailAtom,
  reviewListAtom,
  setReviewListAtom,
} from '../../../modules/board/atom';
import MenuItemList from '../../../modules/board/components/MenuItemList';
import RestuarantDetail from '../../../modules/board/components/RestuarantDetail';
import ReviewItemList from '../../../modules/board/components/ReviewItemList';
import StarSelector from '../../../modules/board/components/StarSelector';
import { createReview, getReviewList } from '../../../modules/board/fetch';
import getReviewDto from '../../../modules/board/models/ReviewValidation';

const Component = () => {
  const tabList = [
    {
      label: '메뉴',
      value: 'menu',
    },
    {
      label: '리뷰',
      value: 'review',
    },
    // {
    //   label: '위치',
    //   value: 'map',
    // },
  ];

  const form = useForm({
    resolver: ajvResolver(getReviewDto()),
  });
  const { addToast } = useToast();
  const menuRef = useRef(null);
  const reviewRef = useRef(null);

  const reviewList = useRecoilValue(reviewListAtom);
  const restaurantDetail = useRecoilValue(restaurantDetailAtom);
  const accessToken = useRecoilValue(accessTokenAtom);

  const setReviewList = useSetRecoilState(setReviewListAtom);

  const slicedMenuList = restaurantDetail.menu.slice(0, 3);
  const slicedReviewList = reviewList.slice(0, 3);

  const [isMore, setIsMore] = useState(true);
  const [isMoreReview, setIsMoreReview] = useState(true);
  const [focusTab, setFocusTab] = useState(tabList[0].value);
  const [isReviewCreateLoading, setIsReviewCreateLoading] = useState(false);

  const reviewQueryOptions = [
    {
      label: '인기순',
      value: 'star',
    },
    { label: '최근순', value: 'date' },
  ];

  const handleCreateReview = async data => {
    try {
      if (data.star === 0) {
        addToast({
          title: '식당의 점수를 선택해주세요.',
          appearance: 'warn',
        });
      } else {
        setIsReviewCreateLoading(true);
        await createReview(
          {
            star: data.star,
            comment: data.comment,
            restaurant: restaurantDetail.id,
          },
          { accessToken },
        );
        addToast({
          title: '리뷰가 작성되었습니다.',
          appearance: 'success',
        });

        const response = await getReviewList(
          { id: restaurantDetail.id },
          { accessToken },
        );
        setReviewList(response);
        setIsReviewCreateLoading(false);
      }
    } catch (err) {
      console.log(err);
      if (err instanceof NetworkError) {
        addToast({
          title: err.message,
          appearance: 'error',
        });
      } else {
        addToast({
          title: '리뷰를 작성하는데 오류가 발생했습니다.',
          appearance: 'warn',
        });
      }
    } finally {
      form.setValue('comment', '');
      form.setValue('star', 0);
    }
  };

  const handleQuery = async value => {
    try {
      const res = await getReviewList(
        {
          id: restaurantDetail.id,
        },
        {
          orderby: value,
        },
        { accessToken },
      );
      setReviewList(res);
    } catch (err) {
      if (err instanceof NetworkError) {
        addToast({
          title: err.message,
          appearance: 'error',
        });
      } else {
        addToast({
          title: '에러 발생',
          appearance: 'warn',
        });
      }
    }
  };

  useEffect(() => {
    if (typeof window === undefined) {
      return;
    }
    window.addEventListener('scroll', event => {
      let menuHeight = menuRef?.current?.offsetHeight;
      let reviewHeight = reviewRef?.current?.offsetHeight;
      let scrollTop = document.documentElement.scrollTop;
      if (menuHeight >= scrollTop) {
        setFocusTab(tabList[0].value);
      } else if (reviewHeight >= scrollTop) {
        setFocusTab(tabList[1].value);
      }
    });
  }, []);

  return (
    <Wrapper>
      <RestuarantDetail reviewTotal={reviewList.length} />
      <Divider />
      <TabWrapper>
        <Tab items={tabList} id={'detail'} isCenter defaultValue={focusTab} />
      </TabWrapper>
      <Element name="menu">
        <Content ref={menuRef}>
          <Title>메뉴</Title>
          {restaurantDetail.menu.length > 0 ? (
            <>
              <MenuItemList
                list={isMore ? slicedMenuList : restaurantDetail.menu}
              />
              {restaurantDetail.menu.length > 3 && (
                <Button
                  label={
                    <>
                      <ButtonLabel>메뉴</ButtonLabel>{' '}
                      {isMore ? '더보기' : '숨기기'}
                    </>
                  }
                  block
                  appearance="subtle"
                  onClick={() => setIsMore(!isMore)}
                />
              )}
            </>
          ) : (
            <EmptyState title={'메뉴가 없습니다.'} />
          )}
        </Content>
      </Element>
      <Divider />
      <Element name={'review'}>
        <Content ref={reviewRef}>
          <Title>리뷰 {withComma(reviewList.length)}개</Title>
          {reviewList.length > 0 ? (
            <>
              <ChipWrapper>
                <ChipGroup
                  options={reviewQueryOptions}
                  defaultValue={reviewQueryOptions[0].value}
                  onClick={value => handleQuery(value)}
                />
              </ChipWrapper>
              <ReviewItemList
                list={isMoreReview ? slicedReviewList : reviewList}
              />
              {reviewList.length > 3 && (
                <Button
                  label={
                    <>
                      <ButtonLabel>리뷰</ButtonLabel>{' '}
                      {isMoreReview ? '더보기' : '숨기기'}
                    </>
                  }
                  block
                  appearance="subtle"
                  onClick={() => setIsMoreReview(!isMoreReview)}
                />
              )}
            </>
          ) : (
            <EmptyState
              isIcon
              title={'등록된 리뷰가 없습니다.'}
              description={'리뷰를 작성해주세요!'}
            />
          )}

          {accessToken && !reviewList.some(item => item.owner) ? (
            <>
              <Title $marginTop={'14px'}>리뷰 작성하기</Title>
              <Form form={form} onSubmit={handleCreateReview}>
                <StarSelector name="star" />
                <Flex>
                  <Textarea
                    name="comment"
                    placeholder={'식당에 대한 리뷰를 남겨주세요.'}
                  />
                  <Button
                    label={'등록'}
                    appearance="primary"
                    minWidth={'60'}
                    type={'submit'}
                    loading={isReviewCreateLoading}
                  />
                </Flex>
              </Form>
            </>
          ) : null}
        </Content>
      </Element>
    </Wrapper>
  );
};

export default Component;
const Wrapper = styled.div`
  padding-bottom: 100px;
`;
const TabWrapper = styled.div`
  position: sticky;
  top: 56px;
  z-index: 10;
`;

const Flex = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  button {
    height: 104px;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.neutral[200]};
`;
const Content = styled.div`
  padding: 20px 16px;
`;
const Title = styled(Typography).attrs({
  variant: 'm',
  fontWeight: 'bold',
})`
  margin-bottom: 20px;
  margin-top: ${({ $marginTop }) => $marginTop};
`;

const StarImageWrapper = styled.div`
  width: 20px;
  height: 20px;
  padding: 1px;
`;

const ButtonLabel = styled(Typography).attrs({
  fontWeight: 'bold',
  variant: 'm',
  component: 'span',
})`
  color: inherit;
`;
const ChipWrapper = styled.div`
  margin-bottom: 20px;
`;
