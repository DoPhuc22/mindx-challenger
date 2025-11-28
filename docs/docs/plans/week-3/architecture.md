# Week 3 Final Architecture

**Authors:** ThuanTV, Cursor AI

This document shows the final architecture that will be achieved after completing all steps in the Week 3 tasks guide. The Week 3 AI application builds upon the production-ready infrastructure from Week 1 and monitoring capabilities from Week 2, focusing on implementing an intelligent AI agent with Model Context Protocol (MCP) integration.

## Architecture Overview

The final architecture consists of an AI-powered application deployed on the existing AKS infrastructure with:

- AI agent with domain-specific knowledge base
- Model Context Protocol (MCP) integration for tool calling
- Real-time streaming capabilities for AI responses
- Vector database for knowledge retrieval
- API integration layer for external tool access
- Performance monitoring and product metrics

## AI Application Architecture (Building on Week 1 Infrastructure)

**Foundation:** This architecture builds upon the production-ready infrastructure established in Week 1 (AKS, ACR, HTTPS, Authentication) and monitoring from Week 2. Only AI-specific components are detailed below.

## ASCII Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│              WEEK 3: AI COMPONENTS ADDED TO EXISTING AKS CLUSTER             │
│                   (Week 1 Infrastructure: AKS + HTTPS + Auth)                │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │                     AI-ENHANCED APPLICATION LAYER                        ││
│  │                                                                          ││
│  │   Week 1 React App → Enhanced with AI Chat UI                            ││
│  │   Week 1 API       → Enhanced with AI Agent + MCPs                       ││
│  │                                                                          ││
│  │  ┌─────────────────────┐              ┌─────────────────────┐            ││
│  │  │   ENHANCED REACT    │   HTTP/WS    │     ENHANCED API    │            ││
│  │  │                     │◄────────────►│                     │            ││
│  │  │ + AI Chat Interface │              │ + AI Agent Core     │            ││
│  │  │ + Streaming UI      │              │ + MCP Client        │            ││
│  │  │                     │              │ + Security Layer    │            ││
│  │  │                     │              │  (Auth, PII, ...)   │            ││
│  │  └─────────────────────┘              └──────────┬──────────┘            ││
│  │                                                  │                       ││
│  │                                                  ▼                       ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │                   NEW AI INFRASTRUCTURE COMPONENTS                       ││
│  │                                                                          ││
│  │                           ┌─────────────────────┐                        ││
│  │                           │     ENHANCED API    │                        ││
│  │                           └────┬─────┬─────┬────┘                        ││
│  │           Query/Retrieve       │     │     │  Execute/Results            ││
│  │                 ┌──────────────┘     │     └──────────────┐              ││
│  │                 │         ┌─────────────────────┐         │              ││
│  │                 │         │   SECURITY LAYER    │         │              ││
│  │                 │         │ (Auth / PII / RBAC) │         │              ││
│  │                 │         └──────────┬──────────┘         │              ││
│  │                 │                    │                    │              ││
│  │                 ▼                    ▼                    ▼              ││
│  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐│
│  │  │    VECTOR DATABASE  │  │   AI MODEL APIs     │  │  MCP TOOL SERVERS   ││
│  │  │                     │  │                     │  │                     ││
│  │  │ ┌─────────────────┐ │  │ ┌─────────────────┐ │  │ ┌─────────────────┐ ││
│  │  │ │  Vector DBs     │ │  │ │ OpenRouter      │ │  │ │  External Tool  │ ││
│  │  │ │ - Qdrant+Chroma │ │  │ │ (Multi-LLM)     │ │  │ │  Integrations   │ ││
│  │  │ │ - Metadata      │ │  │ │ - Routing/Cost  │ │  │ │  (MCP Protocol) │ ││
│  │  │ │   - Similarity  │ │  │ │ - Rate Limits   │ │  │ │     Servers     │ ││
│  │  │ │   - Search      │ │  │ │                 │ │  │ │                 │ ││
│  │  │ └─────────────────┘ │  │ └─────────────────┘ │  │ └─────────────────┘ ││
│  │  │   Port: 8000        │  │   External APIs     │  │   Various Ports     ││
│  │  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘│
│  │              ▲                                                          │─│
│  │              │                                                          │─│
│  │              │ Store/Update                                             ││
│  │              │                                                          ││
│  │  ┌─────────────────────┐                                                ││
│  │  │ KNOWLEDGE PROCESSOR │                                                ││
│  │  │                     │                                                ││
│  │  │ ┌─────────────────┐ │                                                ││
│  │  │ │ Document Parser │ │                                                ││
│  │  │ │ Text Chunker    │ │                                                ││
│  │  │ │ Embedding Gen   │ │                                                ││
│  │  │ │ Batch Updates   │ │                                                ││
│  │  │ └─────────────────┘ │                                                ││
│  │  └─────────────────────┘                                                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │               ENHANCED MONITORING (Week 2 + AI Metrics)                 ││
│  │                                                                         ││
│  │  Existing Week 2 Monitoring + New AI-Specific Metrics:                  ││
│  │  • AI Chat Response Times                                               ││
│  │  • MCP Tool Call Success Rates & Execution Times                        ││
│  │  • Vector Database Query Performance & Accuracy                         ││
│  │  • User Chat Session Patterns & Satisfaction                            ││
│  │  • Chat Frequency and Message Volume                                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL AI & MCP SERVICES                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                       AI MODEL PROVIDERS                                ││
│  │                                                                         ││
│  │  ┌─────────────────────────────────────────────────────────────────┐    ││
│  │  │                    OpenRouter API                               │    ││
│  │  │  - Unified access to multiple LLMs                              │    ││
│  │  │  - Cost controls and routing                                    │    ││
│  │  │  - Built-in rate limiting and fallbacks                         │    ││
│  │  └─────────────────────────────────────────────────────────────────┘    ││
│  └─────────────────────────────────────────────────────────────────────────││
│                                                                            ││
│  ┌─────────────────────────────────────────────────────────────────────────││
│  │                        MCP TOOL SERVERS                                 ││
│  │                                                                         ││
│  │  ┌─────────────────────────────────────────────────────────────────┐    ││
│  │  │               Internal Tools (Examples)                         │    ││
│  │  │  - Database Query Tool                                          │    ││
│  │  │  - File System Access Tool                                      │    ││
│  │  │  - Internal Documentation Search                                │    ││
│  │  └─────────────────────────────────────────────────────────────────┘    ││
│  │                                                                         ││
│  │  ┌─────────────────────────────────────────────────────────────────┐    ││
│  │  │               External Tools (Examples)                         │    ││
│  │  │  - Other API Integration                                        │    ││
│  │  │  - Web Search Capabilities                                      │    ││
│  │  │  - Email/Teams Integration                                      │    ││
│  │  │  - Third-party API Connectors                                   │    ││
│  │  └─────────────────────────────────────────────────────────────────┘    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER FLOWS                                     │
│                                                                             │
│  Users access existing Week 1 HTTPS domain with enhanced AI capabilities    │
│                                                                             │
│  AI Chat Flow:                                                              │
│  1. User accesses https://yourdomain.com (Enhanced React AI Chat UI)        │
│  2. User sends message via WebSocket/Server-Sent Events                     │
│  3. React App sends chat request to /api/chat endpoint                      │
│  4. Enhanced API orchestrates the AI response:                              │
│     a. Queries vector database for relevant knowledge                       │
│     b. Calls appropriate MCP tools if needed                                │
│     c. Sends prompt to AI model via OpenRouter                              │
│     d. Streams response back to frontend                                    │
│  5. User receives real-time AI response with tool results                   │
│                                                                             │
│  Knowledge Management Flow:                                                 │
│  1. Knowledge Processing Job runs periodically                              │
│  2. Ingests documents and generates embeddings                              │
│  3. Updates vector database with new knowledge                              │
│  4. AI Agent retrieves relevant context for user queries                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Architecture Components

