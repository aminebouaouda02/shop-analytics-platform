package com.amine.shopanalytics.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

/**
 * Serves the latest Spark analytics result.
 *
 * The Spark job writes its result as JSON (see
 * big-data/spark/sales_analysis.py); this endpoint simply reads that file
 * back, so the dashboard does not need to run Spark itself. If the job has
 * never been run, the endpoint says so instead of inventing numbers.
 * Like the other API endpoints, this one requires a valid JWT.
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final String resultsDir;

    public AnalyticsController(
            @Value("${app.analytics.results-dir:../big-data/output}")
            String resultsDir) {
        this.resultsDir = resultsDir;
    }

    @GetMapping(value = "/sales", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> sales() {
        Path resultFile = Path.of(resultsDir, "revenue_per_category.json");
        if (!Files.exists(resultFile)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", "NOT_GENERATED",
                    "message", "No analytics result yet. Run the Spark job "
                            + "with an output path first, for example: "
                            + "python big-data/spark/sales_analysis.py "
                            + "big-data/data/orders_large.csv "
                            + "big-data/output/revenue_per_category.json"
            ));
        }
        try {
            return ResponseEntity.ok(Files.readString(resultFile));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "ERROR",
                    "message", "Could not read the analytics result file"
            ));
        }
    }
}
