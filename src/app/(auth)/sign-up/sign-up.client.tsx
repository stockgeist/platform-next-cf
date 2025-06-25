'use client'

import { signUpAction } from './sign-up.actions'
import { type SignUpSchema, signUpSchema } from '@/schemas/signup.schema'
import {
  type PasskeyEmailSchema,
  passkeyEmailSchema,
} from '@/schemas/passkey.schema'
import {
  startPasskeyRegistrationAction,
  completePasskeyRegistrationAction,
} from './passkey-sign-up.actions'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SeparatorWithText from '@/components/separator-with-text'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { Captcha } from '@/components/captcha'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'
import Link from 'next/link'
import SSOButtons from '../_components/sso-buttons'
import { useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'
import { KeyIcon } from 'lucide-react'
import { useConfigStore } from '@/state/config'
import { REDIRECT_AFTER_SIGN_IN } from '@/constants'

interface SignUpClientProps {
  redirectPath: string
}

const SignUpPage = ({ redirectPath }: SignUpClientProps) => {
  const { isTurnstileEnabled } = useConfigStore()
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const { execute: signUp } = useServerAction(signUpAction, {
    onError: (error) => {
      toast.dismiss()
      toast.error(error.err?.message)
    },
    onStart: () => {
      toast.loading('Creating your account...')
    },
    onSuccess: () => {
      toast.dismiss()
      toast.success('Account created successfully')
      window.location.href = redirectPath || REDIRECT_AFTER_SIGN_IN
    },
  })

  const { execute: completePasskeyRegistration } = useServerAction(
    completePasskeyRegistrationAction,
    {
      onError: (error) => {
        toast.dismiss()
        toast.error(error.err?.message)
        setIsRegistering(false)
      },
      onSuccess: () => {
        toast.dismiss()
        toast.success('Account created successfully')
        window.location.href = redirectPath || REDIRECT_AFTER_SIGN_IN
      },
    },
  )

  const { execute: startPasskeyRegistration } = useServerAction(
    startPasskeyRegistrationAction,
    {
      onError: (error) => {
        toast.dismiss()
        toast.error(error.err?.message)
        setIsRegistering(false)
      },
      onStart: () => {
        toast.loading('Starting passkey registration...')
        setIsRegistering(true)
      },
      onSuccess: async (response) => {
        toast.dismiss()
        if (!response?.data?.optionsJSON) {
          toast.error('Failed to start passkey registration')
          setIsRegistering(false)
          return
        }

        try {
          const attResp = await startRegistration({
            optionsJSON: response.data.optionsJSON,
            useAutoRegister: true,
          })
          await completePasskeyRegistration({ response: attResp })
        } catch (error: unknown) {
          console.error('Failed to register passkey:', error)
          toast.error('Failed to register passkey')
          setIsRegistering(false)
        }
      },
    },
  )

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  })

  const passkeyForm = useForm<PasskeyEmailSchema>({
    resolver: zodResolver(passkeyEmailSchema),
  })

  const captchaToken = useWatch({ control: form.control, name: 'captchaToken' })
  const passkeyCaptchaToken = useWatch({
    control: passkeyForm.control,
    name: 'captchaToken',
  })

  const onSubmit = async (data: SignUpSchema) => {
    signUp(data)
  }

  const onPasskeySubmit = async (data: PasskeyEmailSchema) => {
    startPasskeyRegistration(data)
  }

  return (
    <div className="bg-background my-6 flex min-h-[90vh] items-center justify-center px-4 md:my-10">
      <div className="border-border bg-card w-full max-w-md space-y-8 rounded-xl border p-6 shadow-lg md:p-10">
        <div className="text-center">
          <h2 className="text-foreground mt-6 text-2xl font-bold tracking-tight md:text-3xl">
            Create your account
          </h2>
          <p className="text-muted-foreground mt-2">
            Already have an account?{' '}
            <Link
              href={`/sign-in?redirect=${encodeURIComponent(redirectPath)}`}
              className="text-primary hover:text-primary/90 font-medium underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <SSOButtons />

          <Button
            className="w-full"
            onClick={() => setIsPasskeyModalOpen(true)}
          >
            <KeyIcon className="mr-2 h-5 w-5" />
            Sign up with a Passkey
          </Button>
        </div>

        <SeparatorWithText>
          <span className="text-muted-foreground uppercase">Or</span>
        </SeparatorWithText>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email address"
                      className="w-full px-3 py-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="First Name"
                      className="w-full px-3 py-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Last Name"
                      className="w-full px-3 py-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      className="w-full px-3 py-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col items-center justify-center">
              <Captcha
                onSuccess={(token) => form.setValue('captchaToken', token)}
                validationError={form.formState.errors.captchaToken?.message}
              />

              <Button
                type="submit"
                className="mt-8 flex w-full justify-center py-2.5"
                disabled={Boolean(isTurnstileEnabled && !captchaToken)}
              >
                Create Account with Password
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-6">
          <p className="text-muted-foreground text-center text-xs">
            By signing up, you agree to our{' '}
            <Link
              href="/terms"
              className="text-primary hover:text-primary/90 font-medium underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-primary hover:text-primary/90 font-medium underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={isPasskeyModalOpen} onOpenChange={setIsPasskeyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign up with a Passkey</DialogTitle>
          </DialogHeader>
          <Form {...passkeyForm}>
            <form
              onSubmit={passkeyForm.handleSubmit(onPasskeySubmit)}
              className="mt-6 space-y-6"
            >
              <FormField
                control={passkeyForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email address"
                        className="w-full px-3 py-2"
                        disabled={isRegistering}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passkeyForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="First Name"
                        className="w-full px-3 py-2"
                        disabled={isRegistering}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passkeyForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Last Name"
                        className="w-full px-3 py-2"
                        disabled={isRegistering}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col items-center justify-center">
                <Captcha
                  onSuccess={(token) =>
                    passkeyForm.setValue('captchaToken', token)
                  }
                  validationError={
                    passkeyForm.formState.errors.captchaToken?.message
                  }
                />

                <Button
                  type="submit"
                  className="mt-8 w-full"
                  disabled={
                    isRegistering ||
                    Boolean(isTurnstileEnabled && !passkeyCaptchaToken)
                  }
                >
                  {isRegistering ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Registering...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
              {!isRegistering && (
                <p className="text-muted mt-4 text-center text-xs">
                  After clicking continue, your browser will prompt you to
                  create and save your Passkey. This will allow you to sign in
                  securely without a password in the future.
                </p>
              )}
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SignUpPage
