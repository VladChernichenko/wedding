package che.weddingbe.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Logs every POST to /login for debugging (username present, CSRF present, etc.).
 */
public class LoginRequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(LoginRequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        boolean isLoginPost = "POST".equalsIgnoreCase(request.getMethod())
                && (uri.endsWith("/login") || "/login".equals(uri));
        if (isLoginPost) {
            String username = request.getParameter("username");
            String passwordParam = request.getParameter("password");
            boolean hasCsrf = request.getParameter("_csrf") != null;
            log.info("[LOGIN] POST /login received: uri='{}', username='{}', passwordPresent={}, hasCsrf={}, contentType={}",
                    uri, username, passwordParam != null && !passwordParam.isEmpty(), hasCsrf, request.getContentType());
        }
        filterChain.doFilter(request, response);
    }
}
