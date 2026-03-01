package che.weddingbe.guest;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChildRepository extends JpaRepository<Child, Long> {

    List<Child> findByUser_IdOrderById(Long userId);
}
