# HMPPS Document Generation UI

[![Ministry of Justice Repository Compliance Badge](https://github-community.service.justice.gov.uk/repository-standards/api/hmpps-document-generation-ui/badge?style=flat)](https://github-community.service.justice.gov.uk/repository-standards/hmpps-document-generation-ui)
[![Docker Repository on ghcr](https://img.shields.io/badge/ghcr.io-repository-2496ED.svg?logo=docker)](https://ghcr.io/ministryofjustice/hmpps-document-generation-ui)

The reference UI for the [HMPPS Document Generation API](https://github.com/ministryofjustice/hmpps-document-generation-api). Allows prison staff to generate Word documents from templates pre-populated with prisoner, prison, and absence data.

The UI serves two purposes:

- **Template administration** — BAs and developers upload, configure, and test templates before they are promoted to higher environments
- **Document generation** — prison staff select a template, review pre-populated variable values, and download the generated document

Both the API and this UI are designed as shared DPS capabilities, currently used exclusively by the **Receptions and External Movements** product set.

## Supported queries for Document Generation

Other UI services are expected to redirect to `/download-document/:document-id` of this UI for document generation.

The following queries are supported:

|property key |           value           |                         retrieved variables                          |
| :-----: |:-------------------------:|:--------------------------------------------------------------------:|
|prisonId |         agency ID         |       retrieve Prison/Agency data from Prison Register Service       |
|prisonNumber |      prison numnber       |         retrieve prisoner data from Prisoner Search Service          |
| absenceId | temporary absence plan ID | retrieve temporary absence plan data from External Movements Service |

If additional variables are to be added, they can be updated in [document-document/utils.ts](/server/routes/download-document/utils.ts)

Two more query properties are supported:
1. `backTo`: URL for the back link
2. `returnTo`: URL for exit button on the bottom of the page

The URLs must be added to [permittedRedirect.ts](/server/utils/permittedRedirect.ts) to be allowed.

## Getting Started

### Installation

```bash
npm run setup
```

### Configuration

Create a copy of the `.env.example` file:

```bash
cp .env.example .env
```

Update the environment variables in `.env` to match your environment.

### Running locally

```bash
docker compose pull
docker compose up
```

Or run the application directly with auto-restart on changes:

```bash
npm run start:dev
```

The application will be available at http://localhost:3000

## Development

### Build

```bash
npm run build
```

### Run tests

#### Unit tests

```bash
npm run test
```

#### Integration tests

Start the WireMock instance:

```bash
docker compose -f docker-compose-test.yml up
```

Install Playwright if not previously installed:

```bash
npm run int-test-init:ci
```

Run in headless mode:

```bash
npm run start-feature:dev
npm run int-test
```

Or with the Playwright UI:

```bash
npm run int-test-ui
```

### Code quality

```bash
npm run lint
npm run lint-fix
npm run typecheck
```

### Syncing API types with Swagger

Run the following to pull the latest type definitions from the Document Generation API:

```bash
npm run swagger
```

This regenerates `server/@types/documentGeneration/index.d.ts` from the dev environment API docs.

## Template deployment

Templates are authored and tested in dev using this UI. Once ready, a developer adds the template code to the API's `service.include-templates` config, and the template is pulled automatically into higher environments on startup.

See the [Document Generation API README](https://github.com/ministryofjustice/hmpps-document-generation-api) for a full description of the deployment process.

## Deployment

This application is deployed to the Cloud Platform using Helm charts in `helm_deploy/`:

- Dev: [values-dev.yaml](helm_deploy/values-dev.yaml)
- Pre-production: [values-preprod.yaml](helm_deploy/values-preprod.yaml)
- Production: [values-prod.yaml](helm_deploy/values-prod.yaml)

## Project structure

```
├── server/
│   ├── routes/          # Route controllers and views
│   ├── services/        # API client services
│   ├── data/            # Data access layer
│   ├── middleware/      # Express middleware
│   └── @types/          # Generated API type definitions
├── integration_tests/   # Playwright integration tests
├── esbuild/             # Build configuration
└── helm_deploy/         # Kubernetes deployment configs
```

## Change log

A changelog for the service is available [here](./CHANGELOG.md)
