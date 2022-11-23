import { api } from "../../services/api"
import { OpdsRootStore } from "./OpdsRootStore"

const sampleXml = `<?xml version='1.0' encoding='utf-8'?>
<feed xmlns=\"http://www.w3.org/2005/Atom\" xmlns:dc=\"http://purl.org/dc/terms/\" xmlns:opds=\"http://opds-spec.org/2010/catalog\">
  <title>calibre ライブラリ</title>
  <subtitle>ライブラリにある本</subtitle>
  <author>
    <name>calibre</name>
    <uri>https://calibre-ebook.com</uri>
  </author>
  <id>urn:calibre:main</id>
  <icon>/favicon.png</icon>
  <updated>2022-11-19T14:47:00+00:00</updated>
  <link type=\"application/atom+xml\" rel=\"search\" title=\"Search\" href=\"/opds/search/{searchTerms}?library_id=config\"/>
  <link type=\"application/atom+xml;type=feed;profile=opds-catalog\" rel=\"start\" href=\"/opds?library_id=config\"/>
  <entry>
    <title>&gt; 最新順</title>
    <id>calibre-navcatalog:483bb9d46b5a7a19de8f3b7032ca7abcc3815afe</id>
    <updated>2022-11-19T14:47:00+00:00</updated>
    <content type=\"text\">本の整列 日付</content>
    <link type=\"application/atom+xml;type=feed;profile=opds-catalog\" href=\"/opds/navcatalog/4f6e6577657374?library_id=config\"/>
  </entry>
  <entry>
    <title>&gt; タイトル</title>
    <id>calibre-navcatalog:537b652756ba6827b7d9dc3273ea188500d454cd</id>
    <updated>2022-11-19T14:47:00+00:00</updated>
    <content type=\"text\">本の整列 タイトル</content>
    <link type=\"application/atom+xml;type=feed;profile=opds-catalog\" href=\"/opds/navcatalog/4f7469746c65?library_id=config\"/>
  </entry>
  <entry>
    <title>&gt; シリーズ</title>
    <id>calibre-navcatalog:39d44664c95d4115624f2afcd06e2b5aff644ab0</id>
    <updated>2022-11-19T14:47:00+00:00</updated>
    <content type=\"text\">本の整列 シリーズ</content>
    <link type=\"application/atom+xml;type=feed;profile=opds-catalog\" href=\"/opds/navcatalog/4e736572696573?library_id=config\"/>
  </entry>
  <entry>
    <title>&gt; タグ</title>
    <id>calibre-navcatalog:d81415568ebbff945d57d750d0fee9da3d58e380</id>
    <updated>2022-11-19T14:47:00+00:00</updated>
    <content type=\"text\">本の整列 タグ</content>
    <link type=\"application/atom+xml;type=feed;profile=opds-catalog\" href=\"/opds/navcatalog/4e74616773?library_id=config\"/>
  </entry>
  <entry>
    <title>&gt; 発行者</title>
    <id>calibre-navcatalog:6576b12a9d4d317a48d85712dfab7a3dbd71225e</id>
    <updated>2022-11-19T14:47:00+00:00</updated>
    <content type=\"text\">本の整列 発行者</content>
    <link type=\"application/atom+xml;type=feed;profile=opds-catalog\" href=\"/opds/navcatalog/4e7075626c6973686572?library_id=config\"/>
  </entry>
  <entry>
    <title>&gt; 著者</title>
    <id>calibre-navcatalog:9f8930ad550499392f4639be10bef5ec3370ec40</id>
    <updated>2022-11-19T14:47:00+00:00</updated>
    <content type=\"text\">本の整列 著者</content>
    <link type=\"application/atom+xml;type=feed;profile=opds-catalog\" href=\"/opds/navcatalog/4e617574686f7273?library_id=config\"/>
  </entry>
  <entry>
    <title>&gt; 言語</title>
    <id>calibre-navcatalog:5afcbe4f35c01d109273ae847c254de6ee51448e</id>
    <updated>2022-11-19T14:47:00+00:00</updated>
    <content type=\"text\">本の整列 言語</content>
    <link type=\"application/atom+xml;type=feed;profile=opds-catalog\" href=\"/opds/navcatalog/4e6c616e677561676573?library_id=config\"/>
  </entry>
  <entry>
    <title>&gt; 評価</title>
    <id>calibre-navcatalog:d766cfd8de9e9d5db626a27397ca4649d462ec2c</id>
    <updated>2022-11-19T14:47:00+00:00</updated>
    <content type=\"text\">本の整列 評価</content>
    <link type=\"application/atom+xml;type=feed;profile=opds-catalog\" href=\"/opds/navcatalog/4e726174696e67?library_id=config\"/>
  </entry>
  <entry>
    <title>ライブラリ: config</title>
    <id>calibre-library:config</id>
    <updated>2022-11-19T14:47:00+00:00</updated>
    <content type=\"text\">calibreライブラリを変更:  config</content>
    <link type=\"application/atom+xml;type=feed;profile=opds-catalog\" href=\"/opds?library_id=config\"/>
  </entry>
</feed>`

