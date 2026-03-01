package che.weddingbe.security;

import che.weddingbe.guest.Guest;
import che.weddingbe.guest.GuestRepository;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class WeddingUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(WeddingUserDetailsService.class);

    private final GuestRepository guestRepository;

    public WeddingUserDetailsService(GuestRepository guestRepository) {
        this.guestRepository = guestRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("[LOGIN] loadUserByUsername called for username='{}'", username);
        Guest guest = guestRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("[LOGIN] Guest not found for username='{}'", username);
                    return new UsernameNotFoundException("Guest not found: " + username);
                });
        log.info("[LOGIN] Guest found: username='{}', displayName='{}'", guest.getUsername(), guest.getDisplayName());
        return User.builder()
                .username(guest.getUsername())
                .password(guest.getPasswordHash())
                .authorities(Collections.singletonList(() -> "ROLE_GUEST"))
                .build();
    }
}
