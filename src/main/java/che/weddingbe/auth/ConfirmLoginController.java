package che.weddingbe.auth;

import che.weddingbe.guest.GuestRepository;
import che.weddingbe.guest.User;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Instant;

@Controller
public class ConfirmLoginController {

    private static final Logger log = LoggerFactory.getLogger(ConfirmLoginController.class);

    private final GuestRepository guestRepository;
    private final UserDetailsService userDetailsService;

    public ConfirmLoginController(GuestRepository guestRepository, UserDetailsService userDetailsService) {
        this.guestRepository = guestRepository;
        this.userDetailsService = userDetailsService;
    }

    @GetMapping("/confirm-login")
    public String confirmLogin(@RequestParam String token, HttpServletRequest request) {
        if (token == null || token.isBlank()) {
            log.warn("[CONFIRM_LOGIN] Empty token");
            return "redirect:/login?error=invalid";
        }
        User user = guestRepository.findByLoginConfirmTokenAndLoginConfirmExpiresAtAfter(token, Instant.now())
                .orElse(null);
        if (user == null) {
            log.warn("[CONFIRM_LOGIN] Invalid or expired token");
            return "redirect:/login?error=invalid";
        }
        user.setLoginConfirmToken(null);
        user.setLoginConfirmExpiresAt(null);
        guestRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
        request.getSession(true);
        log.info("[CONFIRM_LOGIN] Success for user {}", user.getUsername());
        return "redirect:/";
    }
}
