import { AuthorModel } from "./AuthorModel"
import { AvailabilityModel } from "./AvailabilityModel"
import { CategoryModel } from "./CategoryModel"
import { CopiesModel } from "./CopiesModel"
import { EntryModel } from "./EntryModel"
import { HoldsModel } from "./HoldsModel"
import { IndirectAcquisitionModel } from "./IndirectAcquisitionModel"
import { LinkModel } from "./LinkModel"
import { OpdsChildrenModel, OpdsModel, OpdsRootStore } from "./OpdsRootStore"

describe("OPDS models", () => {
  test("base models create", () => {
    const author = AuthorModel.create({ name: "author", uri: null, email: null })
    const category = CategoryModel.create({ label: "Label", schema: "Schema", term: "Term" })
    const availability = AvailabilityModel.create({
      state: "available",
      status: "ready",
      since: new Date("2024-01-01T00:00:00.000Z"),
      until: new Date("2024-01-02T00:00:00.000Z"),
    })
    const copies = CopiesModel.create({ total: 3, available: 1 })
    const holds = HoldsModel.create({ total: 2, position: 1 })
    const indirect = IndirectAcquisitionModel.create({
      opdsIndirectAcquisitionType: "application/epub+zip",
      opdsIndirectAcquisitions: null,
    })

    expect(author.name).toBe("author")
    expect(category.label).toBe("Label")
    expect(availability.state).toBe("available")
    expect(copies.available).toBe(1)
    expect(holds.position).toBe(1)
    expect(indirect.opdsIndirectAcquisitionType).toBe("application/epub+zip")
  })

  test("LinkModel rel helpers work", () => {
    const link = LinkModel.create({
      type: "application/atom+xml",
      rel: null,
      href: "/opds",
      title: "OPDS",
      opdsPrice: null,
      opdsPriceCurrencyCode: null,
      opdsIndirectAcquisitions: [],
      opdsAvailability: null,
      opdsCopies: null,
      opdsHolds: null,
      lcpHashedPassphrase: null,
      thrCount: null,
      facetGroup: null,
    })

    expect(link.hasRel()).toBe(false)
    link.setRel("start")
    expect(link.hasRel()).toBe(true)
    expect(link.rel).toBe("start")
  })

  test("EntryModel creates with nested arrays", () => {
    const entry = EntryModel.create({
      author: [{ name: "A", uri: null, email: null }],
      bibFrameDistributionProviderName: null,
      categories: [{ label: "l", schema: "s", term: "t" }],
      title: "Title",
      titleType: null,
      subTitle: null,
      subTitleType: null,
      summary: null,
      summaryType: null,
      id: "id-1",
      updated: null,
      content: null,
      contentType: null,
      dcExtent: null,
      dcIdentifier: null,
      dcIdentifierType: null,
      dcLanguage: null,
      dcPublisher: null,
      dcRights: null,
      dcIssued: null,
      published: null,
      link: [],
      schemaRatingValue: null,
      schemaRatingAdditionalType: null,
      schemaAdditionalType: null,
    })

    expect(entry.author[0].name).toBe("A")
    expect(entry.categories[0].term).toBe("t")
    expect(entry.id).toBe("id-1")
  })

  test("OpdsRootStore add child", () => {
    const store = OpdsRootStore.create({})
    const child = OpdsChildrenModel.create({
      linkPath: "/opds/next",
      opds: OpdsModel.create({}),
    })

    store.add(child)

    expect(store.children).toHaveLength(1)
    expect(store.children[0].linkPath).toBe("/opds/next")
  })
})