### 1. AI Agent Core

- **Purpose:** Intelligent conversation and task execution built into existing Week 1 API
- **Components:**
  - **AI Model Integration:** OpenRouter API access to multiple LLMs (GPT-4, Claude, Llama)
  - **Context Management:** Conversation history and session management
  - **Streaming Responses:** Real-time response streaming via WebSocket/SSE
  - **Token Management:** Usage tracking and optimization

### 2. Model Context Protocol (MCP) Integration

- **Purpose:** Enable AI agent to interact with external tools and services
- **Components:**
  - **MCP Server:** Tool registration and execution framework
  - **Tool Registry:** Available tools and capabilities discovery
  - **Tool Execution:** Secure tool calling with proper error handling
  - **Result Processing:** Tool output integration into AI responses

### 3. Knowledge Management System

- **Vector Database Options:**
  - **Qdrant**
  - **ChromaDB**
  - **Alternatives:** Pinecone (managed), Weaviate (GraphQL), Milvus (distributed)
- **Knowledge Processing Pipeline:** Document ingestion, chunking, and embedding
- **Domain-Specific Knowledge:** Curated content for specialized responses
- **Real-time Updates:** Scheduled knowledge base refresh

### 4. Enhanced Frontend (Building on Week 1)

- **React Chat UI:** Modern chat interface added to existing authenticated app
- **Real-time Communication:** WebSocket/SSE for streaming responses
- **File Upload:** Document upload for knowledge base expansion
- **Tool Interaction:** Visual representation of tool calls and results

