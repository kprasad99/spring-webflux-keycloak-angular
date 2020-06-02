package io.github.kprasad99.orm.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.github.kprasad99.orm.model.Employee;

@Repository
public interface EmployeeDao extends JpaRepository<Employee, Integer> {

}
