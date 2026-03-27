export function formatPageIndicator(currentPage: number, totalPage: number, facingPage: boolean) {
  const firstPage = Math.max(currentPage, 0) + 1

  if (!facingPage) {
    return `${firstPage}/${totalPage}`
  }

  const secondPage = firstPage + 1
  if (secondPage <= totalPage) {
    return `${firstPage}-${secondPage}/${totalPage}`
  }

  return `${firstPage}/${totalPage}`
}
