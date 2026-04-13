/**
 * Generate an epubcfi string for a given page in a comic/CBZ book.
 *
 * Calibre uses synthetic CFIs for image-based formats in the form:
 *   epubcfi(/2/2/4/N[page_M]@X:Y.YY)
 *
 * Where:
 *   - /2/2/4 -- fixed base path for the viewer's rendered content
 *   - N -- spine element index, computed as (pageNumber * 2) where pageNumber is 1-based
 *   - [page_M] -- ID assertion with M being the 1-based page number for display
 *   - @X:Y.YY -- spatial offset (percentage position within the image)
 *
 * @param page - 0-based page index
 * @param spatialX - horizontal position percentage (0-100), defaults to 50
 * @param spatialY - vertical position percentage (0-100), defaults to 49.87
 * @returns epubcfi string suitable for Calibre's set-last-read-position endpoint
 */
export function generateCfiForPage(page: number, spatialX = 50, spatialY = 49.87): string {
  const pageNumber = page + 1
  const spineIndex = pageNumber * 2
  return `epubcfi(/2/2/4/${spineIndex}[page_${pageNumber}]@${spatialX}:${spatialY.toFixed(2)})`
}
