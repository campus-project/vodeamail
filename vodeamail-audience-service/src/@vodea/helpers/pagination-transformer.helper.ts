export const paginationTransformer = (data: any[], total: number) => {
  return {
    data,
    meta: {
      total,
    },
  };
};
