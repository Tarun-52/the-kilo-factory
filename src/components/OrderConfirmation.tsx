'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/store'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const STEPS = ['Placed', 'Confirmed', 'Preparing', 'Dispatched', 'Delivered']

export default function OrderConfirmation() {
  const confirmedOrderId = useAppStore((s) => s.confirmedOrderId)
  const goToOrderTracking = useAppStore((s) => s.goToOrderTracking)
  const goToHome = useAppStore((s) => s.goToHome)

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full border-border shadow-lg overflow-hidden">
        <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center text-center space-y-6">
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
              <CheckCircle2 className="size-20 text-green-500 relative" strokeWidth={1.5} />
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-2"
          >
            <h1 className="font-royal text-3xl font-bold text-bark">
              Order Placed Successfully!
            </h1>
            {confirmedOrderId && (
              <p className="text-muted-foreground text-sm font-mono">
                Order ID:{' '}
                <span className="font-semibold text-bark">{confirmedOrderId.slice(0, 12)}...</span>
              </p>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground text-sm leading-relaxed max-w-sm"
          >
            Your order is being prepared. We&apos;ll update you on the status.
          </motion.p>

          <Separator className="w-full" />

          {/* Status Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Order Progress
            </p>
            <div className="flex items-center justify-between w-full">
              {STEPS.map((step, idx) => (
                <div key={step} className="flex items-center flex-1 last:flex-initial">
                  {/* Step circle */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        idx === 0
                          ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {idx === 0 ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={`text-[10px] leading-tight text-center max-w-[56px] ${
                        idx === 0 ? 'text-green-700 font-semibold' : 'text-muted-foreground'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {/* Connector line */}
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-1 mt-[-18px]">
                      <div
                        className={`h-full rounded-full transition-colors ${
                          idx === 0 ? 'bg-green-400' : 'bg-border'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <Separator className="w-full" />

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="w-full space-y-3"
          >
            {confirmedOrderId && (
              <Button
                onClick={() => goToOrderTracking(confirmedOrderId)}
                className="w-full bg-maroon hover:bg-maroon-light text-ivory font-semibold"
                size="lg"
              >
                Track Order
              </Button>
            )}
            <Button
              variant="outline"
              onClick={goToHome}
              className="w-full border-maroon/30 text-maroon hover:bg-maroon/5 font-semibold"
              size="lg"
            >
              Continue Ordering
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}