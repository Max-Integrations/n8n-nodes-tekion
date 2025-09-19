# @autolytics/n8n-nodes-tekion

This is an n8n community node that provides integration with the Tekion 2.0 API for automotive dealership management.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Table of Contents

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Configuration](#configuration)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Vehicle Inventory

- **Get Many** - Retrieve vehicle inventory with filtering options
  - Filter by status (Cancelled, Draft, Float, Invoiced, In Transit, On Hold, On Order, Sold, Stocked In, Tentative, Transferred Out)
  - Filter by modified start date
  - Filter by stock type (Demo, New, Special, Used)

### Deals

- **Get Many** - Retrieve deals from the Tekion system

## Credentials

This node requires Tekion API credentials to authenticate with the Tekion 2.0 API.

### Required Credentials

1. **App ID** - Your Tekion application ID
2. **App Secret** - Your Tekion application secret
3. **Account Type** - Choose between Production or Sandbox environment

### Getting Tekion Credentials

To obtain your Tekion API credentials:

1. Contact Tekion support to request API access
2. Provide your dealership information and integration requirements
3. Tekion will provide you with:
   - App ID
   - App Secret
   - Access to either production or sandbox environment

For more information, visit the [Tekion Developer Documentation](https://docs.tekioncloud.com).

## Configuration

### Node Parameters

- **Dealer ID** - Your Tekion dealer identifier (e.g., `techmotors_4_0`)
- **Environment** - Choose between Production or Sandbox
- **Resource** - Select the resource type (Vehicle Inventory or Deals)
- **Action** - Choose the specific operation to perform

### Vehicle Inventory Filters

When working with vehicle inventory, you can apply multiple filters:

- **Status Filter** - Filter vehicles by their current status
- **Modified Start Date** - Filter vehicles modified after a specific date
- **Stock Type** - Filter by vehicle stock type (Demo, New, Special, Used)

## Compatibility

- Compatible with n8n@1.60.0 or later
- Requires Tekion 2.0 API access

## Usage

### Basic Vehicle Inventory Retrieval

1. Add the Tekion node to your workflow
2. Configure your Tekion credentials
3. Set your Dealer ID
4. Select "Vehicle Inventory" as the resource
5. Choose "Get Many" as the action
6. Optionally add filters to narrow down results
7. Execute the workflow

### Example Workflow

```json
{
	"nodes": [
		{
			"name": "Tekion Vehicle Inventory",
			"type": "@autolytics/n8n-nodes-tekion",
			"parameters": {
				"dealerId": "your_dealer_id",
				"environment": "production",
				"resource": "vehicleInventory",
				"action": "getMany",
				"filters": {
					"filter": [
						{
							"field": "status",
							"status": "SOLD"
						},
						{
							"field": "stockType",
							"stockType": "USED"
						}
					]
				}
			}
		}
	]
}
```

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Tekion Developer Documentation](https://docs.tekioncloud.com)
- [Tekion API Reference](https://docs.tekioncloud.com/openapi)

## Support

For issues related to this n8n node, please create an issue in the [GitHub repository](https://github.com/Max-Integrations/n8n-nodes-tekion).

For Tekion API-related questions, contact Tekion support through their official channels.
