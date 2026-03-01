package che.weddingbe.api;

import che.weddingbe.guest.GuestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeController {

    private final GuestRepository guestRepository;

    public MeController(GuestRepository guestRepository) {
        this.guestRepository = guestRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return guestRepository.findByUsername(user.getUsername())
                .map(guest -> ResponseEntity.ok(new MeResponse(guest.getUsername(), guest.getDisplayName(), guest.getPartnerName())))
                .orElse(ResponseEntity.notFound().build());
    }

    public record MeResponse(String username, String displayName, String partnerName) {}
}
