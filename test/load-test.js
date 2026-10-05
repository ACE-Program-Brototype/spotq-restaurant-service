import { check, group, sleep } from "k6";
import http from "k6/http";
import { Counter, Rate, Trend } from "k6/metrics";

const listingDuration = new Trend("listing_duration");
const searchDuration = new Trend("search_duration");
const healthDuration = new Trend("health_duration");
const categoriesDuration = new Trend("categories_duration");
const itemDuration = new Trend("item_detail_duration");
const successRate = new Rate("successful_requests");
const requestCount = new Counter("total_requests");

export const options = {
	stages: [
		{ duration: "10s", target: 10 }, // Stage 1: Baseline ramp-up
		{ duration: "25s", target: 25 }, // Stage 2: Normal expected load
		{ duration: "25s", target: 50 }, // Stage 3: Increased load
		{ duration: "15s", target: 100 }, // Stage 4: Spike test
		{ duration: "30s", target: 30 }, // Stage 5: Sustained load
		{ duration: "10s", target: 0 }, // Cooldown / ramp-down
	],
	thresholds: {
		http_req_failed: ["rate<0.01"],
		http_req_duration: ["p(95)<300", "p(99)<600"],
		listing_duration: ["p(95)<300"],
		search_duration: ["p(95)<300"],
		health_duration: ["p(95)<150"],
		categories_duration: ["p(95)<250"],
		item_detail_duration: ["p(95)<250"],
		successful_requests: ["rate>0.99"],
	},
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const RESTAURANT_ID =
	__ENV.RESTAURANT_ID || "e2873c56-c2a2-402b-81a4-5b2b9b6727a3";
const MENU_ITEM_ID =
	__ENV.MENU_ITEM_ID || "d3b07384-d113-4638-b765-b1a629b0a672";

const ADMIN_HEADERS = {
	"Content-Type": "application/json",
	"x-user-id": "admin-load-test-01",
	"x-user-role": "admin",
	"x-user-email": "admin@spotq.com",
};

export default function () {
	// 1. Landing / Health Check Endpoint
	group("Health Check Endpoint", () => {
		const healthRes = http.get(`${BASE_URL}/health`);
		requestCount.add(1);
		healthDuration.add(healthRes.timings.duration);

		const isHealthy = check(healthRes, {
			"health status is 200": (r) => r.status === 200,
			"health indicates service ready": (r) =>
				Boolean(r.body?.includes("Service health check successful")),
		});
		successRate.add(isHealthy);
	});

	sleep(0.3);

	// 2. Restaurant Listing with Pagination
	group("Restaurant Listing API - Pagination", () => {
		const listRes = http.get(
			`${BASE_URL}/admin/restaurants?page=1&limit=10&sortBy=createdAt&sortOrder=desc`,
			{ headers: ADMIN_HEADERS },
		);
		requestCount.add(1);
		listingDuration.add(listRes.timings.duration);

		const isListSuccess = check(listRes, {
			"listing status is 200": (r) => r.status === 200,
			"listing has pagination data": (r) =>
				Boolean(r.body?.includes("pagination")),
		});
		successRate.add(isListSuccess);
	});

	sleep(0.3);

	// 3. Restaurant Listing with Search & Filtering
	group("Restaurant Listing API - Search & Filter", () => {
		const searchRes = http.get(
			`${BASE_URL}/admin/restaurants?search=palace&status=APPROVED&limit=5`,
			{ headers: ADMIN_HEADERS },
		);
		requestCount.add(1);
		searchDuration.add(searchRes.timings.duration);

		const isSearchSuccess = check(searchRes, {
			"search status is 200": (r) => r.status === 200,
			"search returns results": (r) => Boolean(r.body?.includes("restaurants")),
		});
		successRate.add(isSearchSuccess);
	});

	sleep(0.3);

	// 4. Menu Categories Discovery
	group("Menu Categories API", () => {
		const catRes = http.get(
			`${BASE_URL}/admin/restaurants/${RESTAURANT_ID}/menu/categories`,
			{ headers: ADMIN_HEADERS },
		);
		requestCount.add(1);
		categoriesDuration.add(catRes.timings.duration);

		const isCatSuccess = check(catRes, {
			"categories status is 200": (r) => r.status === 200,
			"categories payload valid": (r) =>
				Boolean(r.body?.includes("categories")),
		});
		successRate.add(isCatSuccess);
	});

	sleep(0.3);

	// 5. Customer Menu Item Details (Public Browsing)
	group("Customer Menu Item Details API", () => {
		const itemRes = http.get(
			`${BASE_URL}/customer/${RESTAURANT_ID}/menu/items/${MENU_ITEM_ID}`,
			{ headers: { "Content-Type": "application/json" } },
		);
		requestCount.add(1);
		itemDuration.add(itemRes.timings.duration);

		const isItemSuccess = check(itemRes, {
			"item detail status is 200 or 404": (r) =>
				r.status === 200 || r.status === 404,
		});
		successRate.add(isItemSuccess);
	});

	sleep(0.5);
}
