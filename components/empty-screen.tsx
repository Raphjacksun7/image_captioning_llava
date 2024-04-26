import { UseChatHelpers } from 'ai/react'
import { ExternalLink } from '@/components/external-link'
import Image from 'next/image'

const imageFilenames = ['24-fifty.jpg', 'noyades.jpeg', 'sensitive-person.jpg']

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-center text-lg  font-semibold">Welcome to SecureScan!</h1>
        <p className="mb-2 leading-normal text-center text-muted-foreground">
          SecureScan built with{' '}
          <ExternalLink href="https://llava-vl.github.io/">LLaVA</ExternalLink>.
        </p>
        <p className="leading-normal text-center text-muted-foreground">
          You can start a scan by uploading an image
        </p>

        <div className="bg-gradient-to-b from-bg-300/0 to-bg-300/80 shadow-[0_0_24px_var(--tw-shadow-color)] shadow-accent-secondary-100/10 mt-8 md:-ml-4 md:-mr-4 pt-6 pb-5 px-5 border-0.5 border-accent-secondary-200 rounded-2xl text-center relative">
          <h2 className="text-xl text-text-100 font-tiempos tracking-tight px-4 pt-3 sm:pt-1.5 pb-2 leading-6">
            You can start a scan by uploading an image
          </h2>
          <div
            className="flex flex-col sm:flex-row gap-1 justify-between items-center sm:items-stretch pb-px"
            style={{ opacity: 1 }}
          >
            {imageFilenames.map((filename, index) => (
              <div key={index}>
                <button
                  className="flex w-full flex-col items-center p-2.5 relative group"
                  style={{ opacity: 1, transform: 'none' }}
                >
                  <div className="group-hover:opacity-100 group-hover:scale-100 opacity-0 scale-95 duration-200 transition-all absolute inset-0 border-0.5 border-border-300 rounded-xl bg-gradient-to-b from-bg-000/80 via-bg-100/80 to-bg-100/20 pointer-events-none"></div>
                  <Image
                    src={`/images/${filename}`}
                    alt={`Image ${index}`}
                    width={170}
                    height={720}
                    className="bg-bg-500 w-fill object-cover h-24 block rounded-lg shadow-sm scale-[0.975] group-hover:scale-[1] will-change-transform border-0.5 border-border-300 transition-transform"
                  />
                  {/* <div className="text-[0.8125rem] font-medium leading-4 tracking-tight font-styrene mt-2 px-2 pb-0.5 text-text-200 transition-colors group-hover:text-text-100 relative z-[1]">
                    Understand complex image
                  </div> */}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
