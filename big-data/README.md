# Big Data — Sales Analytics with Spark

This folder holds the analytics side of the platform. The shop itself lives
in `backend/` (Spring Boot + PostgreSQL). This part answers a different
question: *given a lot of orders, what patterns do we see?*

## Plan

1. **Export** — Orders are exported from PostgreSQL to CSV (later: Parquet).
   A tiny sample is committed in `data/sample_orders.csv` so the job can be
   tried without a database.
2. **Process with Spark** — `spark/sales_analysis.py` reads the orders file,
   computes a line revenue (`quantity * unit_price`) and aggregates it,
   starting with total revenue per product category.
3. **Store results** — Aggregated results will be written out as CSV/Parquet
   (later: loaded back into PostgreSQL or stored in HDFS).
4. **Display** — The Next.js dashboard will read the aggregated results
   through the backend and show charts.

## Hadoop

Hadoop / HDFS is not wired up on Day 1. The Docker Compose file in the
project root has the planned services commented out.

Planned setup:
- HDFS (NameNode + DataNode) in Docker Compose
- Order exports written to HDFS instead of the local filesystem
- Spark reading from `hdfs://...` paths with the same job logic

Keeping the first version on local CSV files makes the Spark logic easier
to test. The storage layer changes later, the aggregation does not.

## Running the Day 1 skeleton

Requirements: Apache Spark with PySpark, or a Python environment with
`pyspark` installed.

```bash
spark-submit spark/sales_analysis.py data/sample_orders.csv
# or
python spark/sales_analysis.py data/sample_orders.csv
```

Expected output (from the sample data): one row per category with its
total revenue.

## Input format

`sample_orders.csv`:

| Column           | Example        |
|------------------|----------------|
| order_id         | 1              |
| product_name     | Wireless Mouse |
| category         | Electronics    |
| quantity         | 2              |
| unit_price       | 24.99          |
| order_date       | 2026-10-01     |

## Roadmap for this folder

- [x] Day 1 skeleton: revenue per category from a sample CSV
- [ ] Top 10 products by revenue and by quantity sold
- [ ] Daily / monthly sales trend
- [ ] Read a real export from the backend database
- [ ] Write results as Parquet and load them for the dashboard
- [ ] Run against HDFS instead of local files
