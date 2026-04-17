export const viewerMenuStoryArgs = {
  pageDirection: "left",
  readingStyle: "singlePage",
  autoPageTurning: false,
}

export const viewerMenuStoryArgTypes = {
  onSelectPageDirection: { action: "Change page direction." },
  onSelectReadingStyle: { action: "Change reading style." },
  onSelectCurrentPageAsCover: { action: "Set current page as cover." },
  onSelectLeftPageAsCover: { action: "Set left page as cover." },
  onSelectRightPageAsCover: { action: "Set right page as cover." },
  onToggleAutoPageTurning: { action: "Toggle auto page turning." },
  onToggleAnnotationPanel: { action: "Toggle annotations panel." },
  onShowReadingSettings: { action: "Show reading settings." },
  onShowToc: { action: "Show table of contents." },
  onAddBookmark: { action: "Add bookmark." },
}
