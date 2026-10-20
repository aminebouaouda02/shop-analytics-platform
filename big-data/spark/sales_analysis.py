"""
Sales analysis - Day 1 Spark skeleton.

Reads a CSV file of orders and computes total revenue per product category.

Input CSV columns:
    order_id, product_name, category, quantity, unit_price, order_date

Usage:
    spark-submit sales_analysis.py [path_to_csv]
    python sales_analysis.py [path_to_csv]

If no path is given, it defaults to ../data/sample_orders.csv
relative to this file's expected location in the project.
"""

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


def main() -> None:
    default_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "sample_orders.csv"
    )
    input_path = sys.argv[1] if len(sys.argv) > 1 else default_path

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
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
