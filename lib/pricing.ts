export const MONTHLY_PRICE = 4.99;
export const YEARLY_PRICE = 39.99;
export const SAVINGS_PCT = Math.round(
	(1 - YEARLY_PRICE / (MONTHLY_PRICE * 12)) * 100,
);

export const USD = (n: number) =>
	new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
		n,
	);
