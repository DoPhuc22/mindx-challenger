# Week 3 Tasks: AI Application with Domain Knowledge and MCPs

**Authors:** ThuanTV, Cursor AI  
**Document Summary:** This document provides a comprehensive step-by-step walkthrough for completing Week 3 objectives of the MindX Engineer Onboarding program. The guide covers building and deploying an AI application with domain-specific knowledge and Model Context Protocol (MCP) integration. Each step builds incrementally upon the existing production infrastructure from Week 1 and monitoring setup from Week 2, introducing advanced AI concepts including vector databases, retrieval-augmented generation (RAG), streaming responses, and tool calling. The final deliverable is a production-ready AI assistant that can intelligently answer domain-specific questions and execute tasks using external tools.

**Customization Note:** This guide can be customized and tailored to your preferences, AI models, knowledge domains, or MCP tools, as long as the end goals from the Week 3 overview are met. Feel free to adapt the AI models, vector databases, tool integrations, or deployment approaches to match your learning objectives or organizational needs.

**Example Prompt for Customization:**
_"Here is the original plan for Week 3 [The guide]. I want to use OpenAI directly instead of OpenRouter as the AI model provider. Tailor this guide to use OpenAI APIs for all AI model interactions, and ensure the end goals are still met. Focus on any changes needed for API integration, authentication, and deployment steps."_

Other customization examples:

- Modifying knowledge domains or MCP tool integrations
- Adjusting prompt patterns, chat UX, and monitoring dashboards

This document provides a streamlined 3-step approach to complete Week 3 objectives. The guide focuses on building a production-ready AI agent with interconnected capabilities rather than isolated components. Each step builds upon the previous one and the infrastructure from Weeks 1-2 to create an intelligent AI application.

**📅 Revised Week 3 Plan: Streamlined 3-Step Approach**

- **Step 1: Basic AI Chat Integration (Days 1-2)** - Set up AI model access, create chat UI with streaming responses, deploy to AKS
- **Step 2: AI Agent with Knowledge & Tools (Days 3-4)** - Build integrated system combining Vector Database + RAG, MCP Tool Framework, and Basic Agent Coordination in parallel
- **Step 3: Production Deployment & Monitoring** - Deploy to production, implement comprehensive metrics and monitoring, ensure production readiness and go-live

## 🔧 Sys Admin / DevOps Collaboration Guide

Throughout this guide, you'll see **🔧 Sys Admin / DevOps Check** or **🔧 DevOps Collaboration** notes. These indicate tasks that may require elevated permissions or collaboration with your infrastructure team.

**Permission Levels:**

- **Developer:** Can write code, configure models, create knowledge base content
- **DevOps:** Can manage vector databases, API key storage, container orchestration
- **Sys Admin:** Can provision AI API keys, external tool access, and secure secret management

**Quick Self-Assessment:**

- Run `kubectl get pods` - Can you see your Week 1 application running?
- Check `az keyvault secret list --vault-name [vault]` - Do you have access to secret storage?
- Verify AI API access - Can you make test calls to OpenRouter or chosen AI provider?

If any checks fail, coordinate with your infrastructure team early in the process.

## Step 1: Basic AI Chat Integration (Days 1-2)

### Overview

Integrate a basic AI chat capability into the existing React frontend and API backend from Week 1. Set up AI model access, implement streaming responses, and create a functional chat interface that builds on the authenticated application.

### Prerequisites

- Completed Week 1 with working full-stack application on AKS with HTTPS
- Completed Week 2 with Azure App Insights and Google Analytics integration
- Basic understanding of AI APIs and chat interfaces
- OpenRouter API key or alternative AI provider credentials

**🔧 Sys Admin / DevOps Check:**

- **AI API Keys Required:** Can you provision OpenRouter API keys or alternative AI provider access?
  **API Quota Limitations:** Check your API key limits - Spending caps
- **Secret Management:** Can you store sensitive API keys in Azure Key Vault or Kubernetes secrets?
- **Simple Test:** Try making a test API call to your chosen AI provider
- **If No Access:** Request AI API provisioning and secure secret storage from Sys Admin

### Tasks

#### 1.1 Set Up AI Model Access

Configure access to AI models via OpenRouter API. Set up API key management using Azure Key Vault or Kubernetes secrets for secure credential storage.

**🔧 DevOps Collaboration:** API key storage requires secure secret management

- **Check:** Can you create and access secrets ?
- **If No:** Ask DevOps team to set up secret management

#### 1.2 Update API Backend for AI Integration

Modify the existing Node.js/TypeScript API to include AI chat endpoints. Implement basic chat functionality with streaming responses using Server-Sent Events (SSE) or WebSocket connections.

