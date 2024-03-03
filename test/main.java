// Java
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class Main {
  public static void main(String[] args) {
    try {
      URL url = new URL("/api/data");
      HttpURLConnection conn = (HttpURLConnection) url.openConnection();
      conn.setRequestMethod("GET");
      
      BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
      String line;
      StringBuilder response = new StringBuilder();
      
      while ((line = reader.readLine()) != null) {
        response.append(line);
      }
      
      reader.close();
      
      System.out.println(response.toString());
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}