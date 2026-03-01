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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
                            .map(c -> new ChildDto(c.getId(), c.getName(), c.getAge()))
                            .toList();
                    boolean transferNeed = Boolean.TRUE.equals(guest.getTransferNeeded());
                    boolean presenceDeclined = guest.getPresenceDeclinedAt() != null;
                    return ResponseEntity.ok(new MeResponse(
                            guest.getUsername(),
                            guest.getDisplayName(),
                            guest.getPartnerName(),
                            guest.getEmail(),
                            guest.hasRole("ADMIN"),
                            guest.hasRole("GUEST"),
                            guest.getPresenceConfirmedAt() != null,
                            presenceDeclined,
                            transferNeed,
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
                    guest.setPresenceDeclinedAt(null);
                    guestRepository.save(guest);
                    return me(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/me/decline")
    public ResponseEntity<MeResponse> declinePresence(@AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return guestRepository.findByUsername(user.getUsername())
                .map(guest -> {
                    guest.setPresenceDeclinedAt(Instant.now());
                    guest.setPresenceConfirmedAt(null);
                    guestRepository.save(guest);
                    return me(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/me/email")
    public ResponseEntity<MeResponse> setEmail(@AuthenticationPrincipal UserDetails user,
                                               @RequestBody SetEmailRequest request) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return guestRepository.findByUsername(user.getUsername())
                .map(guest -> {
                    String email = request.email();
                    guest.setEmail(email != null && !email.isBlank() ? email.trim() : null);
                    guestRepository.save(guest);
                    return me(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/me/transfer")
    public ResponseEntity<MeResponse> setTransferNeed(@AuthenticationPrincipal UserDetails user,
                                                      @RequestBody SetTransferNeedRequest request) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return guestRepository.findByUsername(user.getUsername())
                .map(guest -> {
                    guest.setTransferNeeded(request.need() != null && request.need());
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
                        child.setAge(request.age());
                        guest.getChildren().add(child);
                        child.setUser(guest);
                        guestRepository.save(guest);
                        child = guest.getChildren().get(guest.getChildren().size() - 1);
                        log.info("[ADD_CHILD] success: username='{}', childId={}, childName='{}', age={}", user.getUsername(), child.getId(), child.getName(), child.getAge());
                        return ResponseEntity.ok(new ChildDto(child.getId(), child.getName(), child.getAge()));
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

    @DeleteMapping("/me/children/{childId}")
    public ResponseEntity<?> deleteChild(@AuthenticationPrincipal UserDetails user,
                                         @PathVariable Long childId) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return guestRepository.findByUsername(user.getUsername())
                .map(guest -> {
                    boolean removed = guest.getChildren() != null
                            && guest.getChildren().removeIf(c -> c.getId().equals(childId));
                    if (!removed) {
                        return ResponseEntity.notFound().build();
                    }
                    guestRepository.save(guest);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public record MeResponse(String username, String displayName, String partnerName, String email,
                            boolean admin, boolean guest, boolean presenceConfirmed, boolean presenceDeclined,
                            boolean transferNeed, List<ChildDto> children) {}

    public record SetEmailRequest(String email) {}

    public record SetTransferNeedRequest(Boolean need) {}

    public record ChildDto(long id, String name, Integer age) {}

    public record AddChildRequest(@NotBlank(message = "Name is required") String name, Integer age) {}
}
