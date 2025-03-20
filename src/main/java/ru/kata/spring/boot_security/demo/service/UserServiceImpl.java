package ru.kata.spring.boot_security.demo.service;


import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.Exceptions.UserAlreadyExistsException;
import ru.kata.spring.boot_security.demo.Exceptions.UserNotFoundException;
import ru.kata.spring.boot_security.demo.Exceptions.ValidationException;
import ru.kata.spring.boot_security.demo.dao.UserDao;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;

import java.util.Collection;
import java.util.List;


import java.util.stream.Collectors;


@Service
public class UserServiceImpl implements UserService {

    private final UserDao userDao;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    public List<User> findAll() {
        return userDao.findAll();
    }

    @Override
    @Transactional
    public List<User> findAllWithRoles() {
        List<User> users = userDao.findAll();
        for (User user : users) {
            Hibernate.initialize(user.getRoles());
        }
        return users;
    }

    @Override
    @Transactional
    public void add(User user) {
        validateUser(user);

        if (userDao.findByUsername(user.getUsername()) != null) {
            throw new UserAlreadyExistsException("Пользователь с email " + user.getUsername() + " уже существует");
        }

        user.setActive(true);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userDao.add(user);

    }

    @Override
    @Transactional
    public void update(User user) {
        validateUser(user);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userDao.update(user);
    }

    @Override
    @Transactional
    public void delete(Long id) {

        if (id == null) {
            throw new UserNotFoundException("Невозможно удалить: пользователь с ID " + id + " не найден");
        }

        userDao.delete(id);
    }

    @Transactional
    @Override
    public User findByUsername(String username) {
        User user = userDao.findByUsername(username);
        if (user == null) {
            throw new UserNotFoundException("Пользователь с именем " + username + " не найден");
        }
        Hibernate.initialize(user.getRoles());
        return user;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userDao.findByUsername(username);

        if (user == null) {
            System.out.println("User not found: " + username);
            throw new UsernameNotFoundException(String.format("No user found with username '%s'", username));

        }
        Hibernate.initialize(user.getRoles());
        System.out.println("User found: " + user.getUsername() + " with roles " + user.getRoles());

        return user;

    }



    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(Collection<Role> roles) {
        return roles.stream()
                .map(r -> new SimpleGrantedAuthority(r.getRole()))
                .collect(Collectors.toList());
    }

    private void validateUser(User user) {
        if (user.getUsername() == null || user.getUsername().isEmpty()) {
            throw new ValidationException("Имя пользователя не может быть пустым");
        }
        if (user.getUsername() == null || !user.getUsername().contains("@")) {
            throw new ValidationException("Некорректный email: " + user.getUsername());
        }

    }
}
