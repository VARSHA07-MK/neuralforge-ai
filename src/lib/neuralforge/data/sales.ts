/**
 * Local sample dataset for the guided scenario "From Prompt to Verified Result".
 *
 * Small, inspectable, and shipped with the app — no network, no database.
 * The scenario's numerical answer is computed from THIS data at runtime
 * (see analyst/reviewer logic), never hardcoded.
 */
export interface SalesRow {
	region: string;
	quarter: string;
	revenue: number; // in USD
}

export const SALES_DATA: SalesRow[] = [
	{ region: 'North', quarter: 'Q1', revenue: 120_000 },
	{ region: 'North', quarter: 'Q2', revenue: 135_000 },
	{ region: 'North', quarter: 'Q3', revenue: 128_000 },
	{ region: 'South', quarter: 'Q1', revenue: 98_000 },
	{ region: 'South', quarter: 'Q2', revenue: 102_000 },
	{ region: 'South', quarter: 'Q3', revenue: 115_000 },
	{ region: 'East', quarter: 'Q1', revenue: 141_000 },
	{ region: 'East', quarter: 'Q2', revenue: 150_000 },
	{ region: 'East', quarter: 'Q3', revenue: 162_000 },
	{ region: 'West', quarter: 'Q1', revenue: 110_000 },
	{ region: 'West', quarter: 'Q2', revenue: 108_000 },
	{ region: 'West', quarter: 'Q3', revenue: 119_000 }
];

export interface RegionTotal {
	region: string;
	total: number;
}

/** Sum revenue by region. Pure and deterministic. */
export function totalsByRegion(rows: SalesRow[] = SALES_DATA): RegionTotal[] {
	const map = new Map<string, number>();
	for (const row of rows) {
		map.set(row.region, (map.get(row.region) ?? 0) + row.revenue);
	}
	return [...map.entries()]
		.map(([region, total]) => ({ region, total }))
		.sort((a, b) => b.total - a.total);
}

/** The top-performing region by total revenue (ground truth for the scenario). */
export function topRegion(rows: SalesRow[] = SALES_DATA): RegionTotal {
	return totalsByRegion(rows)[0];
}
