"""
Generate a larger sample of orders for the Spark job.

Writes a deterministic CSV (seeded, so every run produces the same file)
with 600 rows, using the same columns as data/sample_orders.csv:

    order_id, product_name, category, quantity, unit_price, order_date

Usage:
    python spark/generate_sample_orders.py [output_csv]

Default output: data/orders_large.csv, next to the small sample file.
The small 5-row sample is left untouched.
"""

import csv
import os
import random
import sys

CATALOGUE = [
    ("Wireless Mouse", "Electronics", 24.99),
    ("Mechanical Keyboard", "Electronics", 79.90),
    ("USB-C Hub", "Electronics", 34.50),
    ("Bluetooth Speaker", "Electronics", 49.99),
    ("Organic Coffee Beans", "Grocery", 12.50),
    ("Green Tea", "Grocery", 8.99),
    ("Olive Oil", "Grocery", 15.75),
    ("Desk Lamp", "Home", 34.00),
    ("Office Chair", "Home", 129.99),
    ("Bookshelf", "Home", 89.00),
    ("Cotton T-Shirt", "Clothing", 19.99),
    ("Jeans", "Clothing", 44.90),
    ("Hoodie", "Clothing", 39.99),
]

ROW_COUNT = 600


def main() -> None:
    default_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "orders_large.csv"
    )
    output_path = sys.argv[1] if len(sys.argv) > 1 else default_path

    rng = random.Random(42)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            ["order_id", "product_name", "category",
             "quantity", "unit_price", "order_date"]
        )
        for order_id in range(1, ROW_COUNT + 1):
            product, category, price = rng.choice(CATALOGUE)
            day = rng.randint(1, 25)
            writer.writerow([
                order_id,
                product,
                category,
                rng.randint(1, 4),
                f"{price:.2f}",
                f"2026-10-{day:02d}",
            ])

    print(f"Wrote {ROW_COUNT} orders to {output_path}")


if __name__ == "__main__":
    main()
