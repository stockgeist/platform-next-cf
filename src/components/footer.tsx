import Link from 'next/link'
import ThemeSwitch from '@/components/theme-switch'
import { SITE_NAME } from '@/constants'
import { Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-muted/60 dark:bg-muted/30 border-t shadow">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="py-6 md:py-8">
          {/* Responsive grid with better mobile spacing */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {/* Legal Links */}
            <div className="flex flex-col items-center space-y-3 md:items-start md:space-y-4">
              <h3 className="text-foreground text-center text-sm font-semibold md:text-left">
                Legal
              </h3>
              <ul className="flex flex-col items-center space-y-2 md:items-start">
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground text-center text-sm md:text-left"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground text-center text-sm md:text-left"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Info */}
            <div className="flex flex-col items-center space-y-3 md:items-start md:space-y-4">
              <h3 className="text-foreground text-center text-sm font-semibold md:text-left">
                Company
              </h3>
              <ul className="flex flex-col items-center space-y-2 md:items-start">
                <li>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-foreground text-center text-sm md:text-left"
                  >
                    Home
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Links and Theme Switch */}
            <div className="flex flex-col items-center space-y-3 md:items-start md:space-y-4">
              <h3 className="text-foreground text-center text-sm font-semibold md:text-left">
                Social
              </h3>
              <div className="flex items-center space-x-4">
                <a
                  href="https://www.linkedin.com/company/neurotechnology"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright - Optimized for mobile */}
          <div className="mt-6 border-t pt-6 md:mt-8 md:pt-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-4">
              <p className="text-muted-foreground text-center text-sm md:text-left">
                © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
              </p>

              <div className="flex flex-col items-center gap-4 md:flex-row md:space-x-4">
                <div className="flex items-center gap-4">
                  <ThemeSwitch />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// This component will be wrapped in Suspense
// async function GithubButton() {
//   const starsCount = await getGithubStars();

//   return (
//     <Button
//       variant="outline"
//       size="sm"
//       className="w-full md:w-auto h-9"
//       asChild
//     >
//       <a
//         href={GITHUB_REPO_URL!}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="flex items-center justify-center space-x-2"
//       >
//         <GithubIcon className="h-4 w-4" />
//         <span className="whitespace-nowrap">
//           {starsCount
//             ? `Fork on Github (${starsCount} Stars)`
//             : "Fork on Github"}
//         </span>
//       </a>
//     </Button>
//   );
// }

// Fallback while loading stars count
// function GithubButtonFallback() {
//   return (
//     <Button
//       variant="outline"
//       size="sm"
//       className="w-full md:w-auto h-9"
//       asChild
//     >
//       <a
//         href={GITHUB_REPO_URL!}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="flex items-center justify-center space-x-2"
//       >
//         <GithubIcon className="h-4 w-4" />
//         <span className="whitespace-nowrap">Fork on Github</span>
//       </a>
//     </Button>
//   );
// }
