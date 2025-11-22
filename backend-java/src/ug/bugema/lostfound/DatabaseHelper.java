package ug.bugema.lostfound;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseHelper {

	// MySQL settings
	private static final String URL = "jdbc:mysql://localhost:3306/lost_found_db";
	private static final String USER = "root";
	private static final String PASSWORD = "ShangaiShanua@2025H";

	public static String fetchItemsAsJson() {
		StringBuilder json = new StringBuilder();
		json.append("[");

		try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
				Statement stmt = conn.createStatement();
				ResultSet rs = stmt.executeQuery(
					    "SELECT id, title, description, type, location, contact_name, contact_phone, status, date_reported "
					    + "FROM items ORDER BY date_reported DESC LIMIT 50"
					);
				) 
		{
			boolean first = true;
			while (rs.next()) {
				if (!first) {
					json.append(",");
				} else {
					first = false;
				}
				
				String status = escapeJson(rs.getString("status"));
				String dateReported = escapeJson(String.valueOf(rs.getTimestamp("date_reported")));
				
				int id = rs.getInt("id");
				String title = escapeJson(rs.getString("title"));
				String description = escapeJson(rs.getString("description"));
				String type = escapeJson(rs.getString("type"));
				String location = escapeJson(rs.getString("location"));
				String contactName = escapeJson(rs.getString("contact_name"));
				String contactPhone = escapeJson(rs.getString("contact_phone"));

				json.append("{")
			    .append("\"id\":").append(id).append(",")
			    .append("\"title\":\"").append(title).append("\",")
			    .append("\"description\":\"").append(description).append("\",")
			    .append("\"type\":\"").append(type).append("\",")
			    .append("\"location\":\"").append(location).append("\",")
			    .append("\"contactName\":\"").append(contactName).append("\",")
			    .append("\"contactPhone\":\"").append(contactPhone).append("\",")
			    .append("\"status\":\"").append(status).append("\",")
			    .append("\"dateReported\":\"").append(dateReported).append("\"")
			    .append("}");
			}
		} catch (Exception e) {
			e.printStackTrace();
			// If error, return empty array
			return "[]";
		}

		json.append("]");
		return json.toString();
	}

	public static boolean insertItem(String title, String description, String type, String location, String contactName,
			String contactPhone) {
		String sql = "INSERT INTO items (title, description, type, location, contact_name, contact_phone) "
				+ "VALUES (?, ?, ?, ?, ?, ?)";

		try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
				java.sql.PreparedStatement ps = conn.prepareStatement(sql)) {
			// Basic sanity checks
			if (!"LOST".equalsIgnoreCase(type) && !"FOUND".equalsIgnoreCase(type)) {
				type = "LOST";
			}

			ps.setString(1, title);
			ps.setString(2, description);
			ps.setString(3, type.toUpperCase());
			ps.setString(4, location);
			ps.setString(5, contactName);
			ps.setString(6, contactPhone);

			int rows = ps.executeUpdate();
			return rows > 0;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}
	
	public static boolean updateItemStatus(int id, String newStatus) {
	    String sql = "UPDATE items SET status = ? WHERE id = ?";

	    try (
	            Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
	            java.sql.PreparedStatement ps = conn.prepareStatement(sql)
	    ) {
	        if (!"OPEN".equalsIgnoreCase(newStatus) && !"CLAIMED".equalsIgnoreCase(newStatus)) {
	            newStatus = "CLAIMED";
	        }

	        ps.setString(1, newStatus.toUpperCase());
	        ps.setInt(2, id);

	        int rows = ps.executeUpdate();
	        return rows > 0;
	    } catch (Exception e) {
	        e.printStackTrace();
	        return false;
	    }
	}


	// Very small helper to escape quotes in JSON
	private static String escapeJson(String value) {
		if (value == null)
			return "";
		return value.replace("\"", "\\\"");
	}
}
