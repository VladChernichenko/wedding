package che.weddingbe.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the React SPA for / and /login so client-side routing works on reload.
 */
@Controller
public class SpaController {

    @GetMapping(value = { "/", "/login" })
    public String index() {
        return "forward:/index.html";
    }
}