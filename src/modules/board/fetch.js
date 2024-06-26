import fetcher from '@system/fetcher';

//카테고리별 식당 리스트
export const getRestaurantList = async (query, option) => {
  const fetchRes = await fetcher(`/board/rest_cate_list`, {
    ...option,
    method: 'GET',
    querystring: query,
  });
  return fetchRes;
};

export const getRandomRestaurant = async (query, option) => {
  const fetchRes = await fetcher(`/board/random_rest`, {
    ...option,
    method: 'GET',
    querystring: query,
  });
  return fetchRes;
};

export const getRestaurant = async (params, option) => {
  const { id } = params;
  const fetchRes = await fetcher(`/board/rest_detail/${id}`, {
    ...option,
    method: 'GET',
  });
  return fetchRes;
};

export const getRestaurantListSearch = async (query, option) => {
  const fetchRes = await fetcher(`/board/search_list`, {
    ...option,
    method: 'GET',
    querystring: query,
  });
  return fetchRes;
};

export const getReviewList = async (params, query, option) => {
  const { id } = params;
  const fetchRes = await fetcher(`/board/review_list/${id}`, {
    ...option,
    method: 'GET',
    querystring: query,
  });
  return fetchRes;
};

export const createReview = async (body, option) => {
  const fetchRes = await fetcher(`/board/review_create`, {
    ...option,
    method: 'POST',
    body: JSON.stringify(body),
  });
  return fetchRes;
};

export const updateReview = async (params, body, option) => {
  const { id } = params;
  const fetchRes = await fetcher(`/board/review_update/${id}`, {
    ...option,
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return fetchRes;
};

export const deleteReview = async (params, option) => {
  const { id } = params;
  const fetchRes = await fetcher(`/board/review_delete/${id}`, {
    ...option,
    method: 'DELETE',
  });
  return fetchRes;
};

export const getSearchResult = async (query, option) => {
  const fetchRes = await fetcher(`/board/search`, {
    ...option,
    method: 'GET',
    querystring: query,
  });
  return fetchRes;
};
