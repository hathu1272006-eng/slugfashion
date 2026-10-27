const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs/promises");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: "chromium",
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    // Fictional fixtures: no connection to, or changes in, the user's MongoDB.
    const fashions = [
      {
        _id: "a",
        IdF: 1,
        slug: "ao-khoac-linen-1",
        style: "Minimal",
        fashion_subject: "Áo khoác linen",
        fashion_detail:
          "Một thiết kế thanh lịch với phom dáng nhẹ nhàng. Chất liệu tự nhiên mang đến sự thoải mái trong từng chuyển động.",
        fashion_image: "",
      },
      {
        _id: "b",
        IdF: 2,
        slug: "ao-khoac-linen-2",
        style: "Everyday",
        fashion_subject: "Áo khoác linen",
        fashion_detail:
          "Phiên bản thường ngày. Hai mẫu trùng tên vẫn có mã và đường dẫn riêng.",
        fashion_image: "",
      },
      {
        _id: "c",
        IdF: 12,
        slug: "dam-dao-pho-12",
        style: "Classic",
        fashion_subject: "Đầm dạo phố",
        fashion_detail: "Những đường nét giản dị cho một ngày đầy cảm hứng.",
        fashion_image: "",
      },
    ];
    let listMode = "normal";
    await page.route("**/fashions", async (route) => {
      if (listMode === "error")
        return route.fulfill({
          status: 500,
          json: { message: "Lỗi kiểm thử kết nối." },
        });
      await route.fulfill({ json: listMode === "empty" ? [] : fashions });
    });
    await page.route("**/fashions/slug/*", async (route) => {
      const slug = decodeURIComponent(route.request().url().split("/").pop());
      const fashion = fashions.find((item) => item.slug === slug);
      await route.fulfill(
        fashion
          ? { json: fashion }
          : {
              status: 404,
              json: { message: "Không tìm thấy mẫu thời trang này." },
            },
      );
    });
    const origin = process.env.APP_URL || "http://127.0.0.1:4200";
    const capture = async (name) => {
      if (process.env.SCREENSHOT_DIR) {
        await fs.mkdir(process.env.SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({
          path: path.join(process.env.SCREENSHOT_DIR, name + ".png"),
          fullPage: true,
        });
      }
    };

    await page.goto(origin);
    await page.locator(".fashion-table tbody tr").first().waitFor();
    assert.equal(await page.locator(".fashion-table tbody tr").count(), 3);
    assert.equal(
      (await page.locator(".id-cell").allTextContents()).join(","),
      "NO.1,NO.2,NO.12",
    );
    await capture("collection-desktop");
    await page.getByRole("button", { name: "Classic", exact: true }).click();
    assert.equal(await page.locator(".fashion-table tbody tr").count(), 1);
    await page.getByRole("button", { name: "Tất cả", exact: true }).click();
    await page.locator(".slug-link").nth(1).click();
    await page.locator(".numeric-id").waitFor();
    assert.equal(await page.locator(".numeric-id").innerText(), "2");
    assert.match(page.url(), /fashion-detail\/ao-khoac-linen-2$/);
    assert.match(
      await page.locator(".fashion-description").innerText(),
      /Phiên bản thường ngày/,
    );
    await capture("detail-desktop");
    console.log(
      "PASS: IdF column, style filter, duplicate titles and slug navigation",
    );

    await page.reload();
    await page.locator(".numeric-id").waitFor();
    assert.equal(await page.locator(".numeric-id").innerText(), "2");
    await page.goto(origin + "/fashion-detail");
    await page.getByLabel("Slug thiết kế").fill("dam-dao-pho-12");
    await page.getByRole("button", { name: "Mở thiết kế" }).click();
    await page.locator(".numeric-id").waitFor();
    assert.equal(await page.locator(".numeric-id").innerText(), "12");
    assert.match(page.url(), /fashion-detail\/dam-dao-pho-12$/);
    console.log("PASS: direct refresh and manual slug lookup");

    await page.goto(origin + "/fashion-detail/wrong-title-2");
    await page.getByRole("alert").waitFor();
    assert.equal(await page.locator(".detail-layout").count(), 0);
    assert.match(await page.getByRole("alert").innerText(), /Không tìm thấy/);
    console.log(
      "PASS: unknown slug never shows the item with the same numeric suffix",
    );

    await Promise.all([
      page.waitForResponse(
        (response) => new URL(response.url()).pathname === "/fashions",
      ),
      page.goto(origin + "/search-fashion"),
    ]);
    await page.getByRole("searchbox").fill("ao khoac");
    await page.getByRole("button", { name: "Tìm kiếm", exact: true }).click();
    await page.locator(".table-wrapper tbody tr").first().waitFor();
    assert.equal(await page.locator(".table-wrapper tbody tr").count(), 2);
    console.log("PASS: Vietnamese search without accents");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin + "/fashion-list");
    await page.locator(".fashion-table tbody tr").first().waitFor();
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
    await capture("collection-mobile");
    await page.locator(".slug-link").first().click();
    await page.locator(".numeric-id").waitFor();
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
    await capture("detail-mobile");
    console.log("PASS: mobile list and detail fit viewport");

    listMode = "empty";
    await page.goto(origin + "/fashion-list");
    await page.getByText("Bộ sưu tập đang chờ câu chuyện đầu tiên.").waitFor();
    listMode = "error";
    await page.reload();
    await page.getByRole("alert").waitFor();
    listMode = "normal";
    await page.getByRole("button", { name: "Thử lại" }).click();
    await page.locator(".fashion-table tbody tr").first().waitFor();
    assert.equal(await page.locator(".fashion-table tbody tr").count(), 3);
    assert.deepEqual(errors, []);
    console.log(
      "PASS: empty/error states and retry; no browser runtime errors",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
