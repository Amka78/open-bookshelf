import { describe as baseDescribe, expect, jest, test as baseTest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { playBookEditModalFormatClickRunsUpload } from "./bookEditModalStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("BookEditModal story play", () => {
  const onClick = jest.fn()

  const renderModalDom = () =>
    render(
      <div>
        <button data-testid="book-edit-modal-format-upload" type="button" onClick={onClick}>
          upload
        </button>
      </div>,
    )

  test("clicking format upload trigger fires the upload handler", async () => {
    const { container } = renderModalDom()
    await playBookEditModalFormatClickRunsUpload({ canvasElement: container })
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
