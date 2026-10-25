"""
Sales analysis - Day 1 Spark skeleton.

Reads a CSV file of orders and computes total revenue per product category.

Input CSV columns:
    order_id, product_name, category, quantity, unit_price, order_date

Usage:
    spark-submit sales_analysis.py [path_to_csv] [path_to_output_json]
    python sales_analysis.py [path_to_csv] [path_to_output_json]

If no path is given, it defaults to ../data/sample_orders.csv
relative to this file's expected location in the project.
If an output path is given, the result is also written there as JSON
(the file the backend analytics endpoint reads), for example:

    python sales_analysis.py ../data/orders_large.csv \
        ../output/revenue_per_category.json
"""

import json
import os
import sys

from pyspark.sql import SparkSession
from pyspark.sql import functions as F


def build_spark_session() -> SparkSession:
    return (
        SparkSession.builder
        .appName("shop-analytics-sales-analysis")
        .master("local[*]")
        .getOrCreate()
    )


def load_orders(spark: SparkSession, input_path: str):
    return (
        spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .csv(input_path)
    )


def revenue_per_category(orders_df):
    """Return a DataFrame with category and total_revenue, sorted desc."""
    with_revenue = orders_df.withColumn(
        "line_revenue",
        F.col("quantity") * F.col("unit_price"),
    )

    result = (
        with_revenue
        .groupBy("category")
        .agg(
            F.round(F.sum("line_revenue"), 2).alias("total_revenue"),
            F.sum("quantity").alias("total_items_sold"),
            F.count("order_id").alias("order_count"),
        )
        .orderBy(F.desc("total_revenue"))
    )

    return result


def write_result_json(result, output_path: str) -> None:
    """Write the aggregated rows as JSON, plus overall totals."""
    rows = [row.asDict() for row in result.collect()]
    payload = {
        "metric": "revenue_per_category",
        "rows": rows,
        "total_revenue": round(sum(r["total_revenue"] for r in rows), 2),
        "order_count": sum(r["order_count"] for r in rows),
    }
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
    print(f"Wrote result JSON to: {output_path}")


def main() -> None:
    default_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "sample_orders.csv"
    )
    input_path = sys.argv[1] if len(sys.argv) > 1 else default_path
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    spark = build_spark_session()
    spark.sparkContext.setLogLevel("WARN")

    try:
        orders = load_orders(spark, input_path)
        print(f"Loaded orders from: {input_path}")
        orders.printSchema()
        orders.show(truncate=False)

        result = revenue_per_category(orders)

        print("Total revenue per category:")
        result.show(truncate=False)

        if output_path:
            write_result_json(result, output_path)
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
