package che.weddingbe.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class LoginEmailService {

    private static final Logger log = LoggerFactory.getLogger(LoginEmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:8080/wedding}")
    private String baseUrl;

    @Value("${app.mail.from:wedding@localhost}")
    private String fromEmail;

    public void sendLoginConfirmationLink(String toEmail, String token) {
        if (mailSender == null) {
            log.warn("[LOGIN_EMAIL] Mail not configured (JavaMailSender missing). Set spring.mail.host to send emails.");
            throw new IllegalStateException("Mail not configured. Set spring.mail.host (and related properties) to enable login confirmation by email.");
        }
        String confirmUrl = baseUrl + "/confirm-login?token=" + token;
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(toEmail);
        msg.setSubject("Confirm your login");
        msg.setText("Click the link below to complete your login:\n\n" + confirmUrl + "\n\nThe link expires in 15 minutes.");
        try {
            mailSender.send(msg);
            log.info("[LOGIN_EMAIL] Sent confirmation to {}", toEmail);
        } catch (Exception e) {
            log.error("[LOGIN_EMAIL] Failed to send to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send confirmation email", e);
        }
    }
}