### 5. Enhanced Monitoring (Building on Week 2)

- **AI-Specific Metrics added to existing monitoring:**
  - Response times and token usage
  - Tool call success rates
  - Knowledge retrieval accuracy
  - User satisfaction indicators
- **Product Analytics:** Chat session patterns and feature engagement

## Deployment Strategy

- **Builds on Week 1:** AKS + ACR + HTTPS reused (no new infra)
- **Ingress Routing:** Reuse nginx ingress with path rules (`/`, `/api`, `/chat`)
- **Secrets Management:** Azure Key Vault + Kubernetes secrets (no secrets in code)
- **Safe Updates:** Rolling updates via Kubernetes deployments
- **Observability:** App Insights metrics + alerts for errors/latency

## Key Differences from Week 1, Week 2

### What's Enhanced (not rebuilt):

- **Existing React App** → Enhanced with AI chat interface
- **Existing API** → Enhanced with AI agent and MCP capabilities
- **Existing AKS Cluster** → New AI services deployed alongside existing services
- **Existing Monitoring** → Enhanced with AI-specific metrics (App Insights)
- **Existing Product Metrics** → Google Analytics from Week 2 retained (page views, sessions, events)

### What's New:

- **Vector Database (ChromaDB/Qdrant/alternatives)** for knowledge storage and retrieval
- **Knowledge Processing Pipeline** for document ingestion
- **MCP Tool Servers** for external integrations
- **AI Model Integration** via OpenRouter or direct APIs
- **New Product Metrics (AI-specific):** Chat frequency, message Volume, user usage pattern, satisfaction

## Security Features

- **AI API Key Security:** Secure storage in Azure Key Vault (never in code)
- **PII Protection:** Filter personal data before sending to AI models
- **Authentication Integration:** JWT token validation with Week 1 auth system
- **Prompt Injection Prevention:** Input validation and sanitization
- **Tool Call Authorization:** Role-based permissions for MCP tool execution
- **Session Isolation:** Prevent cross-user conversation data leakage
- **Vector Database Encryption:** Protect knowledge base content at rest
- **Rate Limiting:** Prevent abuse and control AI API costs
- **Audit Logging:** Track all MCP tool calls and AI interactions
- **Output Filtering:** Prevent sensitive information in AI responses

## Collaboration Requirements

### 🔧 Sys Admin Collaboration Required

- **AI API Keys:** Provision and secure storage of AI model API keys
- **External Tool Access:** Configure permissions for MCP tool integrations

### 🔧 DevOps Collaboration Required

- **New Container Deployment:** Deploy additional AI services to existing AKS cluster
- **Resource Allocation:** Ensure adequate resources for AI workloads
- **AI-Specific Monitoring:** Configure enhanced monitoring for AI metrics

### 👨‍💻 Developer Self-Service

- **AI Application Development:** Chat interface and AI agent implementation
- **MCP Tool Development:** Custom tool creation and integration
- **Knowledge Base Management:** Content curation and embedding generation

## Success Metrics

### Technical Metrics

- **AI Chat Response Times**
- **MCP Tool Call Success Rates & Execution Times**
- **Vector Database Query Performance & Accuracy**
- **Knowledge Retrieval Relevance Scores**
- **AI Cost Tracking & Rate Limiting Effectiveness**

### Product Metrics

- **User Chat Session Patterns & Satisfaction**
- **Chat Frequency and Message Volume**

This architecture efficiently builds upon the solid foundation from Week 1 (containerization and deployment) and Week 2 (monitoring and metrics) to create a production-ready AI application that intelligently assists users while providing measurable value to the organization.
