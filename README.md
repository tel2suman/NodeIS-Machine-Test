Blog API – Backend

A Secure RESTful Blog API built with Node.js, Express, MongoDB, and Cloudinary.

🚀 Overview

This project is a production-ready Blog Backend API that supports:

User authentication (JWT-based)

Role-based authorization

Owner-only post update & delete

Cloudinary image uploads

Soft delete system

Proper MongoDB relationships

Clean REST architecture

The API ensures that only the post owner can update or delete their blog posts.

🛠 Tech Stack

Node.js

Express.js

MongoDB

Mongoose

JWT (jsonwebtoken)

bcrypt

Multer

Cloudinary

🔐 Authentication Module

Handles secure user authentication.

Features

User registration

Secure password hashing using bcrypt

Login with JWT token generation

Protected routes middleware

Role support (user, admin)

Security

Password hashing

JWT verification

Route protection middleware

👤 User Module

Manages user accounts and roles.

Features

Create user

Update user profile

Email uniqueness validation

Role-based access control

One-to-many relationship with blog posts

📝 Blog/Post Module

Handles blog post creation and management.

Features

Create post

Update post (Owner only)

Delete post (Owner only)

Soft delete system

Fetch all posts

Fetch single post

Ownership Protection

Only the post creator can update or delete the post.

Image Upload (Cloudinary Integration)

Handles blog cover image uploads securely.

Features

🖼 Image Upload (Cloudinary Integration)

Image resizing & optimization

Replace old image during update

Delete previous Cloudinary image

Local file cleanup after upload

Benefits

No local image storage

Optimized media delivery

Scalable architecture

🗑 Soft Delete System

Instead of permanently removing posts, the system marks them as deleted.
