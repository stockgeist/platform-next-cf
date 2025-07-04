import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid Verification Link</CardTitle>
          <CardDescription>
            The verification link you clicked is invalid or has expired. This
            can happen if:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            <li>
              The link has expired (verification links are valid for 24 hours)
            </li>
            <li>You&apos;ve already verified your email</li>
            <li>The link was modified or is incomplete</li>
          </ul>

          <div className="space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
