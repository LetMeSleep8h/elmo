import { describe, expect, it } from "vitest";
import { getMarketingOgImage, getPageImage } from "@/lib/og";

function parseOgUrl(url: string): URL {
	return new URL(url, "https://example.com");
}

describe("getMarketingOgImage", () => {
	it.each([
		["Pricing · Elmo", "Pricing"],
		["Blog | Elmo", "Blog"],
		["Pricing  ·  Elmo", "Pricing"],
		["Pricing · ELMO", "Pricing"],
		["Why Elmo · Elmo", "Why Elmo"],
	])("drops the trailing brand name from %s", (title, expectedTitle) => {
		expect(parseOgUrl(getMarketingOgImage({ title })).searchParams.get("title")).toBe(expectedTitle);
	});

	it.each([
		["Elmo · Open Source AI Visibility", "Open Source AI Visibility"],
		["Elmo - Docs", "Docs"],
		["Elmo: Pricing", "Pricing"],
		["elmo · Pricing", "Pricing"],
		["Elmo·Pricing", "Pricing"],
		["Elmo · Why Elmo", "Why Elmo"],
	])("drops the leading brand name from %s", (title, expectedTitle) => {
		expect(parseOgUrl(getMarketingOgImage({ title })).searchParams.get("title")).toBe(expectedTitle);
	});

	it("drops the brand name from both ends of a title", () => {
		const url = getMarketingOgImage({ title: "Elmo · Pricing · Elmo" });

		expect(parseOgUrl(url).searchParams.get("title")).toBe("Pricing");
	});

	it.each(["Pricing", "Elmo", "Elmo Cloud", "Elmohq · Pricing", "Pricing · Elmohq"])(
		"leaves the title %s unchanged",
		(title) => {
			expect(parseOgUrl(getMarketingOgImage({ title })).searchParams.get("title")).toBe(title);
		},
	);

	it("preserves special characters in the title", () => {
		const title = "A/B? #1 & more";

		expect(parseOgUrl(getMarketingOgImage({ title })).searchParams.get("title")).toBe(title);
	});

	it("uses the marketing image path", () => {
		expect(parseOgUrl(getMarketingOgImage({ title: "Pricing" })).pathname).toBe("/og.png");
	});

	it("includes a non-empty description and label", () => {
		const url = getMarketingOgImage({ title: "Pricing", description: "Plans & pricing for teams", label: "Pricing" });
		const { searchParams } = parseOgUrl(url);

		expect(searchParams.get("description")).toBe("Plans & pricing for teams");
		expect(searchParams.get("label")).toBe("Pricing");
	});

	it("omits description and label parameters when they are not provided", () => {
		const { searchParams } = parseOgUrl(getMarketingOgImage({ title: "Pricing" }));

		expect(searchParams.has("description")).toBe(false);
		expect(searchParams.has("label")).toBe(false);
	});

	it("omits empty description and label parameters", () => {
		const { searchParams } = parseOgUrl(getMarketingOgImage({ title: "Pricing", description: "", label: "" }));

		expect(searchParams.has("description")).toBe(false);
		expect(searchParams.has("label")).toBe(false);
	});
});

describe("getPageImage", () => {
	it("returns the root docs image when there are no slugs", () => {
		expect(getPageImage([])).toEqual({
			segments: ["image.png"],
			url: "/og/docs/image.png",
		});
	});

	it("returns the image for a nested docs page", () => {
		expect(getPageImage(["guides", "setup"])).toEqual({
			segments: ["guides", "setup", "image.png"],
			url: "/og/docs/guides/setup/image.png",
		});
	});

	it("leaves the original slugs unchanged", () => {
		const slugs = ["guides", "setup"];

		getPageImage(slugs);

		expect(slugs).toEqual(["guides", "setup"]);
	});
});
