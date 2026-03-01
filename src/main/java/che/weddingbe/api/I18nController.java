package che.weddingbe.api;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.context.MessageSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.RequestContextUtils;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api")
public class I18nController {

    private static final List<String> KEYS = Arrays.asList(
            "intro", "names", "request", "requestLine2", "date", "venue", "rsvp",
            "welcome.alone", "welcome.withPartner",
            "userbar.loggedIn", "userbar.logout",
            "login.title", "login.intro", "login.username", "login.password", "login.submit", "login.error",
            "admin.title", "admin.createGuest", "admin.username", "admin.password", "admin.displayName", "admin.partnerName", "admin.submit", "admin.success", "admin.error", "admin.backToInvitation", "welcome.adminLink"
    );

    private final MessageSource messageSource;

    public I18nController(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    @GetMapping(value = "/i18n", produces = "application/json; charset=UTF-8")
    public Map<String, Object> messages(HttpServletRequest request,
                                        @RequestParam(required = false) String lang) {
        Locale locale = lang != null && !lang.isEmpty()
                ? Locale.forLanguageTag(lang)
                : RequestContextUtils.getLocale(request);
        Map<String, String> messages = new HashMap<>();
        for (String key : KEYS) {
            try {
                messages.put(key, messageSource.getMessage(key, null, locale));
            } catch (Exception e) {
                messages.put(key, key);
            }
        }
        return Map.of(
                "locale", locale.toLanguageTag(),
                "messages", messages
        );
    }
}
