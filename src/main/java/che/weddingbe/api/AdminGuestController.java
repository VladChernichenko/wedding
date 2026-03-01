package che.weddingbe.api;

import che.weddingbe.guest.User;
import che.weddingbe.guest.GuestRepository;
import che.weddingbe.guest.RoleRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
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
        roleRepository.findByName("GUEST").ifPresent(guest.getRoles()::add);
        guest = guestRepository.save(guest);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CreateGuestResponse(guest.getUsername(), guest.getDisplayName(), guest.getPartnerName()));
    }

    public record CreateGuestRequest(
            @NotBlank(message = "Username is required") String username,
            @NotBlank(message = "Password is required") String password,
            String displayName,
            String partnerName
    ) {}

    public record CreateGuestResponse(String username, String displayName, String partnerName) {}
}