#### 1.3 Create Chat UI Components

Build React chat interface components that integrate with the existing authenticated frontend. Create message display, input handling, and real-time response streaming capabilities.

#### 1.4 Implement Streaming Responses

Set up real-time communication between frontend and backend for AI response streaming. Implement proper error handling and loading states for AI interactions.

#### 1.5 Test and Deploy Basic Chat

Test the basic AI chat functionality locally, then containerize and deploy the updated services to the existing AKS cluster (infrastructure already established in Week 1).

#### 1.6 Update Monitoring

Integrate AI-specific metrics into existing Azure App Insights and Google Analytics setup from Week 2. Track AI response times, token usage, and chat session patterns.

### Deliverables for Step 1

- Working AI chat interface integrated into existing React application
- API backend with AI model integration and streaming responses
- Real-time chat functionality accessible via HTTPS domain from Week 1
- AI-specific monitoring metrics integrated with Week 2 setup
- Updated container images deployed to AKS
- Documentation for AI integration and deployment process

### Success Criteria

- Users can send messages and receive AI responses through the chat interface
- AI responses stream in real-time to the frontend
- Chat functionality works within the authenticated application from Week 1
- AI metrics appear in Azure App Insights dashboard
- Chat sessions are tracked in Google Analytics
- Error handling gracefully manages AI API failures

### 🤖 AI Learning Hints

**Where to start:**
_"I need to learn how to integrate AI models into web applications with streaming responses. What are the fundamental concepts of AI APIs, real-time communication, and chat interfaces I should understand first?"_

**What key points to learn:**
_"I'm integrating AI chat capabilities into my existing full-stack application. What are the essential patterns for AI API integration, streaming responses, WebSocket/SSE communication, and chat UI development?"_

**How to create plan to execute:**
_"Help me create a systematic plan for adding AI chat functionality to my existing React + Node.js application deployed on AKS. What's the step-by-step approach for AI integration and real-time communication?"_

**How to troubleshoot using AI:**
_"My AI chat integration isn't working properly - responses aren't streaming or the chat interface has issues. Here's my setup and error details: [paste details]. Help me debug AI API integration and real-time communication problems."_

_"My AI API calls are failing or slow. Here's my backend logs from `kubectl logs [ai-api-pod-name]` and my AI provider configuration: [paste details]. Help me debug AI model access and performance issues."_

_"My chat interface isn't receiving streaming responses. Here's my frontend WebSocket/SSE code and network activity: [paste details]. What's wrong with my real-time communication setup?"_

---

## Step 2: AI Agent with Knowledge & Tools

### Overview

Build a comprehensive AI agent that combines vector database knowledge retrieval, MCP tool calling, and basic agent coordination. This step integrates three interconnected components: RAG for domain-specific knowledge, MCP framework for tool execution, and simple agent memory for context management.

### Prerequisites

- Completed Step 1 with working basic AI chat functionality
- Understanding of vector embeddings, similarity search, and tool calling
- Knowledge of MCP standard and basic agent architectures

### Core Components (Build in Parallel)

#### Component A: Vector Database + RAG

#### 2.1 Deploy Vector Database

Set up Qdrant in the AKS cluster with persistent storage.

#### 2.2 Basic Knowledge Pipeline

Create simple document ingestion service that converts text files to embeddings and stores in vector database.

#### 2.3 Integrate RAG into Chat

Add vector search to AI API - query knowledge base before generating responses.

#### Component B: MCP Tool Framework

#### 2.4 MCP Server Setup

Implement basic MCP server within AI API for tool registration and execution.

#### 2.5 Create Essential Tools

Build 2-3 fundamental tools:

- Database query tool (application data access)
- File system tool (read files)
- External API call tool

#### 2.6 Tool Integration

Add tool calling capability to chat flow with proper error handling.

#### Component C: Basic Agent Coordination

#### 2.7 Simple Conversation Memory

Implement basic chat history storage and context management across sessions.

#### 2.8 Error Handling & Testing

Add robust error handling for both RAG and tool failures, test all components together.

### Deliverables for Step 2

- Vector database (ChromaDB/Qdrant) deployed in AKS with persistent storage
- Knowledge ingestion pipeline for document processing and embedding storage
- MCP server implemented within AI API with tool registration framework
- Working tools: database query, file system access, and external API call tools
- Enhanced chat interface with knowledge retrieval and tool execution capabilities
- Updated container images deployed to AKS with integrated AI agent

### Success Criteria

- AI retrieves relevant knowledge from vector database for domain-specific questions
- AI successfully executes tools when appropriate based on user queries
- Conversation memory maintains context across chat sessions
- Vector search returns appropriate knowledge for user queries
- Tool execution integrates smoothly into conversation flow
- Error handling gracefully manages both knowledge retrieval and tool execution failures

