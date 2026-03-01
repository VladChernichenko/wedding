package che.weddingbe.api;

import che.weddingbe.guest.Child;
import che.weddingbe.guest.ChildRepository;
import che.weddingbe.guest.GuestRepository;
import che.weddingbe.guest.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeController {

    private final GuestRepository guestRepository;
    private final ChildRepository childRepository;

    public MeController(GuestRepository guestRepository, ChildRepository childRepository) {
        this.guestRepository = guestRepository;
        this.childRepository = childRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return guestRepository.findByUsername(user.getUsername())
                .map(guest -> {
                    List<ChildDto> children = guest.getChildren().stream()
                            .map(c -> new ChildDto(c.getId(), c.getName()))
                            .toList();
                    return ResponseEntity.ok(new MeResponse(
                            guest.getUsername(),
                            guest.getDisplayName(),
                            guest.getPartnerName(),
                            guest.hasRole("ADMIN"),
                            guest.hasRole("GUEST"),
                            guest.getPresenceConfirmedAt() != null,
                            children
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/me/presence")
    public ResponseEntity<MeResponse> confirmPresence(@AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return guestRepository.findByUsername(user.getUsername())
                .map(guest -> {
                    guest.setPresenceConfirmedAt(Instant.now());
                    guestRepository.save(guest);
                    return me(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/me/children")
    public ResponseEntity<ChildDto> addChild(@AuthenticationPrincipal UserDetails user,
                                             @Valid @RequestBody AddChildRequest request) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return guestRepository.findByUsername(user.getUsername())
                .map(guest -> {
                    Child child = new Child();
                    child.setUser(guest);
                    child.setName(request.name().trim());
                    child = childRepository.save(child);
                    return ResponseEntity.ok(new ChildDto(child.getId(), child.getName()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public record MeResponse(String username, String displayName, String partnerName, boolean admin,
                            boolean guest, boolean presenceConfirmed, List<ChildDto> children) {}

    public record ChildDto(long id, String name) {}

    public record AddChildRequest(@NotBlank(message = "Name is required") String name) {}
}
