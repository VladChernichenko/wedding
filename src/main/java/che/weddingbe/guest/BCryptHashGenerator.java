package che.weddingbe.guest;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Generates BCrypt hashes for new guest passwords (same algorithm as SecurityConfig).
 * Usage:
 *   ./gradlew bcryptHash -Ppassword=yourpassword
 *   Or from IDE: run this class with program args, or no args for default "changeme".
 */
public class BCryptHashGenerator {

    public static void main(String[] args) {
        String password = args.length > 0 ? args[0] : "changeme";
        if (password.isEmpty()) {
            password = "changeme";
        }
        // Same encoder as SecurityConfig (default strength 10); UTF-8 is default for Spring's BCrypt
        String hash = new BCryptPasswordEncoder().encode(password);
        System.out.println("Password: " + password);
        System.out.println("BCrypt hash: " + hash);
        System.out.println("Use in SQL: INSERT INTO guest (username, password, display_name) VALUES ('username', '" + hash + "', 'Display Name');");
    }
}