### 🤖 AI Learning Hints

**Where to start:**
_"I need to learn about building AI agents with multiple capabilities: vector databases for knowledge retrieval, MCP for tool calling, and conversation memory. What are the fundamental concepts for combining RAG, tool execution, and agent coordination?"_

**What key points to learn:**
_"I'm building an AI agent that combines knowledge retrieval, tool calling, and conversation memory. What are the essential patterns for integrating vector databases, MCP tool servers, and agent coordination in a single system?"_

**How to create plan to execute:**
_"Help me create a plan for building an integrated AI agent with RAG + MCP tools + conversation memory. What's the step-by-step approach for building these interconnected components together?"_

**How to troubleshoot using AI:**
_"My AI agent components aren't working together - either RAG retrieval fails, tools don't execute, or conversation memory is lost. Here's my integrated system setup: [paste details]. Help me debug multi-component AI agent issues."_

_"My knowledge retrieval and tool calling are interfering with each other or context is lost between interactions. Here's my agent coordination logic: [paste details]. How can I improve the integration between these components?"_

_"My vector database or MCP tools are causing performance issues in the integrated system. Here's my deployment and performance metrics: [paste details]. Help me optimize the overall agent performance."_

---

## Step 3: Production Deployment & Monitoring

### Overview

Deploy the AI agent to production and implement comprehensive metrics and monitoring systems. Focus on getting the product live, setting up proper monitoring infrastructure, ensuring production readiness with full observability.

### Prerequisites

- Completed Step 2 with working AI agent
- Understanding of production deployment strategies
- Knowledge of monitoring, metrics, and alerting systems

### Tasks

#### 3.1 Production Build & Containerization

Prepare production-ready builds of all AI components. Create optimized Docker images with proper environment configurations, health checks, and resource limits.

#### 3.2 Production Deployment to AKS

Deploy AI agent to production AKS environment with proper configuration

#### 3.3 Comprehensive Metrics Implementation

Set up detailed metrics tracking for:

- **AI Performance Metrics:** Response times, success rates, error patterns, execution times
- **User Engagement Metrics:** Session duration, feature usage, user satisfaction

#### 3.4 Production Monitoring & Alerting

Implement monitoring systems using Azure App Insights and create dashboards for:

- **System Health:** Application uptime, error rates, resource utilization
- **Performance Alerts:** Response time thresholds, error rate spikes, failure alerts

#### 3.5 Production Validation & Go-Live

Conduct final production testing and validation:

- Load testing with realistic user scenarios
- End-to-end feature validation
- Security and performance verification
- Monitoring and alerting validation
- Official go-live with production access

### Deliverables for Step 3

- Production-ready container images with optimized configurations and health checks
- AI agent deployed to production AKS environment with proper resource allocation
- Comprehensive metrics collection system integrated with Azure App Insights
- Production monitoring dashboards showing AI performance and system health
- Load testing results and performance validation documentation
- Live AI application accessible to end users via production HTTPS endpoint

### Success Criteria

- End users can access and interact with the AI application via the live application
- AI application consistently delivers domain-specific knowledge with accurate, grounded responses from the knowledge base and expected functionality performance
- All key AI and product metrics are actively tracked, easily accessible, and provide actionable insights
- Automated alerts are in place and trigger promptly for any performance degradation, errors, enabling rapid response and resolution

### 🤖 AI Learning Hints

**Where to start:**
_"I need to learn about deploying AI applications to production and setting up comprehensive monitoring. What are the key concepts for production deployment, metrics tracking, version management, and production readiness I should understand?"_

**What key points to learn:**
_"I'm deploying my AI agent to production with full monitoring and metrics. What are the essential patterns for production deployment, monitoring infrastructure, metrics collection, alerting systems, and ensuring production reliability?"_

**How to create plan to execute:**
_"Help me create a systematic approach for deploying my AI agent to production and implementing comprehensive monitoring. What's the step-by-step process for production deployment, metrics setup, monitoring dashboards, and go-live validation?"_

**How to troubleshoot using AI:**
_"My production deployment is failing or monitoring systems aren't working properly. Here's my deployment configuration, monitoring setup, and infrastructure details: [paste details]. Help me resolve deployment issues and fix monitoring problems."_

_"My metrics aren't being collected properly or alerts aren't triggering. Here's my monitoring configuration, metrics data, and alerting setup: [paste details]. How can I improve metrics collection and alerting effectiveness?"_

_"My production system has performance or reliability issues. Here's my production logs, metrics data, and system performance: [paste details]. Help me identify and resolve production problems."_
