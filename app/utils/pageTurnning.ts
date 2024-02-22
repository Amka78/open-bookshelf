export function goToPreviousPage(pageNum: number, transitionPages: number) {
  let currentPage = pageNum
  if (pageNum > 0) {
    currentPage = pageNum - transitionPages
  }

  if (pageNum < 0) {
    currentPage = 0
  }
  return currentPage
}

export function goToNextPage(pageNum: number, totalPage: number, transitionPages: number) {
  let currentPage = pageNum
  if (pageNum < totalPage - 1) {
    console.tron.log(`page moved current page: ${pageNum} total page: ${totalPage}`)
    currentPage = pageNum + transitionPages
  }
  return currentPage
}
