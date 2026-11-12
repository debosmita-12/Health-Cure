package com.healthcure.dto;

public class GoogleUserInfo {
    private String sub;
    private String email;
    private boolean emailVerified;
    private String firstName;
    private String lastName;
    private String name;
    private String picture;

    public GoogleUserInfo() {}

    public GoogleUserInfo(String sub, String email, boolean emailVerified, String firstName, String lastName, String name, String picture) {
        this.sub = sub;
        this.email = email;
        this.emailVerified = emailVerified;
        this.firstName = firstName;
        this.lastName = lastName;
        this.name = name;
        this.picture = picture;
    }

    public String getSub() { return sub; }
    public void setSub(String sub) { this.sub = sub; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }
}