describe("OpdsRootStore test", () => {
  test("initialize OPDS", async () => {
    const store = OpdsRootStore.create()

    // @ts-ignore
    api.connect = async () => {
      return { kind: "ok", data: sampleXml }
    }

    await store.initialize()

    expect(store.title).toBe("calibre ライブラリ")
    expect(store.subtitle).toBe("ライブラリにある本")
    expect(store.author[0].name).toBe("calibre")
    expect(store.author[0].uri).toBe("https://calibre-ebook.com")
    expect(store.author[0].email).toBeNull()
    expect(store.id).toBe("urn:calibre:main")
    expect(store.icon).toBe("/favicon.png")
    expect(store.updated).toEqual(new Date("2022-11-19T14:47:00+00:00"))
    expect(store.lang).toBeNull()
    expect(store.opensearchItemsPerPage).toBeNull()
    expect(store.opensearchTotalResults).toBeNull()
    expect(store.link[0].facetGroup).toBeNull()
    expect(store.link[0].href).toBe("/opds/search/{searchTerms}?library_id=config")
    expect(store.link[0].lcpHashedPassphrase).toBeNull()
    expect(store.link[0].opdsAvailability).toBeNull()
    expect(store.link[0].opdsCopies).toBeNull()
    expect(store.link[0].opdsHolds).toBeNull()
    expect(store.link[0].opdsIndirectAcquisitions).toEqual([])
    expect(store.link[0].opdsPrice).toBeNull()
    expect(store.link[0].opdsPriceCurrencyCode).toBeNull()
    expect(store.link[0].rel).toBe("search")
    expect(store.link[0].thrCount).toBeNull()
    expect(store.link[0].title).toBe("Search")
    expect(store.link[0].type).toBe("application/atom+xml")
    expect(store.link[1].href).toBe("/opds?library_id=config")
    expect(store.link[1].rel).toBe("start")
    expect(store.link[1].type).toBe("application/atom+xml;type=feed;profile=opds-catalog")
    expect(store.entry[0].title).toBe("> 最新順")
    expect(store.entry[0].id).toBe("calibre-navcatalog:483bb9d46b5a7a19de8f3b7032ca7abcc3815afe")
    expect(store.entry[0].contentType).toBe("text")
    expect(store.entry[0].content).toBe("本の整列 日付")
    expect(store.entry[0].updated).toEqual(new Date("2022-11-19T14:47:00+00:00"))
    expect(store.entry[0].link[0].type).toBe("application/atom+xml;type=feed;profile=opds-catalog")
    expect(store.entry[0].link[0].href).toBe("/opds/navcatalog/4f6e6577657374?library_id=config")
    expect(store.entry[1].title).toBe("> タイトル")
    expect(store.entry[1].id).toBe("calibre-navcatalog:537b652756ba6827b7d9dc3273ea188500d454cd")
    expect(store.entry[1].contentType).toBe("text")
    expect(store.entry[1].content).toBe("本の整列 タイトル")
    expect(store.entry[1].updated).toEqual(new Date("2022-11-19T14:47:00+00:00"))
    expect(store.entry[1].link[0].type).toBe("application/atom+xml;type=feed;profile=opds-catalog")
    expect(store.entry[1].link[0].href).toBe("/opds/navcatalog/4f7469746c65?library_id=config")
  })
})
