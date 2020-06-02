package io.github.kprasad99.endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.kprasad99.orm.dao.EmployeeDao;
import io.github.kprasad99.orm.model.Employee;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/api/employee")
public class EmployeeService {

	@Autowired
	private EmployeeDao empDao;

	@GetMapping
	public Flux<Employee> list() {
		return Flux.fromIterable(empDao.findAll()).subscribeOn(Schedulers.boundedElastic());
	}

	@PutMapping
	@PreAuthorize("hasRole('APP1_ADMIN')")
	public Mono<Employee> add(@RequestBody Employee emp) {
		return Mono.fromSupplier(() -> {
			return empDao.saveAndFlush(emp);
		}).subscribeOn(Schedulers.boundedElastic());
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('APP1_ADMIN')")
	public Mono<Void> delete(@PathVariable("id") int id) {
		empDao.deleteById(id);
		return Mono.empty();
	}

}
