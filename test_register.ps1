$body = @{
  username = "testcopilot"
  email = "testcopilot@example.com"
  password = "CopilotPass123"
  role = "admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:4000/api/users/register' -Method POST -Body $body -ContentType 'application/json'
