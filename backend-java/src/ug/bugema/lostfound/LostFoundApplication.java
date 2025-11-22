package ug.bugema.lostfound;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class LostFoundApplication {

    public static void main(String[] args) throws IOException {
        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // /api/ping endpoint
        server.createContext("/api/ping", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                    handlePreflight(exchange);
                    return;
                }

                if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    exchange.sendResponseHeaders(405, -1); // Method Not Allowed
                    return;
                }

                String responseJson = "{\"status\":\"ok\",\"message\":\"Lost & Found backend is alive\"}";
                sendJsonResponse(exchange, 200, responseJson);
            }
        });

        // /api/items endpoint - GET = list items, POST = create item
        server.createContext("/api/items", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                String method = exchange.getRequestMethod().toUpperCase();

                if ("OPTIONS".equalsIgnoreCase(method)) {
                    handlePreflight(exchange);
                    return;
                }

                switch (method) {
                    case "GET":
                        handleGetItems(exchange);
                        break;
                    case "POST":
                        handlePostItem(exchange);
                        break;
                    default:
                        exchange.sendResponseHeaders(405, -1);
                }
            }
        });
        
     // /api/items/claim endpoint - POST = mark as CLAIMED
        server.createContext("/api/items/claim", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                String method = exchange.getRequestMethod().toUpperCase();

                if ("OPTIONS".equalsIgnoreCase(method)) {
                    handlePreflight(exchange);
                    return;
                }

                if (!"POST".equalsIgnoreCase(method)) {
                    exchange.sendResponseHeaders(405, -1);
                    return;
                }

                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                Map<String, String> params = parseFormData(body);

                String idStr = params.get("id");
                int id;
                try {
                    id = Integer.parseInt(idStr);
                } catch (Exception e) {
                    String errorJson = "{\"success\":false,\"message\":\"Invalid item id\"}";
                    sendJsonResponse(exchange, 400, errorJson);
                    return;
                }

                boolean success = DatabaseHelper.updateItemStatus(id, "CLAIMED");

                if (success) {
                    String okJson = "{\"success\":true,\"message\":\"Item marked as claimed\"}";
                    sendJsonResponse(exchange, 200, okJson);
                } else {
                    String errorJson = "{\"success\":false,\"message\":\"Failed to update item status\"}";
                    sendJsonResponse(exchange, 500, errorJson);
                }
            }
        });

        
        server.setExecutor(null); // default executor
        server.start();
        System.out.println("Lost & Found backend is running on http://localhost:" + port);
    }

    // Handlers

    private static void handleGetItems(HttpExchange exchange) throws IOException {
        String responseJson = DatabaseHelper.fetchItemsAsJson();
        sendJsonResponse(exchange, 200, responseJson);
    }

    private static void handlePostItem(HttpExchange exchange) throws IOException {
    	
        // Expecting application/x-www-form-urlencoded
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        Map<String, String> params = parseFormData(body);

        String title = safeTrim(params.get("title"));
        String description = safeTrim(params.get("description"));
        String type = safeTrim(params.get("type"));
        String location = safeTrim(params.get("location"));
        String contactName = safeTrim(params.get("contactName"));
        String contactPhone = safeTrim(params.get("contactPhone"));

        if (title.isEmpty() || type.isEmpty() || contactName.isEmpty() || contactPhone.isEmpty()) {
            String errorJson = "{\"success\":false,\"message\":\"Missing required fields\"}";
            sendJsonResponse(exchange, 400, errorJson);
            return;
        }

        boolean success = DatabaseHelper.insertItem(
                title,
                description,
                type,
                location,
                contactName,
                contactPhone
        );

        if (success) {
            String okJson = "{\"success\":true,\"message\":\"Item saved successfully\"}";
            sendJsonResponse(exchange, 201, okJson);
        } else {
            String errorJson = "{\"success\":false,\"message\":\"Failed to save item\"}";
            sendJsonResponse(exchange, 500, errorJson);
        }
    }

    // Helpers 

    private static void handlePreflight(HttpExchange exchange) throws IOException {
        Headers headers = exchange.getResponseHeaders();
        addCorsHeaders(headers);
        exchange.sendResponseHeaders(204, -1); // No content
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String jsonBody) throws IOException {
        Headers headers = exchange.getResponseHeaders();
        addCorsHeaders(headers);
        headers.add("Content-Type", "application/json; charset=utf-8");

        byte[] bytes = jsonBody.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void addCorsHeaders(Headers headers) {
        headers.add("Access-Control-Allow-Origin", "http://localhost:5173");
        headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.add("Access-Control-Allow-Headers", "Content-Type");
    }

    private static Map<String, String> parseFormData(String body) throws IOException {
        Map<String, String> params = new HashMap<>();
        if (body == null || body.isEmpty()) return params;

        String[] pairs = body.split("&");
        for (String pair : pairs) {
            String[] parts = pair.split("=", 2);
            if (parts.length == 2) {
                String key = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
                String value = URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
                params.put(key, value);
            }
        }
        return params;
    }

    private static String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }
}
