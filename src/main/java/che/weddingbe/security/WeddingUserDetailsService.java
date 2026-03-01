package che.weddingbe.security;

import che.weddingbe.guest.User;
import che.weddingbe.guest.GuestRepository;
import che.weddingbe.guest.Role;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
        User guest = guestRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("[LOGIN] Guest not found for username='{}'", username);
                    return new UsernameNotFoundException("Guest not found: " + username);
                });
        log.info("[LOGIN] Guest found: username='{}', displayName='{}', roles={}", guest.getUsername(), guest.getDisplayName(),
                guest.getRoles().stream().map(Role::getName).toList());
        List<String> roleNames = guest.getRoles().stream()
                .map(r -> "ROLE_" + r.getName())
                .toList();
        if (roleNames.isEmpty()) {
            roleNames = List.of("ROLE_GUEST");
        }
        return org.springframework.security.core.userdetails.User.builder()
                .username(guest.getUsername())
                .password(guest.getPasswordHash())
                .authorities(roleNames.stream().map(r -> (org.springframework.security.core.GrantedAuthority) () -> r).toList())
                .build();
    }
}
