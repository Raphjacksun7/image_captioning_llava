import * as React from 'react'
import { UseChatHelpers } from 'ai/react'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { IconPlus, IconUpload } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string | File) => void
  onImageUpload: (file: File) => void
  isLoading: boolean
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const router = useRouter()

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (input?.trim()) {
          setInput('')
          await onSubmit(input)
        }
      }}
      ref={formRef}
    >
      <div className="relative min-h-[60px] flex flex-col w-full px-8 overflow-hidden max-h-60 grow bg-background sm:rounded-md  sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={e => {
                e.preventDefault()
                router.refresh()
                router.push('/')
              }}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'absolute left-0 top-4 size-8 rounded-full bg-background p-0 sm:left-4'
              )}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <div className="absolute right-0 top-4 sm:right-4 flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={async e => {
              const file = e.target.files?.[0]
              if (file) {
                await onSubmit(file)
              }
            }}
            className="hidden"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              {isLoading ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconUpload className="mr-2" />
                  Upload Image
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent>Upload Image</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
