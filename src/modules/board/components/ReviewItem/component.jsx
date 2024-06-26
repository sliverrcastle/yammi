import { ajvResolver } from '@hookform/resolvers/ajv';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import Button from '@components/Button';
import Form from '@components/Form';
import Image from '@components/Image';
import Textarea from '@components/Textarea';
import Typography from '@components/Typography';
import { NetworkError } from '@system/fetcher';
import { dateFormatter } from '@system/stringUtils/date';

import useConfirm from '../../../../hooks/useConfirm';
import { useToast } from '../../../../hooks/useToast';
import { accessTokenAtom } from '../../../auth/atom';
import {
  deleteReview,
  getReviewList,
  updateReview,
} from '../../../board/fetch';
import { setReviewListAtom } from '../../atom';
import getReviewDto from '../../models/ReviewValidation';

const Component = ({ item, isLast }) => {
  const accessToken = useRecoilValue(accessTokenAtom);
  const setReviewList = useSetRecoilState(setReviewListAtom);

  const {
    comment,
    created_date,
    id,
    restaurant,
    star,
    updated_date,
    user,
    isOwner,
  } = item;

  const { addToast } = useToast();
  const {
    open: openDelete,
    close: closeDelete,
    ConfirmModalWrapper: DeleteConfirmModalWrapper,
  } = useConfirm();
  const form = useForm({
    defaultValues: { comment: comment },
    resolver: ajvResolver(getReviewDto()),
  });

  const [clicked, setClicked] = useState(false);

  const renderStar = useMemo(() => {
    let array = new Array(5 - star).fill(false);
    let starCount = new Array(star).fill(true);
    return starCount.concat(array);
  }, [item]);

  //하나로 합칠까....
  const handleDeleteReview = async () => {
    try {
      await deleteReview({
        id: id,
      });
      addToast({
        title: '리뷰 삭제 성공했습니다.',
        appearance: 'success',
      });
      const response = await getReviewList({}, { accessToken });
      setReviewList(response);
    } catch (err) {
      if (err instanceof NetworkError) {
        addToast({
          title: err.message,
          appearance: 'error',
        });
      } else {
        addToast({
          title: '리뷰를 삭제하는데 오류가 발생했습니다.',
          appearance: 'warn',
        });
      }
    } finally {
      closeDelete();
    }
  };

  const handleReviewUpdate = async data => {
    try {
      await updateReview(
        {
          id: id,
        },
        { comment: data.comment },
      );
      addToast({
        title: '리뷰 수정 성공했습니다.',
        appearance: 'success',
      });
      const response = await getReviewList({}, { accessToken });
      setReviewList(response);
    } catch (err) {
      if (err instanceof NetworkError) {
        addToast({
          title: err.message,
          appearance: 'error',
        });
      } else {
        addToast({
          title: '리뷰를 수정하는데 오류가 발생했습니다.',
          appearance: 'warn',
        });
      }
    } finally {
      setClicked(!clicked);
    }
  };

  return (
    <Wrapper $isLast={isLast}>
      <Flex $justifyContent={'space-between'} $margin={'0 0 4px'}>
        <TypoXS>{user.nickname}</TypoXS>
        {accessToken && isOwner ? (
          <Flex $gap={'4px'}>
            <TextButton onClick={() => setClicked(!clicked)}>수정</TextButton>
            <Divider />
            <TextButton onClick={openDelete}>삭제</TextButton>
          </Flex>
        ) : null}
      </Flex>
      <Flex $margin={'0 0 8px'} $gap={'8px'}>
        <Flex $gap={'4px'}>
          {renderStar.map((item, index) => (
            <StarWrapper key={index}>
              <Image
                src={
                  item
                    ? '/images/star_filled.svg'
                    : '/images/star_filled_gray.svg'
                }
                width={13}
                height={13}
                alt={''}
              />
            </StarWrapper>
          ))}
        </Flex>
        <DateTime>{dateFormatter(created_date)}</DateTime>
      </Flex>
      {clicked ? (
        <Form form={form} onSubmit={handleReviewUpdate}>
          <FormFlex>
            <Textarea
              name="comment"
              placeholder={'식당에 대한 리뷰를 남겨주세요.'}
            />
            <Button
              label={'등록'}
              appearance="primary"
              minWidth={'60'}
              type={'submit'}
            />
          </FormFlex>
        </Form>
      ) : (
        <Comment>{comment}</Comment>
      )}

      <DeleteConfirmModalWrapper
        content={'선택한 댓글을 삭제하시겠습니까?'}
        buttons={[
          {
            label: '취소',
            onClick: closeDelete,
          },
          {
            label: '삭제',
            onClick: () => handleDeleteReview(),
          },
        ]}
      />
    </Wrapper>
  );
};
export default Component;

const Wrapper = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  padding-bottom: 16px;
  margin-bottom: ${({ $isLast }) => ($isLast ? '0' : '20px')};
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ $justifyContent }) => $justifyContent};
  margin: ${({ $margin }) => $margin};
  gap: ${({ $gap }) => $gap};
`;

const FormFlex = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  button {
    height: 104px;
  }
`;

const StarWrapper = styled.div`
  width: 16px;
  height: 16px;
`;

const TypoXS = styled(Typography).attrs({
  variant: 'xs',
  fontWeight: 'regular',
})``;

const TextButton = styled(Typography).attrs({
  variant: 's',
  fontWeight: 'regular',
})`
  color: ${({ theme }) => theme.colors.neutral[700]};
  padding: 0 8px;
  cursor: pointer;
`;

const DateTime = styled(TypoXS)`
  color: ${({ theme }) => theme.colors.neutral[600]};
`;

const Comment = styled(Typography).attrs({
  variant: 'm',
  fontWeight: 'regular',
})``;

const Divider = styled.div`
  width: 1px;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
`;
