package ru.kata.spring.boot_security.demo.dao;


import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.model.User;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.util.List;


@Repository
public class UserDaoImpl implements UserDao {

    @PersistenceContext
    private EntityManager entityManager;


    public UserDaoImpl() {
    }

    //получить всех пользователей
    @Override
    public List<User> findAll() {
        return entityManager.createQuery("SELECT u FROM User u", User.class).getResultList();
    }

    // найти пользователя по ID.
    @Override
    public User findById(Long id) {
        return entityManager.find(User.class, id);
    }

    //Cохранить нового пользователя или обновить существующего.
    @Override
    @Transactional
    public void add(User user) {
        if (user.getId() == null) {
            entityManager.persist(user);
        } else {
            entityManager.merge(user);
        }
    }

    //Обновляет данные существующего пользователя.
    @Override
    @Transactional
    public void update(User user) {
        entityManager.merge(user);
    }

    // удалить пользователя по ID
    @Override
    @Transactional
    public void delete(Long id) {
        User user = entityManager.find(User.class, id);
        if (user != null) {
            entityManager.remove(user);
        }
    }

    @Override
    public User findByUsername(String username) {
        Query query = entityManager.createQuery("SELECT u FROM User u WHERE u.username = :username", User.class);
        query.setParameter("username", username);

        List<User> users = query.getResultList();

        return users.isEmpty() ? null : users.get(0);
    }
}
