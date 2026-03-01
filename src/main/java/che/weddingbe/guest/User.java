package che.weddingbe.guest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, name = "password")
    private String passwordHash;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "partner_name")
    private String partnerName;

    @Column(name = "email")
    private String email;

    @Column(name = "login_confirm_token")
    private String loginConfirmToken;

    @Column(name = "login_confirm_expires_at")
    private Instant loginConfirmExpiresAt;

    @Column(name = "presence_confirmed_at")
    private Instant presenceConfirmedAt;

    @Column(name = "presence_declined_at")
    private Instant presenceDeclinedAt;

    @Column(name = "transfer_needed", nullable = false)
    private Boolean transferNeeded = false;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Child> children = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    public boolean hasRole(String roleName) {
        return roles.stream().anyMatch(r -> roleName.equals(r.getName()));
    }
}
