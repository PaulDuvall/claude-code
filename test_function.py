def calculate_password_strength(password):
    """Calculate password strength score."""
    score = 0
    if len(password) >= 8:
        score += 1
    if any(c.isupper() for c in password):
        score += 1
    if any(c.islower() for c in password):
        score += 1
    if any(c.isdigit() for c in password):
        score += 1
    return score

# Test the function
if __name__ == "__main__":
    test_password = "MyPassword123"
    strength = calculate_password_strength(test_password)
    print(f"Password strength: {strength}/4")