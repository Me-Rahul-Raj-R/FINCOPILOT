/**
 * Normalizes page/pageSize query params. Capping pageSize matters once a
 * table has thousands of rows per user (or millions across users) - an
 * unbounded "give me everything" query is one of the fastest ways an app
 * falls over under real load.
 */
function parsePagination(query, { defaultSize = 25, maxSize = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(maxSize, Math.max(1, parseInt(query.pageSize, 10) || defaultSize));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset, limit: pageSize };
}

function paginatedResponse(rows, count, { page, pageSize }) {
  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
    },
  };
}

module.exports = { parsePagination, paginatedResponse };
