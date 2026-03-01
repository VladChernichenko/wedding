package che.weddingbe.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    public LoginRequestLoggingFilter loginRequestLoggingFilter() {
        return new LoginRequestLoggingFilter();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                        // Skip CSRF for form login/logout and admin API so it works when frontend is proxied
                        .ignoringRequestMatchers("/login", "/logout", "/api/admin/**")
                )
                .addFilterBefore(loginRequestLoggingFilter(), org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/login", "/logout", "/admin", "/index.html", "/assets/**", "/styles.css", "/images/**", "/api/i18n", "/api/i18n/**", "/api/me", "/error").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/login")
                        .defaultSuccessUrl("/", true)
                        .failureUrl("/login?error")
                        .successHandler(loginSuccessHandler())
                        .failureHandler(loginFailureHandler())
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler(logoutSuccessHandler())
                );
        return http.build();
    }

    private AuthenticationSuccessHandler loginSuccessHandler() {
        return (HttpServletRequest request, HttpServletResponse response, Authentication authentication) -> {
            log.info("[LOGIN] SUCCESS username='{}', returning 200 (no redirect)", authentication.getName());
            // Return 200 instead of 302 so fetch() keeps the response on the same request URL.
            // That way the session cookie is set for the request origin (e.g. Vite proxy 5173),
            // and the frontend can navigate to / without losing the cookie on a cross-origin redirect.
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{}");
            response.getWriter().flush();
        };
    }

    /**
     * Return 200 on logout instead of 302 so fetch() stays on the same origin (e.g. Vite 5173).
     * The frontend then navigates to /login; a redirect would send fetch to 8080 and trigger CORS.
     */
    private LogoutSuccessHandler logoutSuccessHandler() {
        return (HttpServletRequest request, HttpServletResponse response,
                org.springframework.security.core.Authentication authentication) -> {
            log.info("[LOGOUT] SUCCESS, returning 200 (no redirect)");
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{}");
            response.getWriter().flush();
        };
    }

    private AuthenticationFailureHandler loginFailureHandler() {
        return (HttpServletRequest request, HttpServletResponse response,
                org.springframework.security.core.AuthenticationException exception) -> {
            String username = request.getParameter("username");
            log.warn("[LOGIN] FAILURE username='{}', reason='{}', redirecting to /login?error",
                    username, exception.getMessage());
            response.sendRedirect(request.getContextPath() + "/login?error");
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Explicit authentication manager so form login uses our UserDetailsService and PasswordEncoder.
     * Without this, the default wiring can fail to use the PasswordEncoder bean, causing "Bad credentials".
     */
    @Bean
    public AuthenticationManager authenticationManager(WeddingUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }
}
