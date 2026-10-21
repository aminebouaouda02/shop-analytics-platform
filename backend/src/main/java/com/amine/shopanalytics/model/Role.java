package com.amine.shopanalytics.model;

/**
 * Roles used by Spring Security authorities.
 * Regular shoppers register as ROLE_USER; admins are assigned manually.
 */
public enum Role {
    ROLE_USER,
    ROLE_ADMIN
}
