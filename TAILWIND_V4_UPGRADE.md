# Tailwind CSS v4 Upgrade Guide

## Prerequisites

You need Node.js v18.12 or higher to use Tailwind CSS v4. Currently you have v16.20.2.

## Steps to Complete the Upgrade

### 1. Upgrade Node.js

First, upgrade Node.js to v18.12 or higher. You can use:
- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)
- [Volta](https://volta.sh/)
- Or download directly from [nodejs.org](https://nodejs.org/)

### 2. Install Tailwind CSS v4

```bash
pnpm add tailwindcss@next
```

### 3. Update Dependencies

```bash
pnpm add @tailwindcss/typography@next tailwindcss-animate@next
```

### 4. Run the Migration Tool

```bash
npx @tailwindcss/upgrade
```

This will automatically:
- Update your `globals.css` file to use the new `@import "tailwindcss"` syntax
- Convert your theme configuration to CSS variables
- Update your config file

### 5. Verify the Changes

The migration tool should have updated your files. Key changes:

#### globals.css
- Uses `@import "tailwindcss"` instead of `@tailwind` directives
- Theme configuration moved to `@theme` and `@theme dark` blocks
- CSS variables use `--color-` prefix instead of `--`

#### tailwind.config.ts
- Minimal configuration with only content paths and plugins
- Theme configuration moved to CSS

### 6. Test Your Application

```bash
pnpm dev
```

Check that:
- Dark mode still works correctly
- All components render properly
- No console errors

### 7. Update Any Custom CSS

If you have any custom CSS that references the old variable names, update them:
- `--background` → `--color-background`
- `--foreground` → `--color-foreground`
- etc.

## Key Changes in Tailwind v4

1. **CSS-based Configuration**: Theme configuration is now in CSS using `@theme` directives
2. **Improved Performance**: Faster build times and smaller bundle sizes
3. **Better TypeScript Support**: Improved type safety
4. **Simplified Setup**: Less configuration needed

## Troubleshooting

If you encounter issues:

1. **Theme not working**: Check that the `@theme` and `@theme dark` blocks are properly formatted
2. **Missing styles**: Ensure all content paths are correct in `tailwind.config.ts`
3. **Build errors**: Check that all plugins are compatible with v4

## Current Status

✅ **Prepared**: Your code is ready for the upgrade
⏳ **Pending**: Node.js upgrade and package installation
⏳ **Pending**: Running the migration tool

Once you upgrade Node.js, you can run the commands above to complete the migration.