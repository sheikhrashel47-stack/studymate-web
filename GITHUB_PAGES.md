# StudyMate on GitHub Pages

This repository can be served as a static browser website from the checked-in `docs/` folder.

## Publish it from GitHub

1. Open the repository **Settings** page.
2. Open **Pages** in the left menu.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the `main` branch and the `/docs` folder, then save.
5. GitHub will show the public website address after deployment. The expected address is `https://sheikhrashel47-stack.github.io/studymate-web/`.

## Rebuild after changing the site

Run `pnpm build:github-pages`, then commit and push the updated `docs/` folder.
