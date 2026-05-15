import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { env } from '@/env'
import { shortAddr } from '@/lib/sui/format'

const FALLBACK_DEPOSIT_ADDRESS =
  '0x3935bbb26c147851285c0fd76c712e5ccc7669908c2327a1301db52563b12e71'

const depositAddress =
  env.VITE_DEEPBOOK_DUSDC_DONATION_ADDRESS ?? FALLBACK_DEPOSIT_ADDRESS

const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=112x112&margin=0&data=${encodeURIComponent(depositAddress)}`

export function DonationPanel() {
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    await navigator.clipboard.writeText(depositAddress)
    setCopied(true)
    toast.success('Deposit address copied', { id: 'deposit-address' })
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="w-full border border-white/10 bg-white/[0.03] p-2.5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-medium text-white">Donate</h3>
          <p className="mt-1 text-[11px] leading-4 text-white/45">
            Please help keep the vault alive.
          </p>
        </div>
        <span className="border border-white/10 px-2 py-1 font-mono text-[10px] uppercase text-white/45">
          DUSDC
        </span>
      </div>

      <div className="grid grid-cols-[80px_1fr] gap-2.5">
        <div className="aspect-square w-20 border border-white/10 bg-white p-1">
          <img
            src={qrSrc}
            width={72}
            height={72}
            alt="DUSDC deposit address QR"
            className="aspect-square h-full w-full"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-xs text-white">
            {shortAddr(depositAddress, 8, 6)}
          </div>
          <p className="mt-1 text-[11px] leading-4 text-white/45">
            Send DUSDC to this address.
          </p>
          <button
            type="button"
            onClick={copyAddress}
            className="mt-2 inline-flex h-7 items-center gap-1.5 border border-white/12 px-2 text-[11px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/70"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            Copy
          </button>
        </div>
      </div>
    </section>
  )
}
