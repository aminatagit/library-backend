$body = @{
  email = "testcopilot@example.com"
  password = "CopilotPass123"
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:4000/api/users/login' -Method POST -Body $body -ContentType 'application/json'
