# NextLead n8n Nodes

This package provides n8n nodes for integrating with the NextLead CRM API.

## Architecture

The package follows a modular architecture with separate nodes for each resource type:

- **NextLeadContact**: Manage contacts (create, update, delete, find, get team, get conversion, get custom fields)
- **NextLeadStructure**: Manage structures (create, update, delete, get all)
- **NextLeadSale**: Manage sales (create, update, delete, get columns)
- **NextLeadAction**: Manage actions (create, update, delete, get columns)
- **NextLeadList**: Manage lists (get all)

## Core Services

### NextLeadApiService
Central service for all API communications with NextLead. Handles authentication, request building, and response processing.

### BaseNextLeadNode
Abstract base class providing common functionality for all NextLead nodes:
- API service initialization
- Error handling
- Response processing
- Common node structure

### NextLeadErrorHandler
Centralized error handling with proper error types and user-friendly messages.

## Usage

1. Install the package in your n8n instance
2. Configure NextLead API credentials (domain and API key)
3. Use the individual resource nodes in your workflows

## API Documentation

For detailed API documentation, visit: https://dashboard.nextlead.app/en/api-documentation

## Node Structure

Each node follows the Single Responsibility Principle:
- One node per resource type
- Clear separation of concerns
- Reusable core services
- Consistent error handling

## Development

### Adding New Operations

1. Add the operation to the appropriate resource node
2. Update the `getOperations()` method
3. Add required fields in `getFields()`
4. Implement the operation in `executeOperation()`
5. Add the API method to `NextLeadApiService` if needed

### Adding New Resources

1. Create a new node class extending `BaseNextLeadNode`
2. Implement required abstract methods
3. Add corresponding API methods to `NextLeadApiService`
4. Create the node.json configuration file

## Migration from Legacy Node

The legacy monolithic `NextLead.node.ts` has been replaced with this modular architecture for better maintainability and following SRP principles.

### Benefits

- **Maintainability**: Each resource is isolated and can be modified independently
- **Testability**: Easier to write unit tests for individual components
- **Extensibility**: Adding new resources or operations is straightforward
- **Performance**: Only load the nodes you need
- **Code Quality**: Follows SOLID principles and clean architecture

## Support

For issues or questions, please refer to the NextLead API documentation or contact support.