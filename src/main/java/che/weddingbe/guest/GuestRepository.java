package che.weddingbe.guest;

import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByLoginConfirmTokenAndLoginConfirmExpiresAtAfter(String token, Instant expiry);
}
