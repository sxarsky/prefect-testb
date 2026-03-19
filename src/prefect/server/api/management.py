"""
User and Product Management API.

This module provides endpoints for managing users and products
in the Prefect application.
"""

from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/management", tags=["Management"])


@router.get("/users")
async def list_users():
    """
    List all users in the system.

    Returns a list of all registered users with their basic information.
    """
    return {
        "users": [
            {"id": 1, "name": "Alice", "email": "alice@example.com"},
            {"id": 2, "name": "Bob", "email": "bob@example.com"}
        ],
        "total": 2
    }


@router.get("/users/{user_id}")
async def get_user(user_id: int):
    """
    Get detailed information about a specific user.

    Args:
        user_id: The unique identifier of the user

    Returns:
        User details including id, name, email, and role
    """
    return {
        "id": user_id,
        "name": f"User {user_id}",
        "email": f"user{user_id}@example.com",
        "role": "member",
        "active": True
    }


@router.post("/users")
async def create_user(name: str, email: str):
    """
    Create a new user in the system.

    Args:
        name: Full name of the user
        email: Email address for the user

    Returns:
        The newly created user object with assigned ID
    """
    return {
        "id": 999,
        "name": name,
        "email": email,
        "role": "member",
        "active": True,
        "created_at": "2026-03-19T12:00:00Z"
    }


@router.get("/products")
async def list_products():
    """
    List all products in the catalog.

    Returns a list of all available products with pricing information.
    """
    return {
        "products": [
            {"id": 1, "name": "Widget", "price": 9.99, "category": "tools"},
            {"id": 2, "name": "Gadget", "price": 19.99, "category": "electronics"}
        ],
        "total": 2
    }


@router.get("/products/{product_id}")
async def get_product(product_id: int):
    """
    Get detailed information about a specific product.

    Args:
        product_id: The unique identifier of the product

    Returns:
        Product details including id, name, price, and category
    """
    return {
        "id": product_id,
        "name": f"Product {product_id}",
        "price": 29.99,
        "category": "general",
        "in_stock": True
    }
