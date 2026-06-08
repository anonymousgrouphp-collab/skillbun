## Django: Full-Stack Web Framework Study Guide

Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. It's famous for its "batteries-included" philosophy, meaning it provides most of what a developer needs to get started right out of the box, reducing the need for third-party libraries for common functionalities.

### 1. The MTV Architecture

While often compared to MVC (Model-View-Controller), Django follows a slightly different pattern called MVT (Model-View-Template):

*   **Model:** Defines your data structure, typically a Python class, and how it's stored in the database (using Django's ORM). It's the 'single source of truth' about your data.
*   **View:** A Python function or class that receives a web request and returns a web response. It contains the logic to fetch data from the Model and pass it to the Template.
*   **Template:** An HTML file with Django Template Language (DTL) syntax, responsible for rendering data received from the View into the user interface.

### 2. Object-Relational Mapper (ORM)

Django's ORM allows you to interact with your database using Python objects, abstracting away the need to write raw SQL queries. This makes database interactions more intuitive and less error-prone.

**Example: Defining a Simple Model**

```python
# myapp/models.py
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
```

### 3. Django Admin Panel

One of Django's most powerful features is its automatically generated administrative interface. Once you define your models, you can register them with the admin site, providing a user-friendly way to manage your application's data without writing any backend code for the admin itself.

**Example: Registering a Model**

```python
# myapp/admin.py
from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'created_at')
    search_fields = ('name', 'description')
```

### 4. Templating Engine

Django's built-in templating engine allows you to dynamically generate HTML. Templates use a simple syntax for displaying variables, looping over data, and conditionally rendering content.

**Example: Basic Template Usage**

```html
<!-- myapp/templates/myapp/product_list.html -->
<!DOCTYPE html>
<html>
<head><title>Products</title></head>
<body>
    <h1>Our Products</h1>
    <ul>
        {% for product in products %}
            <li>{{ product.name }} - ${{ product.price }}</li>
        {% empty %}
            <li>No products available.</li>
        {% endfor %}
    </ul>
</body>
</html>
```

### 5. Authentication and Authorization

Django comes with a robust, built-in authentication system that handles user accounts, groups, permissions, password hashing, and session management, saving developers significant time and effort.

### 6. REST APIs with Django REST Framework (DRF)

While Django excels at traditional server-rendered web applications, it can also be used to build powerful RESTful APIs. Django REST Framework (DRF) is a flexible toolkit for building web APIs on top of Django. It provides serializers, viewsets, and routers to simplify API development.

**Example: A Simple Serializer for DRF**

```python
# myapp/serializers.py
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price']
```

### Quick Understanding Checklist:

1.  In your own words, explain what Django's "batteries-included" philosophy means for a developer starting a new project.
2.  Describe the primary purpose of Django's ORM. Provide a simple example of how you would define a `DateTimeField` for a `last_updated` field in a Django model.
3.  What role does Django REST Framework (DRF) play in extending Django's capabilities, particularly when building modern web applications?
