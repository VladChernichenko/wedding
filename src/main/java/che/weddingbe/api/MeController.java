package che.weddingbe.api;

import che.weddingbe.guest.Child;
import che.weddingbe.guest.GuestRepository;
import che.weddingbe.guest.User;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(MeController.class);

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
                .map(guest -> {
                    List<Child> childList = guest.getChildren() != null ? guest.getChildren() : List.of();
                    List<ChildDto> children = childList.stream()
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
        log.info("[ADD_CHILD] request: username='{}', childName='{}'", user != null ? user.getUsername() : null, request != null ? request.name() : null);
        if (user == null) {
            log.warn("[ADD_CHILD] rejected: not authenticated");
            return ResponseEntity.status(401).build();
        }
        return guestRepository.findByUsername(user.getUsername())
                .map(guest -> {
                    try {
                        Child child = new Child();
                        String name = request.name().trim();
                        child.setName(name);
                        guest.getChildren().add(child);
                        child.setUser(guest);
                        guestRepository.save(guest);
                        child = guest.getChildren().get(guest.getChildren().size() - 1);
                        log.info("[ADD_CHILD] success: username='{}', childId={}, childName='{}'", user.getUsername(), child.getId(), child.getName());
                        return ResponseEntity.ok(new ChildDto(child.getId(), child.getName()));
                    } catch (Exception e) {
                        log.error("[ADD_CHILD] failed: username='{}', childName='{}'", user.getUsername(), request.name(), e);
                        throw e;
                    }
                })
                .orElseGet(() -> {
                    log.warn("[ADD_CHILD] user not found: username='{}'", user.getUsername());
                    return ResponseEntity.notFound().build();
                });
    }

    public record MeResponse(String username, String displayName, String partnerName, boolean admin,
                            boolean guest, boolean presenceConfirmed, List<ChildDto> children) {}

    public record ChildDto(long id, String name) {}

    public record AddChildRequest(@NotBlank(message = "Name is required") String name) {}
}
