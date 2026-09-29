# Contributing

## Before You Start

- Search the [open and closed issues](https://github.com/TanStack/store/issues?q=is%3Aissue) before reporting a bug. If it has not already been reported, use the [bug report template](https://github.com/TanStack/store/issues/new?template=bug_report.yml).
- Search the [open and closed pull requests](https://github.com/TanStack/store/pulls?q=is%3Apr) before starting work to avoid duplicating an existing contribution.
- Discuss significant features, API changes, and refactors with the maintainers in an issue before implementing them.

## Pull Request Guidelines

Every pull request must follow the [TanStack Store pull request template](.github/pull_request_template.md). Complete its description and checklist without removing or bypassing the required sections.

- Keep each pull request focused on one change or topic. Pull requests that combine unrelated changes will be closed with a request to split them into separately reviewable contributions.
- Write a concise description that clearly explains what changed and why. Follow the sections in the pull request template; a long, unstructured description makes a contribution harder to review.
- You may use AI tools to help generate code, but you remain responsible for understanding, testing, and verifying every submitted change. Do not submit unreviewed, low-quality, or irrelevant generated code.
- Do not mass-submit unrelated or low-quality AI-generated pull requests. We treat that behavior as spam and may close the pull requests, block the contributor, and report the GitHub account.
- Every change that affects a published package must include a changeset. Create it with `pnpm changeset`; documentation, CI, and development-only changes do not require one.

## Development Workflow

- Clone the repo
  - `gh repo clone TanStack/store`
- Ensure `node` is installed
  - https://nodejs.org/en/
- Ensure `pnpm` is installed
  - https://pnpm.io/installation
  - Why? We use `pnpm` to manage workspace dependencies. It's easily the best monorepo/workspace experience available as of when this was written.
- Install dependencies
  - `pnpm install`
  - This installs dependencies for all of the packages in the monorepo, even examples!
  - Dependencies inside of the packages and examples are automatically linked together as local/dynamic dependencies.
- Run the build or dev watcher
  - `pnpm build` or
  - `pnpm dev`
- Navigate to an example
  - `cd examples/react/basic`
- Run the example
  - `pnpm dev`
- Make changes to the code
  - If you ran `pnpm dev` the dev watcher will automatically rebuild the code that has changed
