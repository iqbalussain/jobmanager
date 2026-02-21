-- Insert missing user_roles for users who have a role in profiles but not in user_roles
INSERT INTO user_roles (user_id, role)
SELECT p.id, p.role
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = p.id AND ur.role = p.role
)
AND p.role IS NOT NULL;