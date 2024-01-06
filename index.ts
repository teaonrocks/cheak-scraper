const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
import { Browser } from "puppeteer";
const url = "https://cheak.com/collections/womens-activewear";

interface Product {
	productUrl: string;
	variants: string[];
	sizes: string[];
	images: string[];
}

const main = async () => {
	const browser: Browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto(url);
	const allProductUrls: { productUrl: string | null | undefined }[] = [];
	const products: Product[] = [];

	const productUrls = await page.evaluate(() => {
		const productList = Array.from(document.querySelectorAll(".ProductItem"));
		const productUrls = productList.map((item) => ({
			productUrl: item
				.querySelector(".ProductItem__ImageWrapper")
				?.getAttribute("href"),
		}));
		return productUrls;
	});
	productUrls.map((item) => {
		allProductUrls.push(item);
	});
	await page.goto("https://cheak.com/collections/womens-activewear?page=2");
	const productUrls2 = await page.evaluate(() => {
		const productList = Array.from(document.querySelectorAll(".ProductItem"));
		const productUrls = productList.map((item) => ({
			productUrl: item
				.querySelector(".ProductItem__ImageWrapper")
				?.getAttribute("href"),
		}));
		return productUrls;
	});
	productUrls2.map((item) => {
		allProductUrls.push(item);
	});

	allProductUrls.map(async (item) => {
		if (item.productUrl === null || item.productUrl === undefined) {
			return;
		}
		await page.goto(`https://cheak.com${item.productUrl}`);
		const productVariants = await page.evaluate(() => {
			const variantList = Array.from(
				document.querySelectorAll(".theme-variant-color")
			);
			const variants = variantList.map((item) => {
				const variantName = item
					.querySelector(".ColorSwatch__Radio")
					?.getAttribute("value");

				if (!variantName) {
					return;
				} else {
					return variantName;
				}
			});
			return variants;
		});

		console.log(productVariants);
	});
	await browser.close();
};
main();
