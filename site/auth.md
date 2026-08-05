---
title: "EcoSmartHomes - Agent Authentication Specification (auth.md)"
version: "1.0.0"
date: "2026-08-03"
domain: "ecosmarthomes.ie"
format: "auth.md/v1"
specification: "https://workos.com/auth-md"
---

# EcoSmartHomes: AI Agent Authentication & Skill Registration

This document outlines the authentication protocol for autonomous AI agents, LLM assistants, and agentic clients connecting to EcoSmartHomes APIs.

## 1. Dynamic Client Registration & Authentication Flow

AI Agents can programmatically register and acquire access tokens to call EcoSmartHomes retrofit skills, BER analytics, and grant computation tools.

### Registration Endpoint
- **URI**: `https://ecosmarthomes.ie/api/oauth/register`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "client_name": "My Retrofit AI Assistant",
    "grant_types": ["client_credentials", "authorization_code"],
    "response_types": ["code", "token"],
    "scope": "read:retrofit_plans read:ber_analysis execute:skills"
  }
  ```

### Token Request Endpoint
- **URI**: `https://ecosmarthomes.ie/api/oauth/token`
- **Method**: `POST`
- **Grant Type**: `client_credentials`
- **Header**: `Authorization: Bearer <token>` or `client_secret_post`

---

## 2. Supported Credentials & Identity Types

- **Identity Types**: `ai_agent`, `autonomous_bot`, `llm_assistant`, `service_account`
- **Credential Types**: `oauth2_client_credentials`, `bearer_token`, `mcp_auth_token`
- **Token Type**: `Bearer`
- **JWKS Endpoint**: `https://ecosmarthomes.ie/api/oauth/jwks.json`

---

## 3. Scope Permissions & Claims

| Scope | Permission Description |
| :--- | :--- |
| `read:retrofit_plans` | Grants access to prioritized home energy upgrade recommendations |
| `read:ber_analysis` | Grants access to BER band jump calculations and DEAP energy metrics |
| `read:grant_guidance` | Grants access to SEAI grant allocations and bonus package rules |
| `execute:skills` | Grants permission to execute MCP tools and interactive WebMCP callbacks |

---

## 4. Metadata References

- **OAuth Authorization Server**: `https://ecosmarthomes.ie/.well-known/oauth-authorization-server`
- **OAuth Protected Resource**: `https://ecosmarthomes.ie/.well-known/oauth-protected-resource`
- **OpenID Connect Discovery**: `https://ecosmarthomes.ie/.well-known/openid-configuration`
- **MCP Manifest**: `https://ecosmarthomes.ie/api/mcp/manifest.json`
