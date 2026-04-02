export const viewerMenuStoryArgs = {
  pageDirection: "left",
  readingStyle: "singlePage",
  autoPageTurning: false,
  autoPageTurnIntervalMs: 3000,
}

export const viewerMenuStoryArgTypes = {
  onSelectPageDirection: { action: "Change page direction." },
  onSelectReadingStyle: { action: "Change reading style." },
  onSelectCurrentPageAsCover: { action: "Set current page as cover." },
  onSelectLeftPageAsCover: { action: "Set left page as cover." },
  onSelectRightPageAsCover: { action: "Set right page as cover." },
  onToggleAutoPageTurning: { action: "Toggle auto page turning." },
  onAutoPageTurnIntervalChange: { action: "Change auto page interval." },
}
