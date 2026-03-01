package che.weddingbe.api;

import che.weddingbe.guest.Child;
import che.weddingbe.guest.User;
import che.weddingbe.guest.GuestRepository;
import che.weddingbe.guest.RoleRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminGuestController {

    private final GuestRepository guestRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminGuestController(GuestRepository guestRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.guestRepository = guestRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users")
    public List<UserListResponse> listUsers() {
        return guestRepository.findAll().stream()
                .map(u -> {
                    List<ChildDto> children = (u.getChildren() != null ? u.getChildren() : List.<Child>of()).stream()
                            .map(c -> new ChildDto(c.getId(), c.getName(), c.getAge()))
                            .toList();
                    List<String> roleNames = u.getRoles().stream()
                            .map(r -> r.getName())
                            .toList();
                    return new UserListResponse(
                            u.getUsername(),
                            u.getDisplayName(),
                            u.getPartnerName(),
                            u.getPresenceConfirmedAt() != null,
                            u.getPresenceDeclinedAt() != null,
                            Boolean.TRUE.equals(u.getTransferNeeded()),
                            roleNames,
                            children
                    );
                })
                .toList();
    }

    @GetMapping("/roles")
    public List<RoleResponse> listRoles() {
        return roleRepository.findAll().stream()
                .map(r -> new RoleResponse(r.getId(), r.getName()))
                .toList();
    }

    @PostMapping("/guests")
    public ResponseEntity<CreateGuestResponse> createGuest(@Valid @RequestBody CreateGuestRequest request) {
        if (guestRepository.findByUsername(request.username()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        User guest = new User();
        guest.setUsername(request.username().trim());
        guest.setPasswordHash(passwordEncoder.encode(request.password()));
        guest.setDisplayName(request.displayName() != null ? request.displayName().trim() : null);
        guest.setPartnerName(request.partnerName() != null ? request.partnerName().trim() : null);
        String email = request.email() != null ? request.email().trim() : null;
        guest.setEmail(email != null && !email.isEmpty() ? email : null);
        List<String> roleNames = request.roles() != null && !request.roles().isEmpty()
                ? request.roles()
                : List.of("GUEST");
        for (String name : roleNames) {
            roleRepository.findByName(name.trim().toUpperCase()).ifPresent(guest.getRoles()::add);
        }
        if (guest.getRoles().isEmpty()) {
            roleRepository.findByName("GUEST").ifPresent(guest.getRoles()::add);
        }
        guest = guestRepository.save(guest);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CreateGuestResponse(guest.getUsername(), guest.getDisplayName(), guest.getPartnerName()));
    }

    public record CreateGuestRequest(
            @NotBlank(message = "Username is required") String username,
            @NotBlank(message = "Password is required") String password,
            String displayName,
            String partnerName,
            String email,
            List<String> roles
    ) {}

    public record CreateGuestResponse(String username, String displayName, String partnerName) {}

    public record RoleResponse(long id, String name) {}

    public record UserListResponse(String username, String displayName, String partnerName,
                                   boolean presenceConfirmed, boolean presenceDeclined, boolean transferNeed,
                                   List<String> roles, List<ChildDto> children) {}

    public record ChildDto(long id, String name, Integer age) {}
}
