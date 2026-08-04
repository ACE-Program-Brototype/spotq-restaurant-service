import client from "prom-client";
import register from "../../config/prom.client.js";


export const httpRequestsTotal = new client.Counter({

    name: "http_requests_total",

    help: "Total number of HTTP requests",

    labelNames: [
        "method",
        "route",
        "status"
    ],

    registers: [register]

});


export const httpRequestDuration = new client.Histogram({

    name: "http_request_duration_seconds",

    help: "Request duration",

    labelNames: [
        "method",
        "route"
    ],

    buckets: [
        0.05,
        0.1,
        0.2,
        0.5,
        1,
        2,
        5
    ],

    registers: [register]

});


export const httpErrorsTotal = new client.Counter({

    name: "http_errors_total",

    help: "Total number of errors",

    labelNames: [
        "route",
        "status"
    ],

    registers: [register]

});

